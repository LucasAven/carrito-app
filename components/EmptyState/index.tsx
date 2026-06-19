import type { FC, ReactNode } from "react";

import { cn } from "@/utils/cn";

interface EmptyStateProps {
	accent: "brand" | "earn";
	description: string;
	icon: ReactNode;
	title: string;
}

const ACCENT_CLASSES = {
	brand: {
		circle: "bg-brand/12",
		icon: "text-brand",
	},
	earn: {
		circle: "bg-earn/12 dark:bg-earn-dark/12",
		icon: "text-earn dark:text-earn-dark",
	},
} as const;

export const EmptyState: FC<EmptyStateProps> = ({
	accent,
	description,
	icon,
	title,
}) => {
	const accentClasses = ACCENT_CLASSES[accent];

	return (
		<div
			className={cn(
				"flex flex-1 flex-col items-center justify-center px-9 text-center",
				accent === "brand" ? "py-5" : "pb-5",
			)}
		>
			<div
				className={cn(
					"mb-4.5 flex size-23 items-center justify-center rounded-full",
					accentClasses.circle,
				)}
			>
				<span className={accentClasses.icon}>{icon}</span>
			</div>
			<p className="font-display text-ink dark:text-ink-dark text-[21px] font-bold">
				{title}
			</p>
			<p className="text-muted dark:text-muted-dark mt-1.75 text-[14.5px] leading-[1.45] font-semibold">
				{description}
			</p>
		</div>
	);
};
