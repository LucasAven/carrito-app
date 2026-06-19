"use client";

import { MoonIcon, SunIcon } from "lucide-react";

import { useTheme } from "@/hooks/useTheme";

const ThemeSwitch: React.FC = () => {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <button
      aria-label={`Cambiar tema a modo ${isDark ? "claro" : "oscuro"}`}
      className="flex items-center justify-center rounded-full"
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {isDark ? <SunIcon size={20} /> : <MoonIcon size={20} />}
    </button>
  );
};

export default ThemeSwitch;
