interface PageHeaderProps {
	title: React.ReactNode;
	eyebrow?: React.ReactNode;
	description?: string;
	action?: React.ReactNode;
}

export const PageHeader = ({
	title,
	eyebrow,
	description,
	action,
}: PageHeaderProps) => (
	<div className="flex flex-wrap items-center justify-between gap-4">
		<div className="flex min-w-0 flex-col gap-1.5">
			{eyebrow ? (
				<span className="text-[13px] font-medium text-muted">{eyebrow}</span>
			) : null}
			<h1 className="text-[32px] leading-tight font-bold tracking-tight text-ink">
				{title}
			</h1>
			{description ? (
				<p className="text-[15px] text-muted">{description}</p>
			) : null}
		</div>
		{action}
	</div>
);
