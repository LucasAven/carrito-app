import { FC, ReactNode } from "react";
import { XIcon } from "lucide-react";
import { Drawer } from "vaul";

import { cn } from "@/utils/cn";

interface DrawerBaseProps {
  children: ReactNode;
  className?: string;
  open: boolean;
  setOpen: (open: boolean) => void;
  showCloseButton?: boolean;
  title?: string;
  triggerButton: ReactNode;
}

export const DrawerBase: FC<DrawerBaseProps> = ({
  children,
  className = "",
  open,
  setOpen,
  showCloseButton = true,
  title,
  triggerButton,
}) => (
  <Drawer.Root onOpenChange={setOpen} open={open}>
    <Drawer.Trigger asChild>{triggerButton}</Drawer.Trigger>
    <Drawer.Portal>
      <Drawer.Overlay className="fixed inset-0 bg-black/40" />
      <Drawer.Content className="fixed bottom-0 left-0 right-0 mt-24 flex flex-col rounded-t-[10px] border bg-zinc-100 p-4 shadow-md dark:border-white/20 dark:bg-[#09090b]">
        <div className="mx-auto mb-3 h-1.5 w-12 flex-shrink-0 rounded-full bg-zinc-300" />
        <div className="mx-auto flex w-full max-w-lg flex-col">
          {title ? (
            <Drawer.Title className="text-3xl font-medium text-black dark:text-white">
              {title}
            </Drawer.Title>
          ) : null}

          {showCloseButton ? (
            <Drawer.Close className="fixed right-3 top-4" asChild>
              <button className="rounded-full bg-zinc-500 p-1 text-white dark:bg-transparent">
                <XIcon className="stroke-current" size={20} />
              </button>
            </Drawer.Close>
          ) : null}

          <div className={cn("min-h-28 flex-1 p-4 pb-0", className)}>
            {children}
          </div>
        </div>
      </Drawer.Content>
      <Drawer.Overlay />
    </Drawer.Portal>
  </Drawer.Root>
);
