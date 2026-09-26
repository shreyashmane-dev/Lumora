"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("lumora_theme") as "dark" | "light" | null;
    const initialTheme = saved || "dark";
    setTheme(initialTheme);
    if (initialTheme === "light") {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
    } else {
      document.documentElement.classList.remove("light");
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("lumora_theme", next);
    if (next === "light") {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
    } else {
      document.documentElement.classList.remove("light");
      document.documentElement.classList.add("dark");
    }
  };

  if (!mounted) {
    return (
      <div className="w-9 h-9 rounded-xl border border-slate-800 bg-slate-900/60" />
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-xl border border-slate-800 bg-slate-900/80 hover:bg-slate-800/80 text-slate-300 hover:text-white transition-all flex items-center justify-center shadow-sm"
      aria-label="Toggle dark/light theme"
      title={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
    >
      {theme === "dark" ? (
        <Sun className="w-4 h-4 text-amber-400" />
      ) : (
        <Moon className="w-4 h-4 text-violet-400" />
      )}
    </button>
  );
}
