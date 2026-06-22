import { ShoppingBagIcon } from "lucide-react";
import Link from "next/link";

import AppbarMenu from "./AppbarMenu";

const Appbar = () => (
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

				<AppbarMenu />
			</div>
		</header>
	</div>
);

export default Appbar;
