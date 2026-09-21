import { env } from "../config/env";
import { ServiceUnavailableError } from "../exceptions";

function buildPasswordResetEmailHtml(resetUrl: string) {
	return `<!doctype html>
<html>
	<body style="margin:0;padding:32px 16px;background:#fbfaf7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
		<table role="presentation" width="100%" style="max-width:420px;margin:0 auto;background:#ffffff;border-radius:20px;border:1px solid #ece7dc;">
			<tr>
				<td style="padding:32px 28px;">
					<p style="margin:0 0 4px;font-size:20px;font-weight:800;color:#2d2a26;">Pipeline</p>
					<h1 style="margin:20px 0 8px;font-size:20px;font-weight:700;color:#2d2a26;">Reset your password</h1>
					<p style="margin:0 0 24px;font-size:14px;line-height:1.6;color:#6b6559;">
						Click the button below to set a new password. This link is valid for
						${env.passwordResetTtlMinutes} minutes — if you didn't request this, you can safely ignore this email.
					</p>
					<a href="${resetUrl}" style="display:inline-block;padding:12px 24px;background:#2d2a26;color:#ffffff;text-decoration:none;border-radius:10px;font-size:14px;font-weight:600;">
						Reset password
					</a>
					<p style="margin:24px 0 0;font-size:12px;line-height:1.6;color:#a39d8e;word-break:break-all;">
						Or copy this link: ${resetUrl}
					</p>
				</td>
			</tr>
		</table>
	</body>
</html>`;
}

async function sendViaResend(to: string, subject: string, html: string) {
	const res = await fetch("https://api.resend.com/emails", {
		method: "POST",
		headers: {
			Authorization: `Bearer ${env.resendApiKey}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ from: env.emailFrom, to, subject, html }),
	});

	if (!res.ok) {
		const body = await res.text();
		throw new Error(`Resend API error (${res.status}): ${body}`);
	}
}

export const mailer = {
	async sendPasswordResetEmail(to: string, resetUrl: string) {
		if (!env.resendApiKey) {
			// Di production, mailer diam-diam gagal itu lebih buruk daripada error
			// jelas — user tidak akan pernah tahu kenapa link reset tidak sampai.
			if (env.isProduction)
				throw new ServiceUnavailableError(
					"The email service is not configured",
					"EMAIL_NOT_CONFIGURED",
				);

			console.log(`[mailer] Sending password reset link to ${to}: ${resetUrl}`);
			return;
		}

		await sendViaResend(
			to,
			"Reset your Pipeline password",
			buildPasswordResetEmailHtml(resetUrl),
		);
	},
};
