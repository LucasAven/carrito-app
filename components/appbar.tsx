"use client";

import { useState } from "react";
import { SlidersHorizontalIcon } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { SearchBar } from "./SearchBar";

import { FilterDrawer } from "@/components/Drawers";
import { InternalRoutesData } from "@/constants/routes";
import { getTodaysDate } from "@/utils";
import { cn } from "@/utils/cn";

const ThemeSwitch = dynamic(() => import("./ThemeSwitch"), {
  loading: () => (
    <button
      aria-label="Cambiar Tema"
      className="flex size-5 shrink-0 animate-pulse items-center justify-center rounded-full bg-[#d1d5db]"
    />
  ),
  ssr: false,
});

const Appbar = () => {
  const pathname = usePathname();
  const [openSearch, setOpenSearch] = useState(false);

  return (
    <div className="fixed left-0 top-0 z-20 w-full bg-zinc-900 pt-safe">
      <header className="border-b bg-zinc-100 px-safe dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex h-20 w-full max-w-screen-md items-center justify-between px-6">
          <Link
            className={cn(
              "whitespace-nowrap pr-3",
              openSearch ? "max-sm:hidden" : "max-sm:w-full",
            )}
            href="/"
          >
            <h1 className="text-2xl font-medium xs:text-3xl">Mi Negocio</h1>
          </Link>

          <nav
            className={cn(
              "flex items-center space-x-6",
              openSearch && "hidden",
            )}
          >
            <div className="hidden sm:block">
              <div className="flex items-center space-x-6">
                {InternalRoutesData.map(({ href, label }) => (
                  <Link
                    key={label}
                    aria-current={pathname.includes(href) ? "page" : undefined}
                    className="text-sm text-zinc-600 hover:text-zinc-900 aria-current:text-indigo-500 dark:text-zinc-400 dark:hover:text-zinc-50 aria-current:dark:text-indigo-400"
                    href={{
                      pathname: href,
                      query: {
                        date: getTodaysDate(),
                      },
                    }}
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          </nav>
          <div
            className={cn(
              "flex items-center justify-end gap-4 max-sm:w-full",
              openSearch && "w-full",
            )}
          >
            <SearchBar onOpenChange={setOpenSearch} />
            <ThemeSwitch />
            <FilterDrawer>
              <SlidersHorizontalIcon className="flex-shrink-0" size={20} />
            </FilterDrawer>
          </div>
        </div>
      </header>
    </div>
  );
};

export default Appbar;
