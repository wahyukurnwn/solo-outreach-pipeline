interface SectionHeaderProps {
	title: string;
	icon?: React.ReactNode;
	// ReactNode, bukan prop "href"/"to" — packages/ui tidak boleh tahu router
	// mana yang dipakai app pemanggil (TanStack Router di apps/platform belum
	// tentu sama di apps/admin nanti). App pemanggil yang decide mau render
	// <Link>, <a>, atau tombol biasa di slot ini.
	action?: React.ReactNode;
}

export const SectionHeader = ({ title, icon, action }: SectionHeaderProps) => (
	<div className="flex items-center justify-between gap-3">
		<div className="flex items-center gap-2.5">
			{icon}
			<h2 className="text-base font-bold text-ink">{title}</h2>
		</div>
		{action}
	</div>
);
