"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");

    const useDark =
      savedTheme === "dark" ||
      (!savedTheme &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);

    setDark(useDark);
    document.documentElement.classList.toggle("dark", useDark);
  }, []);

  function toggleTheme() {
    const nextTheme = !dark;

    setDark(nextTheme);
    document.documentElement.classList.toggle("dark", nextTheme);
    localStorage.setItem("theme", nextTheme ? "dark" : "light");
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="theme-toggle"
      aria-label="Toggle color theme"
    >
      <span className="theme-toggle-icon">{dark ? "☀" : "☾"}</span>
      {dark ? "Light" : "Dark"}
    </button>
  );
}
