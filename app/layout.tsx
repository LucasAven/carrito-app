/* eslint-disable sort-keys */
import { Suspense } from "react";
import type { Metadata, Viewport } from "next";
import { Baloo_2, Nunito } from "next/font/google";

import "@/styles/globals.css";
import Appbar from "@/components/appbar";
import BottomNav from "@/components/bottom-nav";
import EntryActions from "@/components/EntryActions";

const baloo = Baloo_2({
	subsets: ["latin"],
	weight: ["500", "600", "700", "800"],
	variable: "--font-baloo",
	display: "swap",
});

const nunito = Nunito({
	subsets: ["latin"],
	weight: ["400", "500", "600", "700", "800", "900"],
	variable: "--font-nunito",
	display: "swap",
});

const APP_NAME = "Carrito App";
const APP_DEFAULT_TITLE = "Carrito App";
const APP_TITLE_TEMPLATE = "%s - Carrito App";
const APP_DESCRIPTION =
	"Carrito App, administra tus compras y gastos de manera sencilla";

export const metadata: Metadata = {
	applicationName: APP_NAME,
	title: {
		default: APP_DEFAULT_TITLE,
		template: APP_TITLE_TEMPLATE,
	},
	description: APP_DESCRIPTION,
	openGraph: {
		type: "website",
		siteName: APP_NAME,
		title: {
			default: APP_DEFAULT_TITLE,
			template: APP_TITLE_TEMPLATE,
		},
		description: APP_DESCRIPTION,
	},
	icons: [{ rel: "icon", url: "/images/favicon.png" }],
};

export const viewport: Viewport = {
	themeColor: [
		{
			media: "(prefers-color-scheme: dark)",
			color: "#161009",
		},
		{
			color: "#fbf4ea",
		},
	],
	initialScale: 1,
	width: "device-width",
};

// Runs before first paint to prevent flash-of-wrong-theme.
const themeInitScript = `(function(){try{var t=localStorage.getItem('theme')||'system';var isDark=t==='dark'||(t==='system'&&matchMedia('(prefers-color-scheme: dark)').matches);if(isDark)document.documentElement.classList.add('dark');}catch(e){}})();`;

const RootLayout = ({ children }: { children: React.ReactNode }) => {
	return (
		<html
			className={`${baloo.variable} ${nunito.variable}`}
			lang="es"
			suppressHydrationWarning
		>
			<head>
				{/** biome-ignore lint/security/noDangerouslySetInnerHtml: The injected HTML is a hardcoded constant with zero dynamic or user input, so there's no injection surface. */}
				<script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
			</head>
			<body className="relative flex flex-col items-center">
				<Suspense fallback={null}>
					<Appbar />
				</Suspense>
				<main className="mx-auto w-full max-w-3xl pt-20 pb-28 sm:pb-24">
					<div className="xs:px-5 px-4 pt-2">{children}</div>
				</main>
				<Suspense fallback={null}>
					<EntryActions />
				</Suspense>
				<Suspense fallback={null}>
					<BottomNav />
				</Suspense>
			</body>
		</html>
	);
};

export default RootLayout;
