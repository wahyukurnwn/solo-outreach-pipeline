import { IconBox } from "@mycustom/ui";

interface AuthCardProps {
	icon: React.ReactNode;
	title: string;
	description: string;
	children: React.ReactNode;
	footer?: React.ReactNode;
}

export const AuthCard = ({
	icon,
	title,
	description,
	children,
	footer,
}: AuthCardProps) => (
	<div className="flex min-h-screen items-center justify-center bg-paper p-4">
		<div className="w-full max-w-sm rounded-3xl border border-line bg-white p-8 shadow-[0_1px_2px_rgba(45,42,38,0.05)]">
			<div className="flex flex-col items-center text-center">
				<IconBox tone="lavender" size="xl">
					{icon}
				</IconBox>
				<h1 className="mt-4 text-xl font-bold text-ink">{title}</h1>
				<p className="mt-1 text-sm text-muted">{description}</p>
			</div>

			<div className="mt-6">{children}</div>

			{footer ? <div className="mt-5 text-center text-sm">{footer}</div> : null}
		</div>
	</div>
);
