import { stageAvatarClass } from "../labels";
import type { Prospect } from "../types";

type AvatarSize = "md" | "lg";

interface ProspectAvatarProps {
	prospect: Pick<Prospect, "name" | "stage">;
	size?: AvatarSize;
}

const sizeClasses: Record<AvatarSize, string> = {
	md: "size-[38px] rounded-xl text-sm",
	lg: "size-[72px] rounded-[22px] text-3xl",
};

export const ProspectAvatar = ({
	prospect,
	size = "md",
}: ProspectAvatarProps) => (
	<span
		aria-hidden="true"
		className={`flex shrink-0 items-center justify-center font-bold uppercase ${sizeClasses[size]} ${stageAvatarClass[prospect.stage]}`}
	>
		{prospect.name.trim().charAt(0)}
	</span>
);
