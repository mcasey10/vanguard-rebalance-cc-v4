"use client";

import { useEffect, useState, useCallback, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import GlobalNav from "@/components/GlobalNav";
import HeroBanner from "@/components/HeroBanner";
import SectionNav from "@/components/SectionNav";
import StatsBar from "@/components/StatsBar";
import FundTable from "@/components/FundTable";
import FundCards from "@/components/FundCards";
import styles from "./page.module.css";
import type { ScenarioTaxImpact, PerFundScenario } from "@/lib/types";
import { BROKERAGE_HOLDINGS } from "@/lib/data";
import { saveFundAmounts } from "@/lib/amountStore";
import { useSellContext } from "@/lib/SellContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8003";

const TICKERS = ["VTSAX", "VFIAX", "VBTLX", "VIGAX", "VXUS"];

const SECTION_TABS = [
  { label: "Dashboard", href: "#" },
  { label: "Balances", href: "/portfolio/balances" },
  { label: "Holdings", href: "#" },
  { label: "Sell & Rebalance", href: "/portfolio/sell-rebalance" },
  { label: "Activity", href: "#" },
  { label: "Performance", href: "#" },
  { label: "Portfolio Watch", href: "#" },
];

const MODE_TABS = [
  { label: "Auto", href: "/portfolio/sell-rebalance" },
  { label: "Manual", href: "/portfolio/sell-rebalance/manual" },
  { label: "Scenarios", href: "/portfolio/sell-rebalance/scenarios" },
];

const NAVS: Record<string, number> = {
  VTSAX: 785.34,
  VBTLX: 92.85,
  VFIAX: 519.37,
  VIGAX: 188.42,
  VXUS: 63.48,
};

function fmtMoney(n: number) {
  return "$" + Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const EMPTY_FUND: PerFundScenario = {
  ticker: "",
  name: "",
  sell_amount: 0,
  st_gain_loss: 0,
  lt_gain_loss: 0,
  est_tax: 0,
  shares_sold: 0,
  lots: [],
};

function emptyFunds(): PerFundScenario[] {
  return TICKERS.map((t) => ({
    ...EMPTY_FUND,
    ticker: t,
    name: BROKERAGE_HOLDINGS.find((h) => h.ticker === t)?.name ?? t,
  }));
}

function ManualPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { recommendation: ctxRec } = useSellContext();

  // Seed amounts at initialisation from SellContext (never via useEffect).
  // Priority: URL params (deep-link / direct nav) → SellContext recommendation → $0
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [amounts, setAmounts] = useState<Record<string, string>>(() => {
    const obj: Record<string, string> = {};
    for (const t of TICKERS) {
      const fromUrl = searchParams.get(t);
      if (fromUrl !== null) {
        // URL params set by goToManual() — trust them (only non-zero funds are included)
        obj[t] = fromUrl;
      } else if (ctxRec) {
        // No URL param → read from SellContext recommendation
        const fund = ctxRec.funds.find((f) => f.ticker === t);
        obj[t] = fund && fund.recommended_sell > 0 ? String(fund.recommended_sell) : "";
      } else {
        obj[t] = "";
      }
    }
    return obj;
  });
  const [scenarioResult, setScenarioResult] = useState<ScenarioTaxImpact | null>(null);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchScenario = useCallback(async (amts: Record<string, string>) => {
    const fund_amounts: Record<string, number> = {};
    for (const t of TICKERS) {
      fund_amounts[t] = parseFloat(amts[t]?.replace(/,/g, "") ?? "0") || 0;
    }
    // Always fetch — even all-zeros returns reference lots for lot expansion
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/scenario`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ account_id: "brokerage-001", fund_amounts }),
      });
      if (!res.ok) throw new Error("API error");
      const data: ScenarioTaxImpact = await res.json();
      setScenarioResult(data);
    } catch (_) {
      // fail silently
    } finally {
      setLoading(false);
    }
  }, []);

  // On mount, fetch initial scenario if amounts present
  useEffect(() => {
    const hasAmounts = TICKERS.some((t) => amounts[t] && parseFloat(amounts[t]) > 0);
    if (hasAmounts) {
      fetchScenario(amounts);
    } else {
      // Still fetch for zero state to get baseline
      fetchScenario(amounts);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAmountChange = (ticker: string, value: string) => {
    // Only allow digits, commas, dots
    const cleaned = value.replace(/[^0-9.,]/g, "");
    const newAmounts = { ...amounts, [ticker]: cleaned };
    setAmounts(newAmounts);
    saveFundAmounts(newAmounts);

    // Debounce API call
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchScenario(newAmounts);
    }, 400);
  };

  const buildStats = () => {
    if (!scenarioResult) return [];
    const totalSale = TICKERS.reduce((s, t) => s + (parseFloat(amounts[t]?.replace(/,/g, "") ?? "0") || 0), 0);
    return [
      { label: "Sale Amount", value: fmtMoney(totalSale) },
      {
        label: "ST Capital Gains",
        value: (scenarioResult.st_gains >= 0 ? "+" : "") + fmtMoney(scenarioResult.st_gains),
        type: scenarioResult.st_gains >= 0 ? "default" as const : "positive" as const,
      },
      {
        label: "LT Capital Gains",
        value: (scenarioResult.lt_gains >= 0 ? "+" : "") + fmtMoney(scenarioResult.lt_gains),
        type: scenarioResult.lt_gains >= 0 ? "default" as const : "positive" as const,
      },
      {
        label: "Losses Harvested",
        value: scenarioResult.losses_harvested > 0 ? `-${fmtMoney(scenarioResult.losses_harvested)}` : "$0",
        type: scenarioResult.losses_harvested > 0 ? "positive" as const : "default" as const,
      },
      { label: "Est. Total Tax", value: fmtMoney(scenarioResult.total_tax) },
      { label: "Eff. Tax Rate", value: `${scenarioResult.effective_rate.toFixed(2)}%` },
    ];
  };

  const goToScenarios = () => {
    const params = new URLSearchParams();
    params.set("source", "manual");
    for (const t of TICKERS) {
      if (amounts[t] && parseFloat(amounts[t]) > 0) {
        params.set(t, amounts[t]);
      }
    }
    router.push(`/portfolio/sell-rebalance/scenarios?${params.toString()}`);
  };

  const goToConfirmation = () => {
    const params = new URLSearchParams();
    params.set("source", "manual");
    const totalSale = TICKERS.reduce((s, t) => s + (parseFloat(amounts[t]?.replace(/,/g, "") ?? "0") || 0), 0);
    params.set("amount", String(totalSale));
    for (const t of TICKERS) {
      const v = parseFloat(amounts[t]?.replace(/,/g, "") ?? "0") || 0;
      if (v > 0) params.set(t, String(v));
    }
    router.push(`/portfolio/sell-rebalance/confirmation?${params.toString()}`);
  };

  const fundsForTable = scenarioResult
    ? scenarioResult.per_fund_breakdown
    : emptyFunds();

  const hasAnyAmount = TICKERS.some((t) => amounts[t] && parseFloat(amounts[t]) > 0);

  return (
    <div className={styles.pageWrapper}>
      <GlobalNav />
      <HeroBanner
        title="Sell &amp; Rebalance — Manual"
        subtitle="Enter custom sell amounts for each fund"
        breadcrumbs={[
          { label: "My accounts", href: "/portfolio/balances" },
          { label: "Sell &amp; Rebalance", href: "/portfolio/sell-rebalance" },
          { label: "Manual" },
        ]}
      />
      <SectionNav tabs={SECTION_TABS} />

      {/* Mode tabs */}
      <div className={styles.modeTabs}>
        <div className={styles.modeTabsInner}>
          {MODE_TABS.map((tab) => (
            <Link
              key={tab.label}
              href={tab.href}
              className={`${styles.modeTab}${tab.href === "/portfolio/sell-rebalance/manual" ? ` ${styles.modeTabActive}` : ""}`}
            >
              {tab.label}
            </Link>
          ))}
        </div>
      </div>

      <main className={styles.main}>
        <div className={styles.mainInner}>
          {/* Stats bar — shown on page load with whatever amounts */}
          {scenarioResult && hasAnyAmount && (
            <StatsBar stats={buildStats()} />
          )}

          {/* Table section */}
          <div className={styles.tableSection}>
            <div className={styles.tableSectionHeader}>
              <div>
                <h2 className={styles.tableSectionTitle}>Fund Sell Amounts</h2>
                <div className={styles.tableSectionMeta}>
                  Enter amounts for each fund. Tax impact updates automatically.
                  {loading && <span className={styles.calcIndicator}> Calculating…</span>}
                </div>
              </div>

              {/* Table / Cards toggle */}
              <div className={styles.viewToggle}>
                <button
                  className={`${styles.toggleBtn}${viewMode === "table" ? ` ${styles.toggleBtnActive}` : ""}`}
                  onClick={() => setViewMode("table")}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <line x1="3" y1="12" x2="21" y2="12" />
                    <line x1="3" y1="18" x2="21" y2="18" />
                  </svg>
                  Table
                </button>
                <button
                  className={`${styles.toggleBtn}${viewMode === "cards" ? ` ${styles.toggleBtnActive}` : ""}`}
                  onClick={() => setViewMode("cards")}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="7" height="7" />
                    <rect x="14" y="3" width="7" height="7" />
                    <rect x="3" y="14" width="7" height="7" />
                    <rect x="14" y="14" width="7" height="7" />
                  </svg>
                  Cards
                </button>
              </div>
            </div>

            {viewMode === "table" ? (
              <FundTable
                mode="manual"
                funds={fundsForTable}
                amounts={amounts}
                onAmountChange={handleAmountChange}
                navs={NAVS}
              />
            ) : (
              <FundCards
                funds={fundsForTable}
                amounts={amounts}
                onAmountChange={handleAmountChange}
                navs={NAVS}
              />
            )}
          </div>

          {/* Actions */}
          <div className={styles.actions}>
            <button
              className={styles.btnPrimary}
              onClick={goToConfirmation}
              disabled={!hasAnyAmount}
            >
              Execute this recommendation
            </button>
            <button
              className={styles.btnSecondary}
              onClick={goToScenarios}
            >
              Scenario Analysis
            </button>
            <Link href="/portfolio/sell-rebalance" className={styles.btnLink}>
              ← Switch to Auto mode
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function ManualPage() {
  return (
    <Suspense>
      <ManualPageContent />
    </Suspense>
  );
}
