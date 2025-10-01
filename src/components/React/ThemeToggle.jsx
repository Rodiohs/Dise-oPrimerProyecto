import React, { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const bodyElement = document.body; // Target the body for the dark-mode class
    const saved = localStorage.getItem("ui_theme");

    if (saved === "dark" || saved === "light") {
      const isDark = saved === "dark";
      setDark(isDark);
      if (isDark) bodyElement.classList.add("dark-mode"); // Use new class name
      else bodyElement.classList.remove("dark-mode"); // Use new class name
      return;
    }

    const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    setDark(prefersDark);
    if (prefersDark) bodyElement.classList.add("dark-mode"); // Use new class name
    else bodyElement.classList.remove("dark-mode"); // Use new class name

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
    const bodyElement = document.body; // Target the body
    if (next) {
      bodyElement.classList.add("dark-mode"); // Use new class name
      localStorage.setItem("ui_theme", "dark");
    } else {
      bodyElement.classList.remove("dark-mode"); // Use new class name
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