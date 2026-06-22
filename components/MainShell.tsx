"use client";

import { usePathname } from "next/navigation";

import { cn } from "@/utils/cn";

// Auth pages have no bottom chrome (no nav bar, no quick-entry buttons), so they
// get no bottom margin and stay vertically centered.
const AUTH_PREFIXES = ["/login", "/signup"];

// Bottom margin clears the fixed nav / quick-entry buttons. Balance needs extra
// room because it also shows the Venta/Gasto buttons above the nav bar.
const getMarginClass = (pathname: string) => {
	if (AUTH_PREFIXES.some((prefix) => pathname.startsWith(prefix))) return "";
	if (pathname.startsWith("/balance")) return "mb-32";
	return "mb-16";
};

const MainShell = ({ children }: { children: React.ReactNode }) => {
	const pathname = usePathname();

	return (
		<main
			className={cn(
				"mx-auto flex w-full max-w-3xl min-h-0 flex-1 flex-col pt-20",
				getMarginClass(pathname),
			)}
		>
			<div className="xs:px-5 flex min-h-0 flex-1 flex-col overflow-y-auto px-4 pt-2">
				{children}
			</div>
		</main>
	);
};

export default MainShell;
