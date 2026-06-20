"use client";

import { Suspense } from "react";
import { usePathname } from "next/navigation";

import { CreateBalanceDrawer, CreateExpenseDrawer } from "@/components/Drawers";

// Routes where the quick-entry actions don't belong: the auth flow (no session
// yet) and the Siri connection screen.
const HIDDEN_PREFIXES = ["/login", "/signup", "/conectar-siri"];

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
						className="border-cost dark:border-cost bg-[#fbe7e1] dark:bg-[#3a1913] font-display text-cost dark:text-white pointer-events-auto flex-1 rounded-full border-2 px-3 py-3.5 text-[15px] font-extrabold"
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
