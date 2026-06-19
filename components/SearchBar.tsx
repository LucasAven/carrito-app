"use client";

import { type FC, useCallback, useEffect, useState } from "react";
import { SearchIcon, XIcon } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import useDebounce from "@/hooks/useDebounce";
import { getFiltersFromSearchParams } from "@/utils";
import { cn } from "@/utils/cn";

interface SearchBarProps {
	onOpenChange: (open: boolean) => void;
}

export const SearchBar: FC<SearchBarProps> = ({ onOpenChange }) => {
	const [open, setOpen] = useState(false);
	const searchParams = useSearchParams();
	const pathname = usePathname();
	const parsedCurrentFilters = getFiltersFromSearchParams(searchParams);

	const [searchValue, setSearchValue] = useState(parsedCurrentFilters.label);
	const debounceSearchValue = useDebounce(searchValue, 100);

	const { replace } = useRouter();

	useEffect(() => {
		if (debounceSearchValue.trim() !== parsedCurrentFilters.label) {
			const newSearchParams = new URLSearchParams(searchParams.toString());
			if (debounceSearchValue.trim()) {
				newSearchParams.set("label", debounceSearchValue.trim());
			} else {
				newSearchParams.delete("label");
			}
			replace(`${pathname}?${newSearchParams.toString()}`);
		}
	}, [
		debounceSearchValue,
		parsedCurrentFilters.label,
		pathname,
		replace,
		searchParams,
	]);

	const handleOpenChange = useCallback(() => {
		setOpen(!open);
		if (open) {
			setSearchValue("");

			// if the search bar is open, wait for the animation to finish before
			// calling the onOpenChange callback to avoid a flicker effect
			setTimeout(() => {
				onOpenChange(!open);
			}, 150);
		} else {
			onOpenChange(!open);
		}
	}, [onOpenChange, open]);

	return (
		<div className="flex w-full justify-end">
			<button aria-hidden={open} onClick={handleOpenChange} type="button">
				<SearchIcon
					className={cn(
						"stroke-current transition-all",
						open ? "w-0 duration-75 md:duration-0" : "delay-150 duration-0",
					)}
					size={24}
				/>
			</button>
			<div
				className={cn(
					"relative flex justify-end transition-[width] ease-in-out md:max-w-96",
					open ? "w-full duration-250" : "w-0! duration-150",
				)}
			>
				<SearchIcon
					className={
						open
							? "pointer-events-none absolute top-1/2 left-4 -translate-y-1/2"
							: "hidden"
					}
					size={24}
					aria-hidden
				/>
				<input
					aria-autocomplete="none"
					aria-hidden={!open}
					autoCapitalize="off"
					autoComplete="false"
					className={cn(
						"inline-block h-12 border border-gray-300 p-4 pr-8 pl-12 align-middle text-base",
						open ? "w-full duration-250" : "w-0! border-none p-0! duration-150",
					)}
					name="search"
					onChange={(e) => setSearchValue(e.target.value)}
					onKeyDown={(e) => {
						if (e.key === "Escape") {
							setSearchValue("");
							handleOpenChange();
						}
					}}
					placeholder="Buscar"
					type="text"
					value={searchValue}
				/>
				<button
					aria-label="Cancelar búsqueda"
					className={
						open ? "absolute top-1/2 right-4 -translate-y-1/2" : "hidden"
					}
					onClick={handleOpenChange}
					type="button"
				>
					<XIcon className="stroke-current" size={20} />
				</button>
			</div>
		</div>
	);
};
