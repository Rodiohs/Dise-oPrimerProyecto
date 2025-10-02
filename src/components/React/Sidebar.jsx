import React, { useEffect, useState } from "react";
import { FiHome, FiPieChart, FiFileText, FiBarChart2, FiMenu, FiLogOut } from "react-icons/fi";

/**
 * Sidebar component toggles 'sidebar-open' class on body.
 * On small screens it will apply 'mobile-open' class to the sidebar element
 * and not add body padding.
 */
export default function Sidebar() {
  const [open, setOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    // Set initial state from localStorage if available
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

  // close mobile when route changes (simple heuristic)
  useEffect(() => {
    const onRoute = () => setMobileOpen(false);
    window.addEventListener("hashchange", onRoute);
    return () => window.removeEventListener("hashchange", onRoute);
  }, []);

  function toggle() {
    // on mobile toggle mobile overlay, on desktop toggle collapsed state
    if (window.innerWidth < 768) {
      setMobileOpen(!mobileOpen);
    } else {
      setOpen(!open);
    }
  }

  return (
    <>
      <button
        aria-label="Toggle sidebar"
        className="sidebar-toggle-btn"
        onClick={toggle}
      >
        <FiMenu />
      </button>

      <aside className={`app-sidebar ${mobileOpen ? "mobile-open" : ""}`} aria-hidden={!open && !mobileOpen}>
        <div className="brand px-3">
          <div className="text-white font-semibold text-lg">Finance</div>
        </div>

        <nav className="mt-2 px-1">
          <a className="nav-link" href="/">
            <span className="icon"><FiHome /></span>
            <span className="label">Dashboard</span>
          </a>

          <a className="nav-link mt-1" href="/budgets">
            <span className="icon"><FiBarChart2 /></span>
            <span className="label">Budgets</span>
          </a>
        </nav>

        <div className="mt-auto px-3 pb-4">
          <a className="nav-link" href="#" onClick={(e)=>{ e.preventDefault(); alert('Logout placeholder'); }}>
          </a>
        </div>
      </aside>
    </>
  );
}