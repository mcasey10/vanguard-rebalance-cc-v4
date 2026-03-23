"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import GlobalNav from "@/components/GlobalNav";
import HeroBanner from "@/components/HeroBanner";
import SectionNav from "@/components/SectionNav";
import styles from "./page.module.css";
import type { ScenarioTaxImpact } from "@/lib/types";
import { clearAmounts } from "@/lib/amountStore";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8003";

const TICKERS = ["VTSAX", "VFIAX", "VBTLX", "VIGAX", "VXUS"];
const FUND_NAMES: Record<string, string> = {
  VTSAX: "Vanguard Total Stock Market Index Fund",
  VBTLX: "Vanguard Total Bond Market Index Fund",
  VFIAX: "Vanguard 500 Index Fund",
  VIGAX: "Vanguard Growth Index Fund",
  VXUS: "Vanguard Total International Stock Index Fund",
};
const NAVS: Record<string, number> = {
  VTSAX: 785.34,
  VBTLX: 92.85,
  VFIAX: 519.37,
  VIGAX: 188.42,
  VXUS: 63.48,
};

const SECTION_TABS = [
  { label: "Dashboard", href: "#" },
  { label: "Balances", href: "/portfolio/balances" },
  { label: "Holdings", href: "#" },
  { label: "Sell & Rebalance", href: "/portfolio/sell-rebalance" },
  { label: "Activity", href: "#" },
  { label: "Performance", href: "#" },
  { label: "Portfolio Watch", href: "#" },
];

// Canonical optimized tax for comparison
const OPTIMIZED_TAX = 532;
const OPTIMIZED_RATE = 5.32;

function fmtMoney(n: number) {
  if (n === 0) return "$0.00";
  const abs = Math.abs(n);
  return (n < 0 ? "-$" : "$") + abs.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtGL(n: number) {
  const abs = Math.abs(n);
  return (n < 0 ? "-$" : "+$") + abs.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const STEPS = [
  { step: 1, title: "Order Submitted", desc: "Sell order placed and confirmed." },
  { step: 2, title: "Execution at NAV", desc: "Trades execute at next NAV pricing." },
  { step: 3, title: "Settlement", desc: "Proceeds settle in 1–2 business days." },
  { step: 4, title: "Tax Lot Update", desc: "Lot records updated for tax year." },
];

function ConfirmationContent() {
  const searchParams = useSearchParams();

  const source = searchParams.get("source") ?? "auto";
  const isManual = source === "manual";
  const amount = parseFloat(searchParams.get("amount") ?? "0");

  // Parse fund amounts from URL
  const fundAmounts: Record<string, number> = {};
  for (const t of TICKERS) {
    const v = parseFloat(searchParams.get(t) ?? "0");
    if (v > 0) fundAmounts[t] = v;
  }

  const [taxResult, setTaxResult] = useState<ScenarioTaxImpact | null>(null);

  // Clear persisted amounts on confirmation mount (order executed)
  useEffect(() => { clearAmounts(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Confirmation page reads URL params, never calls /recommend
  // But we call /scenario to get tax breakdown
  useEffect(() => {
    const hasAmounts = Object.keys(fundAmounts).length > 0;
    if (!hasAmounts) return;

    const allAmounts: Record<string, number> = {};
    for (const t of TICKERS) allAmounts[t] = fundAmounts[t] ?? 0;

    fetch(`${API_URL}/scenario`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ account_id: "brokerage-001", fund_amounts: allAmounts }),
    })
      .then((r) => r.json())
      .then((d: ScenarioTaxImpact) => setTaxResult(d))
      .catch(() => {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const orderedFunds = TICKERS.filter((t) => fundAmounts[t] && fundAmounts[t] > 0);

  const taxSavings = taxResult && isManual
    ? Math.max(0, taxResult.total_tax - OPTIMIZED_TAX)
    : 149.17;

  // Asset classes before/after
  const ASSET_CLASSES = [
    { label: "US Equity", tickers: ["VTSAX", "VFIAX", "VIGAX"], before: 54.5, afterLabel: "" },
    { label: "US Bond", tickers: ["VBTLX"], before: 20.3, afterLabel: "" },
    { label: "Intl. Equity", tickers: ["VXUS"], before: 3.2, afterLabel: "" },
  ];

  const totalSold = orderedFunds.reduce((s, t) => s + (fundAmounts[t] ?? 0), 0);
  const newTotal = 580745.29 - totalSold;

  const assetTiles = ASSET_CLASSES.map((ac) => {
    const soldFromClass = ac.tickers.reduce((s, t) => s + (fundAmounts[t] ?? 0), 0);
    const currentValue = {
      us_equity: 200212 + 87254 + 29394,
      us_bond: 117963,
      intl_equity: 18536,
    }[ac.tickers[0] === "VBTLX" ? "us_bond" : ac.tickers[0] === "VXUS" ? "intl_equity" : "us_equity"] ?? 0;
    const afterValue = currentValue - soldFromClass;
    const afterPct = newTotal > 0 ? (afterValue / newTotal) * 100 : 0;
    return {
      ...ac,
      before: ac.before,
      after: Math.round(afterPct * 10) / 10,
    };
  });

  return (
    <div className={styles.pageWrapper}>
      <GlobalNav />
      <HeroBanner
        title="Order Confirmation"
        subtitle="Your sell order has been submitted"
        breadcrumbs={[
          { label: "My accounts", href: "/portfolio/balances" },
          { label: "Sell & Rebalance", href: "/portfolio/sell-rebalance" },
          { label: "Confirmation" },
        ]}
      />
      <SectionNav tabs={SECTION_TABS} />

      <main className={styles.main}>
        <div className={styles.mainInner}>
          {/* Success banner */}
          <div className={styles.successBanner}>
            <div className={styles.successIcon}>✓</div>
            <div className={styles.successText}>
              <strong>Order Submitted Successfully</strong>
              <p>Your sell order has been placed and is being processed.</p>
            </div>
          </div>

          {/* Orders + Tax summary side by side */}
          <div className={styles.topGrid}>
            {/* Orders table */}
            <div className={styles.ordersCard}>
              <div className={styles.cardHeader}>Orders Placed</div>
              <table className={styles.ordersTable}>
                <thead>
                  <tr>
                    <th>Fund</th>
                    <th>Amount</th>
                    <th>≈ Shares</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orderedFunds.map((ticker) => {
                    const sellAmt = fundAmounts[ticker] ?? 0;
                    const shares = (sellAmt / NAVS[ticker]).toFixed(3);
                    return (
                      <tr key={ticker}>
                        <td>
                          <div className={styles.fundTicker}>{ticker}</div>
                          <div className={styles.fundName}>{FUND_NAMES[ticker]}</div>
                        </td>
                        <td className={styles.numeric}>{fmtMoney(sellAmt)}</td>
                        <td className={styles.numeric}>{shares}</td>
                        <td>
                          <span className={styles.statusBadge}>Submitted</span>
                        </td>
                      </tr>
                    );
                  })}
                  <tr className={styles.totalRow}>
                    <td><strong>Total</strong></td>
                    <td className={styles.numeric}><strong>{fmtMoney(totalSold)}</strong></td>
                    <td></td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Tax summary */}
            <div className={styles.taxCard}>
              <div className={`${styles.cardHeader} ${isManual ? styles.cardHeaderManual : styles.cardHeaderOptimized}`}>
                {isManual ? "Tax Summary — Manual Entry" : "Tax Summary — Optimized"}
              </div>

              {isManual ? (
                <div className={styles.taxCalloutManual}>
                  Automated optimisation would have reduced your tax to{" "}
                  <strong>${OPTIMIZED_TAX}.00</strong> ({OPTIMIZED_RATE}% effective rate){" "}
                  — saving you <strong>${taxSavings.toFixed(2)}</strong>. Consider using the engine next time.
                </div>
              ) : (
                <div className={styles.taxCalloutOptimized}>
                  You saved <strong>${taxSavings.toFixed(2)}</strong> compared to selling without optimization.
                </div>
              )}

              {taxResult ? (
                <div className={styles.taxRows}>
                  <div className={styles.taxRow}>
                    <span className={styles.taxLabel}>ST Capital Gains</span>
                    <span className={`${styles.taxValue} ${taxResult.st_gains >= 0 ? styles.positive : styles.negative}`}>{fmtGL(taxResult.st_gains)}</span>
                  </div>
                  <div className={styles.taxRow}>
                    <span className={styles.taxLabel}>LT Capital Gains</span>
                    <span className={`${styles.taxValue} ${taxResult.lt_gains >= 0 ? styles.positive : styles.negative}`}>{fmtGL(taxResult.lt_gains)}</span>
                  </div>
                  <div className={styles.taxRow}>
                    <span className={styles.taxLabel}>Losses Harvested</span>
                    <span className={`${styles.taxValue} ${styles.positive}`}>
                      {taxResult.losses_harvested > 0 ? `-$${taxResult.losses_harvested.toLocaleString("en-US", {minimumFractionDigits: 2, maximumFractionDigits: 2})}` : "$0.00"}
                    </span>
                  </div>
                  <div className={styles.taxRow}>
                    <span className={styles.taxLabel}>Net Taxable Gain</span>
                    <span className={styles.taxValue}>{fmtMoney(taxResult.net_taxable_gain)}</span>
                  </div>
                  <div className={styles.taxRow}>
                    <span className={styles.taxLabel}>Federal Tax</span>
                    <span className={styles.taxValue}>{fmtMoney(taxResult.federal_tax)}</span>
                  </div>
                  <div className={styles.taxRow}>
                    <span className={styles.taxLabel}>State Tax</span>
                    <span className={styles.taxValue}>{fmtMoney(taxResult.state_tax)}</span>
                  </div>
                  <div className={`${styles.taxRow} ${styles.taxRowTotal}`}>
                    <span className={styles.taxLabel}>Est. Total Tax</span>
                    <span className={styles.taxValue}><strong>{fmtMoney(taxResult.total_tax)}</strong></span>
                  </div>
                  <div className={styles.taxRow}>
                    <span className={styles.taxLabel}>Effective Rate</span>
                    <span className={styles.taxValue}>{taxResult.effective_rate.toFixed(2)}%</span>
                  </div>
                </div>
              ) : (
                <div className={styles.taxRows}>
                  <div style={{ padding: "20px", color: "var(--text-muted)", fontSize: 13 }}>Loading tax summary…</div>
                </div>
              )}
            </div>
          </div>

          {/* Portfolio Rebalancing Impact */}
          <div className={styles.rebalanceCard}>
            <div className={styles.cardHeader}>Portfolio Rebalancing Impact</div>
            <div className={styles.assetTiles}>
              {assetTiles.map((ac) => (
                <div key={ac.label} className={styles.assetTile}>
                  <div className={styles.assetTileLabel}>{ac.label}</div>
                  <div className={styles.assetTileArrow}>
                    <span className={styles.assetBefore}>{ac.before.toFixed(1)}%</span>
                    <span className={styles.assetArrow}>→</span>
                    <span className={styles.assetAfter}>{ac.after.toFixed(1)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* What Happens Next — horizontal stepper */}
          <div className={styles.stepsCard}>
            <div className={styles.cardHeader}>What Happens Next</div>
            <div className={styles.stepperRow}>
              {STEPS.map((step, idx) => (
                <div key={step.step} className={styles.stepperItem}>
                  <div className={`${styles.stepCircle} ${idx === 0 ? styles.stepCircleActive : styles.stepCircleGrey}`}>
                    {step.step}
                  </div>
                  {idx < STEPS.length - 1 && <div className={styles.stepperConnector} />}
                  <div className={styles.stepperText}>
                    <div className={styles.stepTitle}>{step.title}</div>
                    <div className={styles.stepDesc}>{step.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className={styles.actions}>
            <Link href="/portfolio/balances" className={styles.btnPrimary}>
              ← Return to Portfolio
            </Link>
            <button className={styles.btnSecondary} onClick={() => window.print()}>
              Download Confirmation PDF
            </button>
            <button className={styles.btnSecondary}>
              View Order Status
            </button>
            <Link href="/portfolio/sell-rebalance" className={styles.btnLink}>
              Start another transaction
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense>
      <ConfirmationContent />
    </Suspense>
  );
}
