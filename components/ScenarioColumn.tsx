"use client";

import { useState, useRef } from "react";
import styles from "./ScenarioColumn.module.css";
import type { ScenarioData } from "@/lib/types";

interface ScenarioColumnProps {
  scenario: ScenarioData;
  label: string;
  helperText?: string;
  showResetLink?: boolean;
  onNameChange: (name: string) => void;
  onAmountChange: (ticker: string, value: string) => void;
  onReset?: () => void;
  onDelete: () => void;
  rawAmounts: Record<string, string>;
  navs: Record<string, number>;
}

const TICKERS = ["VTSAX", "VFIAX", "VBTLX", "VIGAX", "VXUS"];
const FUND_NAMES: Record<string, string> = {
  VTSAX: "Total Stock Market",
  VBTLX: "Total Bond Market",
  VFIAX: "500 Index Fund",
  VIGAX: "Growth Index Fund",
  VXUS: "Total Intl Stock",
};

// Vanguard Asset Mix display — maps API asset classes to display categories
// Stocks = us_equity, Bonds = us_bond, Short term reserves = cash_other + intl_equity
const AM_COLORS = {
  stocks: "#00857D",
  bonds: "#C8960C",
  short_term: "#555555",
} as const;

function fmtMoney(n: number) {
  if (n === 0) return "$0.00";
  const abs = Math.abs(n);
  return (n < 0 ? "-$" : "$") + abs.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtGL(n: number) {
  const abs = Math.abs(n);
  return (n < 0 ? "-$" : "+$") + abs.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function GLInfoIcon() {
  const [show, setShow] = useState(false);
  return (
    <span
      className={styles.infoIconWrap}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      <span className={styles.infoIcon}>ⓘ</span>
      {show && (
        <span className={styles.infoTooltip}>
          Estimated gain or loss based on the selected tax lots for each fund.
          Long-term gains taxed at 0%, 15%, or 20% depending on income bracket.
        </span>
      )}
    </span>
  );
}

function KebabMenu({ onDelete }: { onDelete: () => void }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  return (
    <div className={styles.kebabWrap} ref={menuRef}>
      <button
        className={styles.kebabBtn}
        onClick={() => setOpen((v) => !v)}
        aria-label="Scenario options"
        title="Scenario options"
      >
        ⋮
      </button>
      {open && (
        <div className={styles.kebabMenu} onMouseLeave={() => setOpen(false)}>
          <button className={styles.kebabItem} onClick={() => setOpen(false)}>Rename</button>
          <button className={styles.kebabItem} onClick={() => setOpen(false)}>Duplicate</button>
          <button
            className={`${styles.kebabItem} ${styles.kebabItemDelete}`}
            onClick={() => { setOpen(false); onDelete(); }}
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

export default function ScenarioColumn({
  scenario,
  label,
  helperText,
  showResetLink,
  onNameChange,
  onAmountChange,
  onReset,
  onDelete,
  rawAmounts,
  navs,
}: ScenarioColumnProps) {
  const nameRef = useRef<HTMLInputElement>(null);

  const result = scenario.result;

  const perFund = result
    ? Object.fromEntries(result.per_fund_breakdown.map((f) => [f.ticker, f]))
    : {};

  return (
    <div className={styles.column}>
      <div className={styles.columnHeader}>
        <div style={{ flex: 1 }}>
          <div className={styles.scenarioLabel}>{label}</div>
          <input
            ref={nameRef}
            className={styles.scenarioNameInput}
            value={scenario.name}
            onChange={(e) => onNameChange(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") nameRef.current?.blur(); }}
            title="Click to rename scenario"
          />
          {helperText && <div className={styles.helperText}>{helperText}</div>}
          {showResetLink && onReset && (
            <button
              onClick={onReset}
              style={{
                background: "none",
                border: "none",
                color: "var(--interactive)",
                fontSize: 11,
                cursor: "pointer",
                textDecoration: "underline",
                padding: 0,
                marginTop: 2,
              }}
            >
              Reset to Recommendation
            </button>
          )}
        </div>
        <KebabMenu onDelete={onDelete} />
      </div>

      {/* Horizontal fund table header */}
      <div className={styles.fundTableHeader}>
        <div className={styles.fundColFund}>Fund</div>
        <div className={styles.fundColAmount}>Sell Amount</div>
        <div className={styles.fundColGL}>ST G/L</div>
        <div className={styles.fundColGL}>LT G/L <GLInfoIcon /></div>
        <div className={styles.fundColTax}>Est. Tax</div>
      </div>

      <div className={styles.fundRows}>
        {TICKERS.map((ticker) => {
          const rawAmount = rawAmounts[ticker] ?? "";
          const numAmount = parseFloat(rawAmount.replace(/,/g, "")) || 0;
          const pf = perFund[ticker];
          const showGl = numAmount > 0 && pf;

          return (
            <div key={ticker} className={styles.fundRow}>
              <div className={styles.fundColFund}>
                <div className={styles.fundTicker}>{ticker}</div>
                <div className={styles.fundName}>{FUND_NAMES[ticker]}</div>
              </div>

              <div className={styles.fundColAmount}>
                <div className={styles.inputWrap}>
                  <span className={styles.inputPrefix}>$</span>
                  <input
                    type="text"
                    className={styles.inputField}
                    value={rawAmount}
                    onChange={(e) => onAmountChange(ticker, e.target.value)}
                    placeholder="0"
                    aria-label={`${ticker} sell amount`}
                  />
                </div>
              </div>

              <div className={styles.fundColGL}>
                {showGl ? (
                  <span style={{ color: pf.st_gain_loss >= 0 ? "var(--positive)" : "var(--negative)" }}>
                    {fmtGL(pf.st_gain_loss)}
                  </span>
                ) : (
                  <span className={styles.zero}>—</span>
                )}
              </div>

              <div className={styles.fundColGL}>
                {showGl ? (
                  <span style={{ color: pf.lt_gain_loss >= 0 ? "var(--positive)" : "var(--negative)" }}>
                    {fmtGL(pf.lt_gain_loss)}
                  </span>
                ) : (
                  <span className={styles.zero}>—</span>
                )}
              </div>

              <div className={styles.fundColTax}>
                {showGl ? (
                  <span style={{ color: pf.est_tax < 0 ? "var(--positive)" : pf.est_tax > 0 ? "var(--negative)" : "inherit" }}>
                    {fmtMoney(pf.est_tax)}
                  </span>
                ) : (
                  <span className={styles.zero}>—</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Tax Summary — always fully visible, never collapsed */}
      {result && (
        <div className={styles.taxSummary}>
          <div className={styles.taxSummaryTitle}>Tax Summary</div>
          <div className={styles.taxRow}>
            <span className={styles.taxLabel}>ST Capital Gains</span>
            <span className={`${styles.taxValue}`} style={{ color: result.st_gains >= 0 ? "var(--positive)" : "var(--negative)" }}>
              {fmtGL(result.st_gains)}
            </span>
          </div>
          <div className={styles.taxRow}>
            <span className={styles.taxLabel}>LT Capital Gains</span>
            <span className={`${styles.taxValue}`} style={{ color: result.lt_gains >= 0 ? "var(--positive)" : "var(--negative)" }}>
              {fmtGL(result.lt_gains)}
            </span>
          </div>
          <div className={styles.taxRow}>
            <span className={styles.taxLabel}>Losses Harvested</span>
            <span className={`${styles.taxValue}`} style={{ color: "var(--positive)" }}>
              {result.losses_harvested > 0 ? `-$${result.losses_harvested.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "$0.00"}
            </span>
          </div>
          <div className={styles.taxRow}>
            <span className={styles.taxLabel}>Net Taxable Gain</span>
            <span className={styles.taxValue}>{fmtMoney(result.net_taxable_gain)}</span>
          </div>
          <div className={styles.taxRow}>
            <span className={styles.taxLabel}>Federal Tax</span>
            <span className={styles.taxValue}>{fmtMoney(result.federal_tax)}</span>
          </div>
          <div className={styles.taxRow}>
            <span className={styles.taxLabel}>State Tax</span>
            <span className={styles.taxValue}>{fmtMoney(result.state_tax)}</span>
          </div>
          <div className={`${styles.taxRow} ${styles.taxRowTotal}`}>
            <span className={styles.taxLabel}>Est. Total Tax</span>
            <span className={styles.taxValue}><strong>{fmtMoney(result.total_tax)}</strong></span>
          </div>
          <div className={styles.taxRow}>
            <span className={styles.taxLabel}>Effective Rate</span>
            <span className={styles.taxValue}>{result.effective_rate.toFixed(2)}%</span>
          </div>
        </div>
      )}

      {/* Asset Mix Impact — stacked bars + pivoted table */}
      {result && result.portfolio_drift_after && result.portfolio_drift_after.length > 0 && (() => {
        const dm = Object.fromEntries(result.portfolio_drift_after.map((d) => [d.asset_class, d]));
        const cats = {
          stocks: {
            label: "Stocks",
            color: AM_COLORS.stocks,
            before: dm.us_equity?.before_pct ?? 0,
            target: dm.us_equity?.target_pct ?? 0,
            after: dm.us_equity?.after_pct ?? 0,
          },
          bonds: {
            label: "Bonds",
            color: AM_COLORS.bonds,
            before: dm.us_bond?.before_pct ?? 0,
            target: dm.us_bond?.target_pct ?? 0,
            after: dm.us_bond?.after_pct ?? 0,
          },
          short_term: {
            label: "Short term reserves",
            color: AM_COLORS.short_term,
            before: (dm.cash_other?.before_pct ?? 0) + (dm.intl_equity?.before_pct ?? 0),
            target: (dm.cash_other?.target_pct ?? 0) + (dm.intl_equity?.target_pct ?? 0),
            after: (dm.cash_other?.after_pct ?? 0) + (dm.intl_equity?.after_pct ?? 0),
          },
        } as const;

        const catKeys = ["stocks", "bonds", "short_term"] as const;
        const stripeStyle = {
          backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(255,255,255,0.5) 4px, rgba(255,255,255,0.5) 6px)",
        };

        const rows = [
          { key: "current", label: "Current", field: "before" as const, striped: false },
          { key: "target", label: "Target", field: "target" as const, striped: true },
          { key: "after", label: "After Sale", field: "after" as const, striped: false },
        ];

        return (
          <div className={styles.assetMixSection}>
            <div className={styles.assetMixTitle}>Asset Mix Impact</div>

            {/* Legend */}
            <div className={styles.amLegend}>
              {catKeys.map((k) => (
                <span key={k} className={styles.amLegendItem}>
                  <span className={styles.amLegendDot} style={{ background: cats[k].color }} />
                  {cats[k].label}
                </span>
              ))}
            </div>

            {/* Three stacked bars */}
            <div className={styles.amBarsWrap}>
              {rows.map(({ key, label, field, striped }) => (
                <div key={key} className={styles.amBarRow}>
                  <span className={styles.amBarLabel}>{label}</span>
                  <div className={styles.amBarOuter}>
                    {catKeys.map((k) => (
                      <div
                        key={k}
                        className={styles.amBarSegment}
                        style={{
                          width: `${cats[k][field]}%`,
                          backgroundColor: cats[k].color,
                          ...(striped ? stripeStyle : {}),
                        }}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Pivoted table */}
            <table className={styles.amPivotTable}>
              <thead>
                <tr>
                  <th className={styles.amPivotRowLabel} />
                  {catKeys.map((k) => (
                    <th key={k} className={styles.amPivotColHeader} style={{ color: cats[k].color }}>
                      {cats[k].label.toUpperCase()}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map(({ key, label, field }) => (
                  <tr key={key}>
                    <td className={styles.amPivotRowLabel}>{label}</td>
                    {catKeys.map((k) => (
                      <td key={k} className={styles.amPivotCell}>
                        {cats[k][field].toFixed(1)}%
                      </td>
                    ))}
                  </tr>
                ))}
                <tr className={styles.amPivotDiffRow}>
                  <td className={styles.amPivotRowLabel}>Diff (After vs Target)</td>
                  {catKeys.map((k) => {
                    const diff = cats[k].after - cats[k].target;
                    const color = diff > 0 ? "var(--negative)" : diff < 0 ? "var(--positive)" : "inherit";
                    return (
                      <td key={k} className={styles.amPivotCell} style={{ color, fontWeight: 600 }}>
                        {diff > 0 ? "+" : ""}{diff.toFixed(1)}%
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        );
      })()}
    </div>
  );
}
