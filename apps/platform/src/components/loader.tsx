import { Loader2 } from "lucide-react";

interface LoaderProps {
	className?: string;
}

export const Loader = ({ className = "" }: LoaderProps) => (
	<Loader2 className={`size-4 animate-spin ${className}`} />
);
