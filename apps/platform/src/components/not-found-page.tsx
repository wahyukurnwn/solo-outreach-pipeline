import { Link } from "@tanstack/react-router";
import { ArrowLeft, LayoutDashboard } from "lucide-react";
import { BrandMark } from "#/components/brand-mark";
import {
	primaryCtaClassName,
	secondaryCtaClassName,
} from "#/modules/landing/styles";

export const NotFoundPage = () => (
	<div className="relative flex min-h-[80vh] items-center justify-center overflow-hidden px-6 py-16">
		<div
			aria-hidden="true"
			className="glow-hero pointer-events-none absolute inset-0"
		/>

		<div className="relative flex max-w-md flex-col items-center text-center">
			<BrandMark size="lg" />
			<p className="mt-8 text-[88px] leading-none font-bold tracking-[-0.06em] text-lavender-700 sm:text-[112px]">
				404
			</p>
			<h1 className="mt-4 text-2xl font-bold tracking-tight text-ink sm:text-[28px]">
				Halaman tidak ditemukan
			</h1>
			<p className="mt-3 text-[15px] leading-relaxed text-pretty text-muted">
				Link-nya mungkin salah ketik, sudah dipindah, atau memang tidak pernah
				ada.
			</p>

			<div className="mt-8 flex flex-wrap items-center justify-center gap-3">
				<Link to="/" className={primaryCtaClassName}>
					<ArrowLeft className="size-4" />
					Kembali ke beranda
				</Link>
				<Link to="/dashboard" className={secondaryCtaClassName}>
					<LayoutDashboard className="size-4" />
					Buka dashboard
				</Link>
			</div>
		</div>
	</div>
);
