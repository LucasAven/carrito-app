"use client";

import { type ReactNode, useState } from "react";
import { useRouter } from "next/navigation";

import { DrawerBase } from "./DrawerBase";

import { createClient } from "@/lib/supabase/client";

export function LogoutDrawer({ children }: { children: ReactNode }) {
	const router = useRouter();
	const [openDrawer, setOpenDrawer] = useState(false);
	const [pending, setPending] = useState(false);

	const onConfirm = async () => {
		setPending(true);
		const supabase = createClient();
		await supabase.auth.signOut();
		router.replace("/login");
		router.refresh();
	};

	return (
		<DrawerBase
			open={openDrawer}
			setOpen={setOpenDrawer}
			subtitle="Vas a tener que volver a ingresar para usar la app."
			title="¿Cerrar sesión?"
			triggerButton={children}
		>
			<div className="flex flex-col gap-3">
				<button
					className="bg-cost font-display rounded-2xl py-4 text-lg font-bold text-white shadow-[0_8px_20px_rgba(214,73,46,0.34)] disabled:opacity-60"
					disabled={pending}
					onClick={onConfirm}
					type="button"
				>
					{pending ? "Cerrando…" : "Cerrar sesión"}
				</button>
				<button
					className="bg-track dark:bg-track-dark text-ink dark:text-ink-dark font-display rounded-2xl py-4 text-lg font-bold disabled:opacity-60"
					disabled={pending}
					onClick={() => setOpenDrawer(false)}
					type="button"
				>
					Cancelar
				</button>
			</div>
		</DrawerBase>
	);
}
