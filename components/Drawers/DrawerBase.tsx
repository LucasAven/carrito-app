import type { FC, ReactNode } from "react";
import { XIcon } from "lucide-react";
import { Drawer } from "vaul";

import { cn } from "@/utils/cn";

interface DrawerBaseProps {
	children: ReactNode;
	className?: string;
	open: boolean;
	setOpen: (open: boolean) => void;
	showCloseButton?: boolean;
	subtitle?: string;
	title?: string;
	triggerButton: ReactNode;
}

export const DrawerBase: FC<DrawerBaseProps> = ({
	children,
	className = "",
	open,
	setOpen,
	showCloseButton = true,
	subtitle,
	title,
	triggerButton,
}) => (
	<Drawer.Root onOpenChange={setOpen} open={open}>
		<Drawer.Trigger asChild>{triggerButton}</Drawer.Trigger>
		<Drawer.Portal>
			<Drawer.Overlay className="fixed inset-0 z-10 bg-black/50" />
			<Drawer.Content className="bg-sheet dark:bg-sheet-dark fixed inset-x-0 bottom-0 z-20 mt-24 flex flex-col rounded-t-[30px] px-5 pt-3.5 pb-8 shadow-[0_-10px_40px_rgba(0,0,0,0.25)] dark:shadow-[0_-10px_40px_rgba(0,0,0,0.6)]">
				<div className="mx-auto mb-2.5 h-1.5 w-11 shrink-0 rounded-full bg-[#e0d2c4] dark:bg-[#3a2a1f]" />
				<div className="mx-auto flex w-full max-w-lg flex-col">
					{title || showCloseButton ? (
						<div className="flex items-start justify-between gap-3">
							<div>
								{title ? (
									<Drawer.Title className="font-display text-ink dark:text-ink-dark text-2xl font-extrabold">
										{title}
									</Drawer.Title>
								) : null}
								{subtitle ? (
									<p className="text-muted dark:text-muted-dark mt-0.5 text-[13px] font-semibold">
										{subtitle}
									</p>
								) : null}
							</div>

							{showCloseButton ? (
								<Drawer.Close asChild>
									<button
										aria-label="Cerrar"
										className="bg-track dark:bg-track-dark text-muted dark:text-muted-dark flex size-8.5 shrink-0 items-center justify-center rounded-full"
										type="button"
									>
										<XIcon className="stroke-[2.4]" size={16} />
									</button>
								</Drawer.Close>
							) : null}
						</div>
					) : null}

					<div className={cn("min-h-28 flex-1 pt-4", className)}>
						{children}
					</div>
				</div>
			</Drawer.Content>
		</Drawer.Portal>
	</Drawer.Root>
);
