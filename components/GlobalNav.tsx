"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./GlobalNav.module.css";

const NAV_TABS = [
  { label: "Advice services", href: "#" },
  { label: "Dashboard", href: "#" },
  { label: "Portfolio ▾", href: "/portfolio/balances" },
  { label: "Transact ▾", href: "#" },
  { label: "Products & services ▾", href: "#" },
  { label: "Resources & education ▾", href: "#" },
];

export default function GlobalNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "#") return false;
    if (href === "/portfolio/balances") {
      return pathname.startsWith("/portfolio");
    }
    return pathname === href;
  };

  return (
    <nav className={styles.nav} role="navigation" aria-label="Main navigation">
      {/* Top row */}
      <div className={styles.topRow}>
        <div className={styles.topActions}>
          {/* Search */}
          <button className={styles.topBtn} aria-label="Search">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <span className={styles.topBtnLabel}>Search</span>
          </button>
          {/* Support */}
          <button className={styles.topBtn} aria-label="Support">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <span className={styles.topBtnLabel}>Support</span>
          </button>
          {/* Messages */}
          <button className={styles.topBtn} aria-label="Messages">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <span className={styles.topBtnLabel}>Messages</span>
          </button>
          {/* Documents */}
          <button className={styles.topBtn} aria-label="Documents">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            <span className={styles.topBtnLabel}>Documents</span>
          </button>
          {/* Profile */}
          <button className={styles.topBtn} aria-label="Profile">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <span className={styles.topBtnLabel}>Profile</span>
          </button>
          {/* Log off */}
          <button className={styles.topBtn} aria-label="Log off">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span className={styles.topBtnLabel}>Log off</span>
          </button>
        </div>
      </div>

      {/* Bottom row */}
      <div className={styles.bottomRow}>
        <div className={styles.logoArea}>
          <div className={styles.logoCircle} aria-label="Vanguard">
            <span className={styles.logoV}>V</span>
          </div>
          <span className={styles.accountType}>Personal investors</span>
        </div>

        <div className={styles.navTabs} role="tablist">
          {NAV_TABS.map((tab) => {
            const active = isActive(tab.href);
            return (
              <Link
                key={tab.label}
                href={tab.href}
                role="tab"
                aria-selected={active}
                className={`${styles.navTab}${active ? ` ${styles.navTabActive}` : ""}`}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
