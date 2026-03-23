"use client";

import { useState } from "react";
import styles from "./FundCards.module.css";
import type { PerFundScenario, LotDetail } from "@/lib/types";
import { BROKERAGE_HOLDINGS } from "@/lib/data";

interface FundCardsProps {
  funds: PerFundScenario[];
  amounts: Record<string, string>;
  onAmountChange: (ticker: string, value: string) => void;
  navs: Record<string, number>;
  readOnly?: boolean;
}

const NAVS: Record<string, number> = {
  VTSAX: 785.34, VBTLX: 92.85, VFIAX: 519.37, VIGAX: 188.42, VXUS: 63.48,
};

const LOTS_BY_TICKER: Record<string, LotDetail[]> = {};
for (const holding of BROKERAGE_HOLDINGS) {
  const nav = NAVS[holding.ticker] ?? 1;
  LOTS_BY_TICKER[holding.ticker] = holding.lots.map((lot) => ({
    lot_id: lot.lot_id,
    purchase_date: lot.purchase_date,
    shares_sold: lot.shares,
    cost_basis_per_share: lot.cost_basis_per_share,
    proceeds_per_share: nav,
    gain_loss: (nav - lot.cost_basis_per_share) * lot.shares,
    is_long_term: lot.is_long_term,
    term: (lot.is_long_term ? "LT" : "ST") as "LT" | "ST",
  }));
}

const CURRENT_VALUES: Record<string, number> = {
  VTSAX: 200212,
  VBTLX: 117963,
  VFIAX: 87254,
  VIGAX: 29394,
  VXUS: 18536,
};

function fmtMoney(n: number) {
  if (n === 0) return "$0";
  const abs = Math.abs(n);
  return (n < 0 ? "-$" : "$") + abs.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function fmtGL(n: number) {
  const abs = Math.abs(n);
  return (n < 0 ? "-$" : "+$") + abs.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function glClass(n: number, styles: Record<string, string>) {
  if (n > 0) return styles.positive;
  if (n < 0) return styles.negative;
  return styles.zero;
}

export default function FundCards({ funds, amounts, onAmountChange, navs, readOnly = false }: FundCardsProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const toggleExpand = (ticker: string) => {
    setExpanded((prev) => ({ ...prev, [ticker]: !prev[ticker] }));
  };

  return (
    <div className={styles.cardsGrid}>
      {funds.map((fund) => {
        const rawAmount = amounts[fund.ticker] ?? "";
        const numAmount = parseFloat(rawAmount.replace(/,/g, "")) || 0;
        const nav = navs[fund.ticker] ?? 1;
        const approxShares = numAmount > 0 ? `≈ ${(numAmount / nav).toFixed(3)} shares` : "";
        const showGl = fund.sell_amount > 0;
        const isExpanded = expanded[fund.ticker];
        const lots = LOTS_BY_TICKER[fund.ticker] ?? [];
        const method = fund.ticker === "VBTLX" ? "FIFO" : "MinTax";

        return (
          <div key={fund.ticker} className={styles.card}>
            <div className={styles.cardHeader}>
              <div>
                <div className={styles.cardTicker}>{fund.ticker}</div>
                <div className={styles.cardName}>{fund.name}</div>
              </div>
              <span className={styles.methodBadge}>{method}</span>
            </div>

            <div className={styles.cardBody}>
              <div className={styles.statRow}>
                <span className={styles.statLabel}>Current Value</span>
                <span className={styles.statValue}>{fmtMoney(CURRENT_VALUES[fund.ticker] ?? 0)}</span>
              </div>

              <div className={styles.statRow}>
                <span className={styles.statLabel}>ST Gain/Loss</span>
                <span className={`${styles.statValue} ${showGl ? glClass(fund.st_gain_loss, styles) : styles.zero}`}>
                  {showGl ? fmtGL(fund.st_gain_loss) : "—"}
                </span>
              </div>

              <div className={styles.statRow}>
                <span className={styles.statLabel}>LT Gain/Loss</span>
                <span className={`${styles.statValue} ${showGl ? glClass(fund.lt_gain_loss, styles) : styles.zero}`}>
                  {showGl ? fmtGL(fund.lt_gain_loss) : "—"}
                </span>
              </div>

              <div className={styles.cardInput}>
                <div className={styles.inputLabel}>Sell Amount</div>
                {readOnly ? (
                  <div className={styles.readOnlyAmount}>
                    {numAmount > 0 ? fmtMoney(numAmount) : <span style={{ color: "var(--text-muted)" }}>—</span>}
                    {approxShares && <div className={styles.sharesApprox}>{approxShares}</div>}
                  </div>
                ) : (
                  <>
                    <div className={styles.inputWrap}>
                      <span className={styles.inputPrefix}>$</span>
                      <input
                        type="text"
                        className={styles.inputField}
                        value={rawAmount}
                        onChange={(e) => onAmountChange(fund.ticker, e.target.value)}
                        placeholder="0"
                        aria-label={`Sell amount for ${fund.ticker}`}
                      />
                    </div>
                    {approxShares && (
                      <div className={styles.sharesApprox}>{approxShares}</div>
                    )}
                  </>
                )}
              </div>

              {lots.length > 0 && (
                <button
                  className={styles.expandBtn}
                  onClick={() => toggleExpand(fund.ticker)}
                  aria-expanded={isExpanded}
                >
                  <span className={`${styles.expandIcon}${isExpanded ? ` ${styles.expandIconOpen}` : ""}`}>▼</span>
                  {isExpanded ? "Hide tax lots" : "Show tax lots"}
                </button>
              )}

              {isExpanded && lots.length > 0 && (
                <div className={styles.lotList}>
                  {lots.map((lot) => (
                    <div key={lot.lot_id} className={styles.lotItem}>
                      <span>
                        <span className={`${styles.lotBadge} ${lot.is_long_term ? styles.lotLT : styles.lotST}`}>
                          {lot.term}
                        </span>
                        {" "}{lot.purchase_date} — {lot.shares_sold.toFixed(3)} shares
                      </span>
                      <span className={lot.gain_loss >= 0 ? styles.positive : styles.negative}>
                        {fmtGL(lot.gain_loss)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
