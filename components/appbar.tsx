"use client";

import {
	LogOutIcon,
	ShoppingBagIcon,
	SlidersHorizontalIcon,
	SmartphoneIcon,
} from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { FilterDrawer, LogoutDrawer } from "@/components/Drawers";

// Auth routes have no session, so the logout control is meaningless there.
const AUTH_PREFIXES = ["/login", "/signup"];

const ThemeSwitch = dynamic(() => import("./ThemeSwitch"), {
	loading: () => (
		<span className="bg-track dark:bg-track-dark flex size-9.5 shrink-0 animate-pulse items-center justify-center rounded-full" />
	),
	ssr: false,
});

const Appbar = () => {
	const pathname = usePathname();
	const onAuthPage = AUTH_PREFIXES.some((prefix) => pathname.startsWith(prefix));

	return (
		<div className="bg-bg dark:bg-bg-dark fixed top-0 left-0 z-20 w-full">
			<header className="bg-bg dark:bg-bg-dark">
				<div className="xs:px-5 mx-auto flex h-20 w-full max-w-3xl items-center justify-between px-4">
					<Link className="flex items-center gap-2.5" href="/">
						<span className="bg-brand flex size-10 items-center justify-center rounded-[14px] text-white shadow-[0_5px_12px_rgba(224,97,62,0.32)]">
							<ShoppingBagIcon className="stroke-[2.2]" size={22} />
						</span>
						<h1 className="font-display text-ink dark:text-ink-dark text-2xl font-extrabold">
							Mi Negocio
						</h1>
					</Link>

					<div className="flex items-center gap-2">
						<ThemeSwitch />
						<Link
							aria-label="Conectar con Siri"
							className="bg-surface dark:bg-surface-dark text-muted dark:text-muted-dark flex size-9.5 items-center justify-center rounded-full shadow-[0_2px_7px_rgba(58,42,34,0.1)]"
							href="/conectar-siri"
						>
							<SmartphoneIcon size={18} />
						</Link>
						<FilterDrawer>
							<button
								aria-label="Filtros"
								className="bg-surface dark:bg-surface-dark text-muted dark:text-muted-dark flex size-9.5 items-center justify-center rounded-full shadow-[0_2px_7px_rgba(58,42,34,0.1)]"
								type="button"
							>
								<SlidersHorizontalIcon size={18} />
							</button>
						</FilterDrawer>
						{!onAuthPage && (
							<LogoutDrawer>
								<button
									aria-label="Cerrar sesión"
									className="bg-surface dark:bg-surface-dark text-muted dark:text-muted-dark flex size-9.5 items-center justify-center rounded-full shadow-[0_2px_7px_rgba(58,42,34,0.1)]"
									type="button"
								>
									<LogOutIcon size={18} />
								</button>
							</LogoutDrawer>
						)}
					</div>
				</div>
			</header>
		</div>
	);
};

export default Appbar;
