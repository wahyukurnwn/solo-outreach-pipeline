import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { Loader } from "#/components/loader";
import { useGoogleExchange } from "#/modules/auth/hooks/use-google-exchange";

export const Route = createFileRoute("/auth/callback/google/")({
	validateSearch: (search: Record<string, unknown>): { code?: string } => {
		if (typeof search.code === "string") return { code: search.code };
		return {};
	},
	component: GoogleCallbackPage,
});

function GoogleCallbackPage() {
	const { code } = Route.useSearch();
	const navigate = useNavigate();
	const exchange = useGoogleExchange();
	// Effect harus jalan cuma sekali walau code sama — StrictMode double-invoke
	// efek di dev akan bikin kode sekali-pakai dari backend habis di percobaan
	// pertama dan gagal di percobaan kedua kalau tidak dijaga ref ini.
	const hasStarted = useRef(false);

	useEffect(() => {
		if (!code) {
			navigate({ to: "/auth/signin" });
			return;
		}

		if (hasStarted.current) return;
		hasStarted.current = true;

		exchange.mutate(code, {
			onSuccess: () => navigate({ to: "/dashboard" }),
			onError: (err) => {
				toast.error(err.message);
				navigate({ to: "/auth/signin" });
			},
		});
	}, [code, navigate, exchange.mutate]);

	return (
		<div className="flex min-h-screen items-center justify-center bg-paper">
			<Loader className="size-8" />
		</div>
	);
}
