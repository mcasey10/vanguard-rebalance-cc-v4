"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./SectionNav.module.css";

interface SectionTab {
  label: string;
  href: string;
  pulse?: boolean;
}

interface SectionNavProps {
  tabs: SectionTab[];
}

export default function SectionNav({ tabs }: SectionNavProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "#") return false;
    // Sell & Rebalance tab must stay active on all sub-routes
    if (href === "/portfolio/sell-rebalance") {
      return pathname.startsWith("/portfolio/sell-rebalance");
    }
    return pathname === href;
  };

  return (
    <nav className={styles.sectionNav} aria-label="Section navigation">
      <div className={styles.inner}>
        {tabs.map((tab) => {
          const active = isActive(tab.href);
          return (
            <Link
              key={tab.label}
              href={tab.href}
              className={`${styles.tab}${active ? ` ${styles.tabActive}` : ""}${tab.pulse && !active ? ` ${styles.tabPulse}` : ""}`}
              aria-current={active ? "page" : undefined}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
