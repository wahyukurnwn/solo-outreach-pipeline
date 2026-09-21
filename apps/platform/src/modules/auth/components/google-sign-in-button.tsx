import toast from "react-hot-toast";
import { useGoogleSignIn } from "../hooks/use-google-signin";
import { GoogleIcon } from "./google-icon";

export const GoogleSignInButton = () => {
	const googleSignIn = useGoogleSignIn();

	const handleClick = () => {
		googleSignIn().catch((err: Error) => toast.error(err.message));
	};

	return (
		<button
			type="button"
			onClick={handleClick}
			className="flex h-11 w-full items-center justify-center gap-2.5 rounded-xl border border-line bg-white px-4 text-sm font-semibold text-ink shadow-[0_1px_2px_rgba(45,42,38,0.05),0_6px_16px_-8px_rgba(45,42,38,0.18)] transition-all hover:-translate-y-px hover:border-line-strong"
		>
			<GoogleIcon />
			Continue with Google
		</button>
	);
};
