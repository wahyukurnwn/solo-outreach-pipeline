import { AlertDialog, Card, IconBox, SectionHeader } from "@mycustom/ui";
import { Link } from "@tanstack/react-router";
import { Mail, ShieldCheck } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import {
	dangerSoftButtonClassName,
	softButtonClassName,
} from "#/components/form-styles";
import { maskEmail } from "#/libs/email-format";
import { GoogleIcon } from "#/modules/auth/components/google-icon";
import { useGoogleSignIn } from "#/modules/auth/hooks/use-google-signin";
import { useUnlinkGoogle } from "../hooks/use-unlink-google";
import type { Me } from "../types";
import { RemovePasswordDialog } from "./remove-password-dialog";

interface MethodRowProps {
	icon: React.ReactNode;
	title: string;
	status: string;
	isActive: boolean;
	action: React.ReactNode;
}

function MethodRow({ icon, title, status, isActive, action }: MethodRowProps) {
	return (
		<li className="flex flex-wrap items-center gap-3 px-4 py-3.5">
			{icon}
			<div className="min-w-0 flex-1">
				<p className="text-sm font-semibold text-ink">{title}</p>
				<p
					className={`text-[13px] ${isActive ? "font-medium text-mint-700" : "text-muted"}`}
				>
					{status}
				</p>
			</div>
			{action}
		</li>
	);
}

// Invariant ERD: setiap akun wajib punya minimal satu cara masuk. Backend tetap
// menolak (LAST_AUTH_METHOD), tombolnya dinonaktifkan di sini supaya user tahu
// sebelum mencoba, bukan setelah kena error.
export const LoginMethodsCard = ({ me }: { me: Me }) => {
	const [isRemovePasswordOpen, setIsRemovePasswordOpen] = useState(false);
	const [isUnlinkGoogleOpen, setIsUnlinkGoogleOpen] = useState(false);
	const unlinkGoogle = useUnlinkGoogle();
	const googleSignIn = useGoogleSignIn();
	const hasBothMethods = me.hasPassword && me.hasGoogle;

	function handleUnlinkGoogle() {
		if (unlinkGoogle.isPending) return;

		unlinkGoogle.mutate(undefined, {
			onSuccess: () => {
				toast.success("Google account unlinked");
				setIsUnlinkGoogleOpen(false);
			},
			onError: (err) => {
				toast.error(err.message);
				setIsUnlinkGoogleOpen(false);
			},
		});
	}

	return (
		<Card className="flex flex-col gap-4">
			<SectionHeader
				title="Sign-in methods"
				icon={
					<IconBox tone="mint">
						<ShieldCheck className="size-[15px]" />
					</IconBox>
				}
			/>

			<ul className="flex flex-col divide-y divide-line rounded-2xl border border-line">
				<MethodRow
					icon={
						<IconBox tone="lavender">
							<Mail className="size-4" />
						</IconBox>
					}
					title="Email & password"
					status={me.hasPassword ? "Active" : "Not set"}
					isActive={me.hasPassword}
					action={
						me.hasPassword ? (
							<button
								type="button"
								disabled={!hasBothMethods}
								onClick={() => setIsRemovePasswordOpen(true)}
								className={dangerSoftButtonClassName}
							>
								Remove password
							</button>
						) : (
							<Link to="/auth/forgot-password" className={softButtonClassName}>
								Set a password
							</Link>
						)
					}
				/>
				<MethodRow
					icon={
						<span className="flex size-[30px] shrink-0 items-center justify-center rounded-[10px] border border-line bg-white">
							<GoogleIcon />
						</span>
					}
					title="Google"
					status={me.hasGoogle ? "Connected" : "Not connected"}
					isActive={me.hasGoogle}
					action={
						me.hasGoogle ? (
							<button
								type="button"
								disabled={!hasBothMethods}
								onClick={() => setIsUnlinkGoogleOpen(true)}
								className={dangerSoftButtonClassName}
							>
								Unlink Google
							</button>
						) : (
							<button
								type="button"
								onClick={() => {
									googleSignIn().catch((err: Error) =>
										toast.error(err.message),
									);
								}}
								className={softButtonClassName}
							>
								Connect
							</button>
						)
					}
				/>
			</ul>

			<div className="flex flex-col gap-1.5 text-xs leading-relaxed text-muted">
				{hasBothMethods ? null : (
					<p>
						An account must always keep at least one way to sign in — add
						another method before removing the current one.
					</p>
				)}
				{me.hasGoogle ? null : (
					<p>
						A Google account only links if its email matches{" "}
						<span className="font-semibold text-ink-soft">
							{maskEmail(me.email)}
						</span>
						. A different Google email creates a separate account.
					</p>
				)}
				{me.hasPassword ? null : (
					<p>
						"Set a password" emails you a link, the same as the forgot-password
						flow.
					</p>
				)}
			</div>

			<RemovePasswordDialog
				open={isRemovePasswordOpen}
				onClose={() => setIsRemovePasswordOpen(false)}
			/>
			<AlertDialog
				open={isUnlinkGoogleOpen}
				title="Unlink Google account?"
				description={`After unlinking, you can only sign in with ${maskEmail(me.email)} and your password.`}
				confirmLabel={unlinkGoogle.isPending ? "Unlinking..." : "Unlink Google"}
				onConfirm={handleUnlinkGoogle}
				onCancel={() => setIsUnlinkGoogleOpen(false)}
			/>
		</Card>
	);
};
