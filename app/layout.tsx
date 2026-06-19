/* eslint-disable sort-keys */
import { Suspense } from "react";
import type { Metadata, Viewport } from "next";

import "@/styles/globals.css";
import Appbar from "@/components/appbar";
import BottomNav from "@/components/bottom-nav";
import { CreateBalanceDrawer, CreateExpenseDrawer } from "@/components/Drawers";

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
      color: "#18181b",
    },
    {
      color: "#f4f4f5",
    },
  ],
  initialScale: 1,
  width: "device-width",
};

// Runs before first paint to prevent flash-of-wrong-theme.
const themeInitScript = `(function(){try{var t=localStorage.getItem('theme')||'system';var isDark=t==='dark'||(t==='system'&&matchMedia('(prefers-color-scheme: dark)').matches);if(isDark)document.documentElement.classList.add('dark');}catch(e){}})();`;

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="relative flex flex-col items-center">
        <Suspense fallback={null}>
          <Appbar />
        </Suspense>
        <main className="mx-auto w-full max-w-screen-md pb-16 pt-20 sm:pb-0">
          <div className="p-6">{children}</div>
        </main>
        <div className="pointer-events-none fixed bottom-20 flex w-full max-w-screen-md justify-between px-7">
          <Suspense fallback={null}>
            <CreateBalanceDrawer>
              <button className="pointer-events-auto rounded-md bg-earn px-3 py-2 font-semibold text-white">
                Nueva Venta
              </button>
            </CreateBalanceDrawer>
          </Suspense>
          <Suspense fallback={null}>
            <CreateExpenseDrawer>
              <button className="pointer-events-auto rounded-md bg-cost px-3 py-2 font-semibold text-white">
                Nuevo Gasto
              </button>
            </CreateExpenseDrawer>
          </Suspense>
        </div>
        <Suspense fallback={null}>
          <BottomNav />
        </Suspense>
      </body>
    </html>
  );
};

export default RootLayout;
