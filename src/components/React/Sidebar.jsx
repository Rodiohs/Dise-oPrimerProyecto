import React, { useEffect, useState } from "react";
import ThemeToggle from "./ThemeToggle.jsx";

export default function Sidebar() {
  const [open, setOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const s = localStorage.getItem("ui_sidebar_open");
    if (s !== null) setOpen(s === "1");
  }, []);

  useEffect(() => {
    if (open) {
      document.body.classList.add("sidebar-open");
      localStorage.setItem("ui_sidebar_open", "1");
    } else {
      document.body.classList.remove("sidebar-open");
      localStorage.setItem("ui_sidebar_open", "0");
    }
  }, [open]);

  useEffect(() => {
    const onRoute = () => setMobileOpen(false);
    window.addEventListener("hashchange", onRoute);
    return () => window.removeEventListener("hashchange", onRoute);
  }, []);

  function toggle() {
    if (window.innerWidth < 768) {
      setMobileOpen(!mobileOpen);
    } else {
      setOpen(!open);
    }
  }

  return (
    <>
      <button aria-label="Toggle sidebar" className="sidebar-toggle-btn" onClick={toggle}>
        ☰
      </button>

      <aside className={`app-sidebar ${mobileOpen ? "mobile-open" : ""}`} aria-hidden={!open && !mobileOpen}>
        <div className="brand px-3">
          <div className="font-semibold text-lg" style={{ color: 'var(--primary)' }}>Finance</div>
        </div>

        <nav className="mt-2 px-1">
          <a className="nav-link" href="/">
            <span className="icon">🏠</span>
            <span className="label">Dashboard</span>
          </a>

          <a className="nav-link mt-1" href="/budgets">
            <span className="icon">📊</span>
            <span className="label">Budgets</span>
          </a>

          <a className="nav-link mt-1" href="/guarantees">
            <span className="icon">✅</span>
            <span className="label">Guarantees</span>
          </a>

          <a className="nav-link mt-1" href="/debts">
            <span className="icon">💸</span>
            <span className="label">Debts/Loans</span>
          </a>
        </nav>

        <div className="mt-auto px-3 pb-4">
          <div className="mb-3">
            <ThemeToggle />
          </div>

          
        </div>
      </aside>
    </>
  );
}