"use client";

import { useEffect, useRef, useState } from "react";
import {
	LogOutIcon,
	MenuIcon,
	MoonIcon,
	SlidersHorizontalIcon,
	SmartphoneIcon,
	SunIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { FilterDrawer, LogoutDrawer } from "@/components/Drawers";
import { useTheme } from "@/hooks/useTheme";

// Auth routes have no session, so the logout control is meaningless there.
const AUTH_PREFIXES = ["/login", "/signup"];

const itemClass =
	"text-ink dark:text-ink-dark flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-[15px] font-bold transition-colors hover:bg-track dark:hover:bg-track-dark";

const AppbarMenu = () => {
	const pathname = usePathname();
	const onAuthPage = AUTH_PREFIXES.some((prefix) => pathname.startsWith(prefix));

	const { resolvedTheme, setTheme } = useTheme();
	const isDark = resolvedTheme === "dark";

	const [menuOpen, setMenuOpen] = useState(false);
	const [filterOpen, setFilterOpen] = useState(false);
	const [logoutOpen, setLogoutOpen] = useState(false);

	const menuRef = useRef<HTMLDivElement>(null);

	// Close the dropdown on outside click, Escape, or navigation.
	useEffect(() => {
		if (!menuOpen) return;

		const onPointerDown = (event: PointerEvent) => {
			if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false);
		};
		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") setMenuOpen(false);
		};

		document.addEventListener("pointerdown", onPointerDown);
		document.addEventListener("keydown", onKeyDown);
		return () => {
			document.removeEventListener("pointerdown", onPointerDown);
			document.removeEventListener("keydown", onKeyDown);
		};
	}, [menuOpen]);

	useEffect(() => {
		setMenuOpen(false);
	}, [pathname]);

	return (
		<>
			<div className="relative" ref={menuRef}>
				<button
					aria-expanded={menuOpen}
					aria-haspopup="menu"
					aria-label="Menú"
					className="bg-surface dark:bg-surface-dark text-muted dark:text-muted-dark flex size-9.5 items-center justify-center rounded-full shadow-[0_2px_7px_rgba(58,42,34,0.1)]"
					onClick={() => setMenuOpen((prev) => !prev)}
					type="button"
				>
					<MenuIcon size={20} />
				</button>

				{menuOpen ? (
					<div
						className="bg-sheet dark:bg-sheet-dark border-line dark:border-line-dark absolute right-0 z-30 mt-2 flex w-56 flex-col gap-0.5 rounded-3xl border p-2 shadow-[0_12px_40px_rgba(0,0,0,0.18)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.6)]"
						role="menu"
					>
						<button
							className={itemClass}
							onClick={() => setTheme(isDark ? "light" : "dark")}
							role="menuitem"
							type="button"
						>
							{isDark ? <SunIcon size={18} /> : <MoonIcon size={18} />}
							{isDark ? "Modo claro" : "Modo oscuro"}
						</button>

						<Link
							className={itemClass}
							href="/conectar-siri"
							onClick={() => setMenuOpen(false)}
							role="menuitem"
						>
							<SmartphoneIcon size={18} />
							Conectar con Siri
						</Link>

						<button
							className={itemClass}
							onClick={() => {
								setMenuOpen(false);
								setFilterOpen(true);
							}}
							role="menuitem"
							type="button"
						>
							<SlidersHorizontalIcon size={18} />
							Filtros
						</button>

						{!onAuthPage ? (
							<button
								className={itemClass}
								onClick={() => {
									setMenuOpen(false);
									setLogoutOpen(true);
								}}
								role="menuitem"
								type="button"
							>
								<LogOutIcon size={18} />
								Cerrar sesión
							</button>
						) : null}
					</div>
				) : null}
			</div>

			<FilterDrawer open={filterOpen} setOpen={setFilterOpen} />
			<LogoutDrawer open={logoutOpen} setOpen={setLogoutOpen} />
		</>
	);
};

export default AppbarMenu;
