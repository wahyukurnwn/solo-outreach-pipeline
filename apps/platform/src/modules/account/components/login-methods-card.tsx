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
				toast.success("Akun Google dilepas");
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
				title="Metode login"
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
					status={me.hasPassword ? "Aktif" : "Belum dibuat"}
					isActive={me.hasPassword}
					action={
						me.hasPassword ? (
							<button
								type="button"
								disabled={!hasBothMethods}
								onClick={() => setIsRemovePasswordOpen(true)}
								className={dangerSoftButtonClassName}
							>
								Hapus password
							</button>
						) : (
							<Link to="/auth/forgot-password" className={softButtonClassName}>
								Buat password
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
					status={me.hasGoogle ? "Terhubung" : "Belum terhubung"}
					isActive={me.hasGoogle}
					action={
						me.hasGoogle ? (
							<button
								type="button"
								disabled={!hasBothMethods}
								onClick={() => setIsUnlinkGoogleOpen(true)}
								className={dangerSoftButtonClassName}
							>
								Lepas Google
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
								Hubungkan
							</button>
						)
					}
				/>
			</ul>

			<div className="flex flex-col gap-1.5 text-xs leading-relaxed text-muted">
				{hasBothMethods ? null : (
					<p>
						Akun harus selalu punya minimal satu cara masuk — tambahkan metode
						lain dulu sebelum menghapus yang sekarang.
					</p>
				)}
				{me.hasGoogle ? null : (
					<p>
						Akun Google baru tertaut kalau email-nya sama dengan{" "}
						<span className="font-semibold text-ink-soft">
							{maskEmail(me.email)}
						</span>
						. Email Google yang berbeda akan membuat akun terpisah.
					</p>
				)}
				{me.hasPassword ? null : (
					<p>
						"Buat password" mengirim link ke email Anda, sama seperti alur lupa
						password.
					</p>
				)}
			</div>

			<RemovePasswordDialog
				open={isRemovePasswordOpen}
				onClose={() => setIsRemovePasswordOpen(false)}
			/>
			<AlertDialog
				open={isUnlinkGoogleOpen}
				title="Lepas akun Google?"
				description={`Setelah dilepas, Anda hanya bisa masuk dengan email ${maskEmail(me.email)} dan password.`}
				confirmLabel={unlinkGoogle.isPending ? "Melepas..." : "Lepas Google"}
				onConfirm={handleUnlinkGoogle}
				onCancel={() => setIsUnlinkGoogleOpen(false)}
			/>
		</Card>
	);
};
