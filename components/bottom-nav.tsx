"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { InternalRoutesData, URL_FILTERS } from "@/constants/routes";
import { getTodaysDate } from "@/utils";

const BottomNav = () => {
  const pathname = usePathname();

  return (
    <div className="w-full sm:hidden">
      <nav className="fixed bottom-0 w-full border-t bg-zinc-100 pb-safe dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex h-16 max-w-md items-center justify-around px-6">
          {InternalRoutesData.map(({ href, icon, label }) => (
            <Link
              key={label}
              aria-current={pathname.includes(href) ? "page" : undefined}
              className="flex h-full w-full flex-col items-center justify-center space-y-1 text-zinc-600 hover:text-zinc-900 aria-current:font-bold aria-current:text-indigo-500 dark:text-zinc-400 dark:hover:text-zinc-50 aria-current:dark:text-indigo-400"
              href={{
                pathname: href,
                query: {
                  [URL_FILTERS.DATE]: getTodaysDate(),
                },
              }}
            >
              {icon}
              <span className="text-xs text-zinc-600 dark:text-zinc-400">
                {label}
              </span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default BottomNav;
