import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { BrandMark } from "#/components/brand-mark";

interface AuthCardProps {
	title: string;
	description: string;
	children: React.ReactNode;
	footer?: React.ReactNode;
}

export const AuthCard = ({
	title,
	description,
	children,
	footer,
}: AuthCardProps) => (
	<div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-paper px-4 py-12">
		<div
			aria-hidden="true"
			className="glow-hero pointer-events-none absolute inset-0"
		/>

		<div className="relative w-full max-w-100">
			<div className="rounded-3xl border border-line bg-white p-7 shadow-[0_24px_60px_-32px_rgba(45,42,38,0.3),0_1px_2px_rgba(45,42,38,0.04)] sm:p-9">
				<div className="flex flex-col items-center text-center">
					<BrandMark size="lg" />
					<h1 className="mt-5 text-2xl font-bold tracking-tight text-ink">
						{title}
					</h1>
					<p className="mt-2 text-sm text-muted">{description}</p>
				</div>

				<div className="mt-7">{children}</div>

				{footer ? (
					<div className="mt-6 text-center text-sm">{footer}</div>
				) : null}
			</div>

			<Link
				to="/"
				className="mx-auto mt-6 flex w-fit items-center gap-1.5 text-[13px] font-medium text-muted transition-colors hover:text-ink"
			>
				<ArrowLeft className="size-3.5" />
				Kembali ke beranda
			</Link>
		</div>
	</div>
);
