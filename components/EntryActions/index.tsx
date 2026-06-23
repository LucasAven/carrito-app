"use client";

import { Suspense } from "react";
import { usePathname } from "next/navigation";

import { CreateBalanceDrawer, CreateExpenseDrawer } from "@/components/Drawers";

// Routes where the quick-entry actions don't belong: the auth flow (no session
// yet), the Siri connection screen, the stats page (a reflection view) and the
// export report (a read-only document view).
const HIDDEN_PREFIXES = [
	"/login",
	"/signup",
	"/conectar-siri",
	"/stats",
	"/exportar",
];

const EntryActions = () => {
	const pathname = usePathname();

	if (HIDDEN_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
		return null;
	}

	return (
		<div className="pointer-events-none fixed bottom-20 flex w-full max-w-3xl gap-3 px-4 sm:bottom-4">
			<Suspense fallback={null}>
				<CreateBalanceDrawer>
					<button
						className="bg-earn font-display pointer-events-auto flex-[1.3] rounded-full px-3 py-4 text-[15px] font-extrabold text-white shadow-[0_6px_16px_rgba(31,157,107,0.3)]"
						type="button"
					>
						Venta
					</button>
				</CreateBalanceDrawer>
			</Suspense>
			<Suspense fallback={null}>
				<CreateExpenseDrawer>
					<button
						className="border-cost dark:border-cost font-display text-cost pointer-events-auto flex-1 rounded-full border-2 bg-[#fbe7e1] px-3 py-3.5 text-[15px] font-extrabold dark:bg-[#3a1913] dark:text-white"
						type="button"
					>
						Gasto
					</button>
				</CreateExpenseDrawer>
			</Suspense>
		</div>
	);
};

export default EntryActions;
