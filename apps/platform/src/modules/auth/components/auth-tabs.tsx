import type { AuthMode } from "#/modules/auth/components/auth-form";

interface AuthTabsProps {
	mode: AuthMode;
	onChange: (mode: AuthMode) => void;
}

const tabs: { mode: AuthMode; label: string }[] = [
	{ mode: "signin", label: "Sign In" },
	{ mode: "signup", label: "Sign Up" },
];

export const AuthTabs = ({ mode, onChange }: AuthTabsProps) => {
	return (
		<div className="flex rounded-xl bg-sidebar p-1">
			{tabs.map((tab) => (
				<button
					key={tab.mode}
					type="button"
					aria-pressed={mode === tab.mode}
					onClick={() => onChange(tab.mode)}
					className={`h-9 flex-1 rounded-lg text-sm font-semibold transition-all ${
						mode === tab.mode
							? "bg-white text-ink shadow-[0_1px_2px_rgba(45,42,38,0.08),0_1px_1px_rgba(45,42,38,0.04)]"
							: "text-muted hover:text-ink"
					}`}
				>
					{tab.label}
				</button>
			))}
		</div>
	);
};
