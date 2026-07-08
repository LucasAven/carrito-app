"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { InternalRoutesData } from "@/constants/routes";

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
              // The bare /balance URL already renders today's ledger; keeping
              // the link query-free avoids baking a stale date into a link
              // rendered on a previous day (long-lived mobile tabs).
              href={href}
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
