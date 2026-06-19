"use client";

import { MoonIcon, SunIcon } from "lucide-react";

import { useTheme } from "@/hooks/useTheme";

const ThemeSwitch: React.FC = () => {
	const { resolvedTheme, setTheme } = useTheme();
	const isDark = resolvedTheme === "dark";

	return (
		<button
			aria-label={`Cambiar tema a modo ${isDark ? "claro" : "oscuro"}`}
			className="bg-surface dark:bg-surface-dark text-muted dark:text-muted-dark flex size-9.5 items-center justify-center rounded-full shadow-[0_2px_7px_rgba(58,42,34,0.1)]"
			onClick={() => setTheme(isDark ? "light" : "dark")}
			type="button"
		>
			{isDark ? <SunIcon size={18} /> : <MoonIcon size={18} />}
		</button>
	);
};

export default ThemeSwitch;
