import type { FC } from "react";

import { cn } from "@/utils/cn";

interface EmptyStateProps {
	description: string;
	showIcon?: boolean;
	title: string;
}

export const EmptyState: FC<EmptyStateProps> = ({
	description,
	showIcon = false,
	title,
}) => {
	return (
		<div className="flex flex-1 flex-col items-center justify-center px-9 text-center py-5">
			<div
				className={cn(
					"mb-4.5 flex size-23 items-center justify-center rounded-full bg-earn/12 dark:bg-earn-dark/12",
					{ hidden: !showIcon },
				)}
			>
				<span className="text-earn dark:text-earn-dark">
					<svg
						aria-hidden="true"
						fill="none"
						height="40"
						stroke="currentColor"
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth="1.8"
						viewBox="0 0 24 24"
						width="40"
					>
						<line x1="4" x2="4" y1="20" y2="10" />
						<line x1="12" x2="12" y1="20" y2="4" />
						<line x1="20" x2="20" y1="20" y2="14" />
					</svg>
				</span>
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
