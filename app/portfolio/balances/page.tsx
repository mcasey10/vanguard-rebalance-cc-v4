"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import GlobalNav from "@/components/GlobalNav";
import HeroBanner from "@/components/HeroBanner";
import SectionNav from "@/components/SectionNav";
import styles from "./page.module.css";
import { PORTFOLIO } from "@/lib/data";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8003";

const SECTION_TABS = [
  { label: "Dashboard", href: "#" },
  { label: "Balances", href: "/portfolio/balances" },
  { label: "Holdings", href: "#" },
  { label: "Sell & Rebalance", href: "/portfolio/sell-rebalance", pulse: true },
  { label: "Activity", href: "#" },
  { label: "Performance", href: "#" },
  { label: "Portfolio Watch", href: "#" },
];

function formatMoney(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 });
}

export default function BalancesPage() {
  const [promoDismissed, setPromoDismissed] = useState(false);

  // API warmup on mount
  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 30000);
    fetch(`${API_URL}/`, { signal: controller.signal }).catch(() => {});
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={styles.pageWrapper}>
      <GlobalNav />
      <HeroBanner
        title={`Welcome back, ${PORTFOLIO.investor_name}`}
        breadcrumbs={[
          { label: "My accounts", href: "/portfolio/balances" },
          { label: "Balances" },
        ]}
        rightContent={
          <div style={{ fontSize: 13, lineHeight: 1.6 }}>
            <div><a href="#" style={{ color: "rgba(255,255,255,0.85)", textDecoration: "underline" }}>Value as of: {PORTFOLIO.as_of_date}, {PORTFOLIO.as_of_time}</a></div>
            <div style={{ color: "rgba(255,255,255,0.85)" }}>Last login: {PORTFOLIO.as_of_date}, 4:38 p.m. ET</div>
          </div>
        }
      />
      <SectionNav tabs={SECTION_TABS} />

      {/* Promo banner */}
      {!promoDismissed && (
        <div className={styles.promoBanner}>
          <div className={styles.promoInner}>
            <div className={styles.promoIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <div className={styles.promoContent}>
              <div className={styles.promoHeadline}>Optimize your next withdrawal with Sell &amp; Rebalance</div>
              <div className={styles.promoDesc}>
                Our tool analyzes your holdings to minimize taxes while keeping your portfolio balanced.
              </div>
            </div>
            <Link href="/portfolio/sell-rebalance" className={styles.promoCta}>
              Review sell &amp; rebalance options →
            </Link>
            <button
              className={styles.promoDismiss}
              onClick={() => setPromoDismissed(true)}
              aria-label="Dismiss"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <main className={styles.main}>
        <div className={styles.mainInner}>
          {/* Accounts table */}
          <div className={styles.accountsCard}>
            <div className={styles.accountsHeader}>
              <h2 className={styles.accountsTitle}>Your Accounts</h2>
            </div>
            <table className={styles.accountsTable}>
              <thead>
                <tr>
                  <th>Account</th>
                  <th>Account Number</th>
                  <th>Action</th>
                  <th className={styles.thRight}>Balance</th>
                </tr>
              </thead>
              <tbody>
                {PORTFOLIO.accounts.map((account) => (
                  <tr key={account.account_id}>
                    <td>
                      <span className={styles.accountNameLink}>{account.account_name}</span>
                    </td>
                    <td className={styles.accountNumber}>{account.masked_number}</td>
                    <td>
                      {account.account_type === "cash_plus" ? (
                        <span className={styles.noAction}>—</span>
                      ) : account.can_sell ? (
                        <Link
                          href="/portfolio/sell-rebalance"
                          className={`${styles.sellBtn} ${styles.sellBtnActive} pulse-3`}
                        >
                          Sell from this account
                        </Link>
                      ) : (
                        <button
                          className={`${styles.sellBtn} ${styles.sellBtnDisabled}`}
                          disabled
                          title="Not available for this account type"
                        >
                          Sell from this account
                        </button>
                      )}
                    </td>
                    <td className={styles.accountBalance}>{formatMoney(account.balance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      </main>
    </div>
  );
}
