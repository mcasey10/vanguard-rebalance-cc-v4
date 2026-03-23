"use client";

import { useState } from "react";
import styles from "./FundTable.module.css";
import type { FundRecommendation, PerFundScenario, LotDetail } from "@/lib/types";
import { BROKERAGE_HOLDINGS } from "@/lib/data";

// Fixed display order per spec — do not change
const DISPLAY_ORDER = ["VTSAX", "VFIAX", "VBTLX", "VIGAX", "VXUS"];

const NAVS: Record<string, number> = {
  VTSAX: 785.34,
  VBTLX: 92.85,
  VFIAX: 519.37,
  VIGAX: 188.42,
  VXUS: 63.48,
};

const CURRENT_VALUES: Record<string, number> = {
  VTSAX: 200212,
  VBTLX: 117963,
  VFIAX: 87254,
  VIGAX: 29394,
  VXUS: 18536,
};

// Static reference lot data — always available on first mount, no async dependency.
// Used for: term badge, acquisition date, total shares, cost/share.
// G/L is NOT stored here — it comes from the API (sold shares only).
interface StaticLot {
  lot_id: string;
  purchase_date: string;
  shares: number;             // total shares in this lot (reference count)
  cost_basis_per_share: number;
  is_long_term: boolean;
  term: "LT" | "ST";
}

const LOTS_BY_TICKER: Record<string, StaticLot[]> = {};
for (const holding of BROKERAGE_HOLDINGS) {
  LOTS_BY_TICKER[holding.ticker] = holding.lots.map((lot) => ({
    lot_id: lot.lot_id,
    purchase_date: lot.purchase_date,
    shares: lot.shares,
    cost_basis_per_share: lot.cost_basis_per_share,
    is_long_term: lot.is_long_term,
    term: (lot.is_long_term ? "LT" : "ST") as "LT" | "ST",
  }));
}

// Column percentage widths — shared between outer <colgroup> and inner scroll table.
// Auto mode:   Fund | Method | CurVal | RecSell | ST | LT | Tax | Rebal | Rationale
const AUTO_COL_WIDTHS = ["22%", "8%", "11%", "12%", "10%", "10%", "9%", "9%", "9%"];
// Manual mode: Fund | Method | CurVal | ST | LT | Sell$ | Shares
const MANUAL_COL_WIDTHS = ["26%", "10%", "13%", "12%", "12%", "16%", "11%"];

interface AutoTableProps {
  mode: "auto";
  funds: FundRecommendation[];
}

interface ManualTableProps {
  mode: "manual";
  funds: PerFundScenario[];
  amounts: Record<string, string>;
  onAmountChange: (ticker: string, value: string) => void;
  navs: Record<string, number>;
}

type FundTableProps = AutoTableProps | ManualTableProps;

function fmtMoney(n: number) {
  if (n === 0) return "$0.00";
  const abs = Math.abs(n);
  return (n < 0 ? "-$" : "$") + abs.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtGL(n: number) {
  const abs = Math.abs(n);
  return (n < 0 ? "-$" : "+$") + abs.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function glClass(n: number) {
  if (n > 0) return styles.positive;
  if (n < 0) return styles.negative;
  return styles.zero;
}

const fmtShares = (n: number) =>
  n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 3 }) + " sh";

// Renders lot <tr> elements for a fund.
// staticLots: full lot list from lib/data.ts (reference display — dates, shares, cost)
// soldLots: lots returned by API (only lots with actual sells; carries G/L on sold shares)
// hasSells: whether this fund has any sell amount — if false, all G/L cells show "—"
// colCount: 9 = auto, 7 = manual
//
// Column alignment per spec:
//   Auto  (9): Fund=badge+date | Method=shares | CurVal=cost | RecSell=∅ | ST=G/L-if-ST | LT=G/L-if-LT | Tax-Rationale=∅
//   Manual(7): Fund=badge+date | Method=∅ | CurVal=cost | ST=G/L-if-ST | LT=G/L-if-LT | Sell$=∅ | Shares=shares
function LotTrs({
  staticLots,
  soldLots,
  hasSells,
  colCount,
}: {
  staticLots: StaticLot[];
  soldLots: LotDetail[];
  hasSells: boolean;
  colCount: number;
}) {
  const isAuto = colCount === 9;

  // Build map from lot_id → sold LotDetail for O(1) lookup
  const soldMap: Record<string, LotDetail> = {};
  if (hasSells) {
    for (const lot of soldLots) {
      soldMap[lot.lot_id] = lot;
    }
  }

  return (
    <>
      {staticLots.map((lot) => {
        const soldLot = soldMap[lot.lot_id]; // undefined if no shares sold from this lot
        const gl = soldLot !== undefined ? soldLot.gain_loss : null; // null → show "—"

        if (isAuto) {
          return (
            <tr key={lot.lot_id} className={styles.lotRow}>
              {/* Col 1 Fund — term badge + acquisition date (nowrap) */}
              <td style={{ paddingLeft: 32 }}>
                <div className={styles.lotDateCell}>
                  <span className={`${styles.lotBadge} ${lot.is_long_term ? styles.lotLT : styles.lotST}`}>
                    {lot.term}
                  </span>
                  <span style={{ whiteSpace: "nowrap" }}>Acq. {lot.purchase_date}</span>
                </div>
              </td>
              {/* Col 2 Method — total lot shares (reference count) */}
              <td style={{ textAlign: "left", fontSize: 12, color: "var(--text-mid)" }}>
                {fmtShares(lot.shares)}
              </td>
              {/* Col 3 Current Value — cost/share */}
              <td style={{ textAlign: "right", fontSize: 12, color: "var(--text-mid)" }}>
                ${lot.cost_basis_per_share.toFixed(2)}
              </td>
              {/* Col 4 Recommended Sell — empty */}
              <td />
              {/* Col 5 ST G/L — show sold G/L only if this is an ST lot with sells */}
              <td
                className={!lot.is_long_term && gl !== null ? glClass(gl) : styles.zero}
                style={{ textAlign: "right", fontSize: 12 }}
              >
                {!lot.is_long_term && gl !== null ? fmtGL(gl) : "—"}
              </td>
              {/* Col 6 LT G/L — show sold G/L only if this is an LT lot with sells */}
              <td
                className={lot.is_long_term && gl !== null ? glClass(gl) : styles.zero}
                style={{ textAlign: "right", fontSize: 12 }}
              >
                {lot.is_long_term && gl !== null ? fmtGL(gl) : "—"}
              </td>
              {/* Col 7–9 empty */}
              <td colSpan={3} />
            </tr>
          );
        }

        // Manual mode
        return (
          <tr key={lot.lot_id} className={styles.lotRow}>
            {/* Col 1 Fund — term badge + acquisition date (nowrap) */}
            <td style={{ paddingLeft: 16 }}>
              <div className={styles.lotDateCell}>
                <span className={`${styles.lotBadge} ${lot.is_long_term ? styles.lotLT : styles.lotST}`}>
                  {lot.term}
                </span>
                <span style={{ whiteSpace: "nowrap", color: "var(--text-mid)" }}>Acq. {lot.purchase_date}</span>
              </div>
            </td>
            {/* Col 2 Method — empty */}
            <td />
            {/* Col 3 Current Value — cost/share */}
            <td style={{ textAlign: "right", fontSize: 12, color: "var(--text-mid)" }}>
              ${lot.cost_basis_per_share.toFixed(2)}
            </td>
            {/* Col 4 ST G/L — sold G/L if ST lot, else "—" */}
            <td
              className={!lot.is_long_term && gl !== null ? glClass(gl) : styles.zero}
              style={{ textAlign: "right", fontSize: 12 }}
            >
              {!lot.is_long_term && gl !== null ? fmtGL(gl) : "—"}
            </td>
            {/* Col 5 LT G/L — sold G/L if LT lot, else "—" */}
            <td
              className={lot.is_long_term && gl !== null ? glClass(gl) : styles.zero}
              style={{ textAlign: "right", fontSize: 12 }}
            >
              {lot.is_long_term && gl !== null ? fmtGL(gl) : "—"}
            </td>
            {/* Col 6 Sell ($) — empty */}
            <td />
            {/* Col 7 ≈ Shares — total lot shares (reference count) */}
            <td style={{ textAlign: "right", fontSize: 12, color: "var(--text-mid)" }}>
              {fmtShares(lot.shares)}
            </td>
          </tr>
        );
      })}
    </>
  );
}

// Wraps lot rows in a scroll container when there are more than 4 lots.
// Uses <tr><td colSpan><div><inner table> to avoid display:block on tbody
// (which breaks column alignment with the parent table).
function LotExpansion({
  ticker,
  colCount,
  soldLots,
  hasSells,
}: {
  ticker: string;
  colCount: number;
  soldLots: LotDetail[];
  hasSells: boolean;
}) {
  const staticLots = LOTS_BY_TICKER[ticker] ?? [];
  const colWidths = colCount === 9 ? AUTO_COL_WIDTHS : MANUAL_COL_WIDTHS;

  if (staticLots.length === 0) return null;

  if (staticLots.length <= 4) {
    return (
      <LotTrs
        staticLots={staticLots}
        soldLots={soldLots}
        hasSells={hasSells}
        colCount={colCount}
      />
    );
  }

  // Scrollable: nest in a colSpan cell so we avoid display:block on tbody
  return (
    <tr>
      <td colSpan={colCount} style={{ padding: 0 }}>
        <div className={styles.lotsScrollWrap}>
          <table className={styles.innerLotTable}>
            <colgroup>
              {colWidths.map((w, i) => (
                <col key={i} style={{ width: w }} />
              ))}
            </colgroup>
            <tbody>
              <LotTrs
                staticLots={staticLots}
                soldLots={soldLots}
                hasSells={hasSells}
                colCount={colCount}
              />
            </tbody>
          </table>
        </div>
      </td>
    </tr>
  );
}

export default function FundTable(props: FundTableProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const toggleExpand = (ticker: string) => {
    setExpanded((prev) => ({ ...prev, [ticker]: !prev[ticker] }));
  };

  if (props.mode === "auto") {
    const { funds } = props;
    const sortedFunds = DISPLAY_ORDER
      .map((t) => funds.find((f) => f.ticker === t))
      .filter(Boolean) as FundRecommendation[];

    return (
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <colgroup>
            {AUTO_COL_WIDTHS.map((w, i) => (
              <col key={i} style={{ width: w }} />
            ))}
          </colgroup>
          <thead>
            <tr>
              <th>Fund</th>
              <th style={{ textAlign: "left" }}>Method</th>
              <th>Current Value</th>
              <th>Recommended Sell</th>
              <th>ST Gain/Loss</th>
              <th>LT Gain/Loss</th>
              <th>Est. Tax</th>
              <th>Rebalancing</th>
              <th>Rationale</th>
            </tr>
          </thead>
          {sortedFunds.map((fund) => {
            const isExpanded = expanded[fund.ticker];
            const staticLots = LOTS_BY_TICKER[fund.ticker] ?? [];
            const isVfiaxSkipped = fund.ticker === "VFIAX" && fund.recommended_sell === 0;

            return (
              <tbody key={fund.ticker}>
                <tr
                  className={
                    isVfiaxSkipped
                      ? styles.vfiaxRow
                      : fund.recommended_sell === 0
                      ? styles.zeroRow
                      : ""
                  }
                >
                  <td>
                    <div className={styles.fundCell}>
                      <div className={styles.fundTickerRow}>
                        <span className={styles.fundTicker}>{fund.ticker}</span>
                        {isVfiaxSkipped && (
                          <span className={styles.waitSaveBadge}>WAIT &amp; SAVE $228</span>
                        )}
                      </div>
                      <span className={styles.fundName}>{fund.name}</span>
                      {isVfiaxSkipped && (
                        <span className={styles.waitSaveHint}>
                          2 lots convert to long-term on April 4 and May 1, 2026 — waiting could save ~$228 in taxes
                        </span>
                      )}
                      {staticLots.length > 0 && (
                        <button
                          className={styles.expandBtn}
                          onClick={() => toggleExpand(fund.ticker)}
                          aria-expanded={isExpanded}
                        >
                          <span className={`${styles.expandIcon}${isExpanded ? ` ${styles.expandIconOpen}` : ""}`}>▼</span>
                          {isExpanded ? "Hide lots" : "Show lots"}
                        </button>
                      )}
                    </div>
                  </td>
                  <td style={{ textAlign: "left" }}>
                    {isVfiaxSkipped ? (
                      <span className={styles.methodDash}>—</span>
                    ) : (
                      <span className={styles.methodBadge}>{fund.method}</span>
                    )}
                  </td>
                  <td>{fmtMoney(fund.current_value)}</td>
                  <td>
                    {isVfiaxSkipped ? (
                      <span className={styles.considerWaiting}>$0 (consider waiting)</span>
                    ) : fund.recommended_sell > 0 ? (
                      <span className={styles.sellHighlight}>{fmtMoney(fund.recommended_sell)}</span>
                    ) : (
                      <span className={styles.zero}>{fmtMoney(fund.recommended_sell)}</span>
                    )}
                  </td>
                  <td className={glClass(fund.st_gain_loss)}>
                    {fund.recommended_sell === 0 ? "—" : fmtGL(fund.st_gain_loss)}
                  </td>
                  <td className={glClass(fund.lt_gain_loss)}>
                    {fund.recommended_sell === 0 ? "—" : fmtGL(fund.lt_gain_loss)}
                  </td>
                  <td style={{ color: fund.est_tax < 0 ? "var(--positive)" : fund.est_tax > 0 ? "var(--negative)" : "inherit" }}>
                    {fund.recommended_sell === 0 ? "—" : fmtMoney(fund.est_tax)}
                  </td>
                  <td>
                    <span className={styles.rationaleText}>{fund.rebalancing_impact}</span>
                  </td>
                  <td>
                    <span className={styles.rationaleText}>{fund.rationale}</span>
                  </td>
                </tr>
                {isExpanded && staticLots.length > 0 && (
                  <LotExpansion
                    ticker={fund.ticker}
                    colCount={9}
                    soldLots={fund.lots ?? []}
                    hasSells={fund.recommended_sell > 0}
                  />
                )}
              </tbody>
            );
          })}
        </table>
      </div>
    );
  }

  // Manual mode
  const { funds, amounts, onAmountChange, navs } = props;
  const sortedFunds = DISPLAY_ORDER
    .map((t) => funds.find((f) => f.ticker === t))
    .filter(Boolean) as PerFundScenario[];

  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <colgroup>
          {MANUAL_COL_WIDTHS.map((w, i) => (
            <col key={i} style={{ width: w }} />
          ))}
        </colgroup>
        <thead>
          <tr>
            <th>Fund</th>
            <th style={{ textAlign: "left" }}>Method</th>
            <th>Current Value</th>
            <th>ST Gain/Loss</th>
            <th>LT Gain/Loss</th>
            <th>Sell ($)</th>
            <th>≈ Shares</th>
          </tr>
        </thead>
        {sortedFunds.map((fund) => {
          const isExpanded = expanded[fund.ticker];
          const staticLots = LOTS_BY_TICKER[fund.ticker] ?? [];
          const rawAmount = amounts[fund.ticker] ?? "";
          const numAmount = parseFloat(rawAmount.replace(/,/g, "")) || 0;
          const nav = navs[fund.ticker] ?? NAVS[fund.ticker] ?? 1;
          const approxShares = numAmount > 0 ? (numAmount / nav).toFixed(3) : "—";
          const showGl = fund.sell_amount > 0;

          return (
            <tbody key={fund.ticker}>
              <tr>
                <td>
                  <div className={styles.fundCell}>
                    <span className={styles.fundTicker}>{fund.ticker}</span>
                    <span className={styles.fundName}>{fund.name}</span>
                    {staticLots.length > 0 && (
                      <button
                        className={styles.expandBtn}
                        onClick={() => toggleExpand(fund.ticker)}
                        aria-expanded={isExpanded}
                      >
                        <span className={`${styles.expandIcon}${isExpanded ? ` ${styles.expandIconOpen}` : ""}`}>▼</span>
                        {isExpanded ? "Hide lots" : "Show lots"}
                      </button>
                    )}
                  </div>
                </td>
                <td style={{ textAlign: "left" }}>
                  <span className={styles.methodBadge}>
                    {fund.ticker === "VBTLX" ? "FIFO" : "MinTax"}
                  </span>
                </td>
                <td>{fmtMoney(CURRENT_VALUES[fund.ticker] ?? 0)}</td>
                <td className={showGl ? glClass(fund.st_gain_loss) : styles.zero}>
                  {showGl ? fmtGL(fund.st_gain_loss) : "—"}
                </td>
                <td className={showGl ? glClass(fund.lt_gain_loss) : styles.zero}>
                  {showGl ? fmtGL(fund.lt_gain_loss) : "—"}
                </td>
                <td>
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
                </td>
                <td>
                  <span className={styles.sharesApprox}>{approxShares}</span>
                </td>
              </tr>
              {isExpanded && staticLots.length > 0 && (
                <LotExpansion
                  ticker={fund.ticker}
                  colCount={7}
                  soldLots={fund.lots ?? []}
                  hasSells={fund.sell_amount > 0}
                />
              )}
            </tbody>
          );
        })}
      </table>
    </div>
  );
}
