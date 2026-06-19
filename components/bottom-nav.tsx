"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { InternalRoutesData, URL_FILTERS } from "@/constants/routes";
import { getTodaysDate } from "@/utils";

const BottomNav = () => {
  const pathname = usePathname();

  return (
    <div className="w-full sm:hidden">
      <nav className="border-line dark:border-line-dark bg-bg dark:bg-bg-dark fixed bottom-0 w-full border-t">
        <div className="mx-auto flex h-16 max-w-md items-center justify-around px-6">
          {InternalRoutesData.map(({ href, icon, label }) => (
            <Link
              key={label}
              aria-current={pathname.includes(href) ? "page" : undefined}
              className="text-muted dark:text-muted-dark aria-current:text-brand flex h-full w-full flex-col items-center justify-center space-y-1 aria-current:font-extrabold"
              href={{
                pathname: href,
                query: {
                  [URL_FILTERS.DATE]: getTodaysDate(),
                },
              }}
            >
              {icon}
              <span className="text-xs">{label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default BottomNav;
