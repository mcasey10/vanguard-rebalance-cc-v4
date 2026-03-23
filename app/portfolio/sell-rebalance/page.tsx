"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import GlobalNav from "@/components/GlobalNav";
import HeroBanner from "@/components/HeroBanner";
import SectionNav from "@/components/SectionNav";
import StatsBar from "@/components/StatsBar";
import FundTable from "@/components/FundTable";
import FundCards from "@/components/FundCards";
import WaitSaveModal from "@/components/WaitSaveModal";
import styles from "./page.module.css";
import type { SellRecommendation } from "@/lib/types";
import { saveAutoAmount, loadAutoAmount, saveFundAmounts } from "@/lib/amountStore";
import { useSellContext } from "@/lib/SellContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8003";

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

function fmtMoney(n: number) {
  return "$" + Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function AutoPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setRecommendation: setSellContextRec } = useSellContext();
  const [amount, setAmount] = useState("");
  const [recommendation, setRecommendation] = useState<SellRecommendation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasCalcOnce, setHasCalcOnce] = useState(false);
  const [showWaitSave, setShowWaitSave] = useState(false);
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");

  // Auto-fetch if ?amount= param present, else restore from sessionStorage
  useEffect(() => {
    const amtParam = searchParams.get("amount");
    const stored = loadAutoAmount();
    const resolved = amtParam || stored;
    if (resolved) {
      setAmount(resolved);
      fetchRecommendation(parseFloat(resolved));
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchRecommendation = useCallback(async (amountVal?: number) => {
    const val = amountVal ?? parseFloat(amount.replace(/,/g, ""));
    if (!val || val <= 0) {
      setError("Please enter a valid withdrawal amount.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/recommend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ account_id: "brokerage-001", withdrawal_amount: val }),
      });
      if (!res.ok) throw new Error("API error");
      const data: SellRecommendation = await res.json();
      setRecommendation(data);
      setSellContextRec(data);
      setHasCalcOnce(true);
    } catch (e) {
      setError("Failed to get recommendation. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [amount]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") fetchRecommendation();
  };

  const buildStats = () => {
    if (!recommendation) return [];
    return [
      { label: "Sale Amount", value: fmtMoney(recommendation.total_sale) },
      {
        label: "ST Capital Gains",
        value: (recommendation.st_gains >= 0 ? "+" : "") + fmtMoney(recommendation.st_gains),
        type: recommendation.st_gains >= 0 ? "default" as const : "positive" as const,
      },
      {
        label: "LT Capital Gains",
        value: (recommendation.lt_gains >= 0 ? "+" : "") + fmtMoney(recommendation.lt_gains),
        type: recommendation.lt_gains >= 0 ? "default" as const : "positive" as const,
      },
      {
        label: "Losses Harvested",
        value: recommendation.losses_harvested > 0 ? `-${fmtMoney(recommendation.losses_harvested)}` : "$0",
        type: recommendation.losses_harvested > 0 ? "positive" as const : "default" as const,
      },
      { label: "Est. Total Tax", value: fmtMoney(recommendation.total_tax) },
      { label: "Eff. Tax Rate", value: `${recommendation.effective_rate.toFixed(2)}%` },
    ];
  };

  const goToConfirmation = () => {
    if (!recommendation) return;
    const params = new URLSearchParams();
    params.set("amount", String(recommendation.withdrawal_amount));
    params.set("source", "auto");
    params.set("rec_id", recommendation.recommendation_id);
    for (const fund of recommendation.funds) {
      if (fund.recommended_sell > 0) {
        params.set(fund.ticker, String(fund.recommended_sell));
      }
    }
    router.push(`/portfolio/sell-rebalance/confirmation?${params.toString()}`);
  };

  const goToManual = () => {
    const params = new URLSearchParams();
    if (recommendation) {
      // Pre-populate Manual with per-fund recommendation amounts
      // Only set URL params for funds with non-zero sells; zero-sell funds stay blank
      const fundAmts: Record<string, string> = {};
      for (const fund of recommendation.funds) {
        if (fund.recommended_sell > 0) {
          params.set(fund.ticker, String(fund.recommended_sell));
          fundAmts[fund.ticker] = String(fund.recommended_sell);
        } else {
          fundAmts[fund.ticker] = "";
        }
      }
      params.set("amount", String(recommendation.total_sale));
      saveFundAmounts(fundAmts);
    } else if (amount) {
      params.set("amount", amount.replace(/,/g, ""));
    }
    router.push(`/portfolio/sell-rebalance/manual?${params.toString()}`);
  };

  return (
    <div className={styles.pageWrapper}>
      <GlobalNav />
      <HeroBanner
        title="Sell &amp; Rebalance"
        subtitle="Optimize your withdrawal with tax-efficient selling"
        breadcrumbs={[
          { label: "My accounts", href: "/portfolio/balances" },
          { label: "Sell &amp; Rebalance" },
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
              className={`${styles.modeTab}${tab.href === "/portfolio/sell-rebalance" ? ` ${styles.modeTabActive}` : ""}`}
            >
              {tab.label}
            </Link>
          ))}
        </div>
      </div>

      <main className={styles.main}>
        <div className={styles.mainInner}>
          {/* Input section */}
          <div className={styles.inputSection}>
            <div className={styles.inputCard}>
              <h2 className={styles.inputTitle}>How much would you like to withdraw?</h2>
              <p className={styles.inputDesc}>
                Enter your target withdrawal amount. We&apos;ll recommend the most tax-efficient combination of funds to sell.
              </p>

              <div className={styles.inputRow}>
                <div className={styles.inputWrap}>
                  <span className={styles.inputPrefix}>$</span>
                  <input
                    type="text"
                    className={styles.amountInput}
                    value={amount}
                    onChange={(e) => { setAmount(e.target.value); saveAutoAmount(e.target.value); }}
                    onKeyDown={handleKeyDown}
                    placeholder="e.g. $10,000"
                    aria-label="Withdrawal amount"
                  />
                </div>
                <button
                  className={styles.btnPrimary}
                  onClick={() => fetchRecommendation()}
                  disabled={loading}
                >
                  {loading ? "Calculating…" : hasCalcOnce ? "Recalculate" : "Get Recommendation"}
                </button>
              </div>

              {error && <p className={styles.error}>{error}</p>}

              <div className={styles.modeLinks}>
                <button onClick={goToManual} className={styles.modeLink}>
                  Switch to Manual mode →
                </button>
                {hasCalcOnce && (
                  <Link href="/portfolio/sell-rebalance/scenarios" className={styles.modeLink}>
                    Scenario Analysis →
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Stats bar — hidden until first fetch */}
          {recommendation && hasCalcOnce && (
            <StatsBar stats={buildStats()} />
          )}

          {/* Wait & Save banner */}
          {recommendation && recommendation.wait_and_save.length > 0 && (
            <div className={styles.waitSaveBanner}>
              <div className={styles.waitSaveBannerInner}>
                <div className={styles.waitSaveIcon}>⏱</div>
                <div className={styles.waitSaveContent}>
                  <strong>Wait &amp; Save Opportunity:</strong> VFIAX lots convert to long-term soon. Waiting could save you up to{" "}
                  <strong>
                    ${recommendation.wait_and_save.reduce((s, l) => s + l.savings, 0).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </strong>{" "}
                  in taxes.
                </div>
                <button className={styles.waitSaveBtn} onClick={() => setShowWaitSave(true)}>
                  View Details
                </button>
              </div>
            </div>
          )}

          {/* Fund table/cards with toggle */}
          {recommendation && (
            <div className={styles.tableSection}>
              <div className={styles.tableSectionHeader}>
                <div>
                  <h3 className={styles.tableSectionTitle}>Recommended Sell Allocations</h3>
                  <div className={styles.tableSectionMeta}>
                    Based on MinTax optimization for your brokerage account
                  </div>
                </div>
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
                <FundTable mode="auto" funds={recommendation.funds} />
              ) : (
                <FundCards
                  funds={recommendation.funds.map(f => ({
                    ticker: f.ticker,
                    name: f.name,
                    sell_amount: f.recommended_sell,
                    st_gain_loss: f.st_gain_loss,
                    lt_gain_loss: f.lt_gain_loss,
                    est_tax: f.est_tax,
                    shares_sold: f.recommended_sell / (({ VTSAX: 785.34, VBTLX: 92.85, VFIAX: 519.37, VIGAX: 188.42, VXUS: 63.48 } as Record<string,number>)[f.ticker] ?? 1),
                    lots: f.lots,
                  }))}
                  amounts={Object.fromEntries(recommendation.funds.map(f => [f.ticker, f.recommended_sell > 0 ? String(f.recommended_sell) : ""]))}
                  onAmountChange={() => {}}
                  navs={{ VTSAX: 785.34, VBTLX: 92.85, VFIAX: 519.37, VIGAX: 188.42, VXUS: 63.48 }}
                  readOnly={true}
                />
              )}
            </div>
          )}

          {/* Action buttons — bottom of table */}
          {recommendation && (
            <div className={styles.actions}>
              <button className={styles.btnPrimary} onClick={goToConfirmation}>
                Execute this recommendation
              </button>
              <button className={styles.btnSecondary} onClick={goToManual}>
                Adjust Manually
              </button>
              <Link href="/portfolio/sell-rebalance/scenarios" className={styles.btnLink}>
                Scenario Analysis
              </Link>
            </div>
          )}
        </div>
      </main>

      {showWaitSave && recommendation && (
        <WaitSaveModal
          lots={recommendation.wait_and_save}
          onClose={() => setShowWaitSave(false)}
          onRemind={() => setShowWaitSave(false)}
          onAdjust={() => {
            setShowWaitSave(false);
            goToManual();
          }}
          onProceed={() => setShowWaitSave(false)}
        />
      )}
    </div>
  );
}

export default function SellRebalancePage() {
  return (
    <Suspense>
      <AutoPageContent />
    </Suspense>
  );
}
