import React, { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("ui_theme");
    if (saved === "dark" || saved === "light") {
      const isDark = saved === "dark";
      setDark(isDark);
      if (isDark) document.documentElement.classList.add("dark");
      else document.documentElement.classList.remove("dark");
      return;
    }
    const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    setDark(prefersDark);
    if (prefersDark) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, []);

  function setAnimating() {
    document.body.classList.add("theme-animating");
    const timeout = 420; // Matches --motion-duration from CSS with slight buffer
    setTimeout(() => document.body.classList.remove("theme-animating"), timeout);
  }

  function toggle() {
    const next = !dark;
    setDark(next);
    setAnimating();
    if (next) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("ui_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("ui_theme", "light");
    }
  }

  return (
    <button
      onClick={toggle}
      aria-pressed={dark}
      aria-label="Toggle theme"
      className="p-2 rounded hover:opacity-90 transition"
      title={dark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <span style={{ fontSize: 16 }}>{dark ? "☀" : "🌙"}</span>
    </button>
  );
}