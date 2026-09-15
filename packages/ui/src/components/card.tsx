interface CardProps {
	children: React.ReactNode;
	className?: string;
}

export const Card = ({ children, className }: CardProps) => (
	<div
		className={`rounded-[20px] border border-line bg-white p-5 ${className ?? ""}`}
	>
		{children}
	</div>
);
