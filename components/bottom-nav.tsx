"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { InternalRoutes, InternalRoutesData, URL_FILTERS } from "@/constants/routes";
import { getTodaysDate } from "@/utils";

const BottomNav = ({ isAuthenticated }: { isAuthenticated: boolean }) => {
  const pathname = usePathname();

  // Balance and Resumen are session-gated; without one the middleware bounces
  // every tap to /login, so there's nothing to navigate to.
  if (!isAuthenticated) return null;

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
                // Only the Balance ledger is date-scoped; Resumen has its own
                // year selector and takes no query params.
                query:
                  href === InternalRoutes.balance
                    ? { [URL_FILTERS.DATE]: getTodaysDate() }
                    : undefined,
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
