export const mailer = {
	// Provider email belum dipasang — log dulu supaya alur reset password bisa dites lokal.
	async sendPasswordResetEmail(to: string, resetUrl: string) {
		console.log(`[mailer] Kirim link reset password ke ${to}: ${resetUrl}`);
	},
};
