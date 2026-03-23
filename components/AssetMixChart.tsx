import styles from "./AssetMixChart.module.css";
import type { PortfolioDrift } from "@/lib/types";

interface AssetMixChartProps {
  drifts: PortfolioDrift[];
}

const ASSET_CLASS_LABELS: Record<string, string> = {
  us_equity: "US Equity",
  us_bond: "US Bond",
  intl_equity: "Intl. Equity",
};

export default function AssetMixChart({ drifts }: AssetMixChartProps) {
  return (
    <div className={styles.container}>
      <div className={styles.header}>Asset Mix Impact</div>

      <div className={styles.chartArea}>
        {drifts.map((drift) => (
          <div key={drift.asset_class} className={styles.barRow}>
            <div className={styles.barLabel}>{ASSET_CLASS_LABELS[drift.asset_class] ?? drift.asset_class}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {/* Before bar */}
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 40, fontSize: 11, color: "var(--text-muted)", textAlign: "right" }}>Before</div>
                <div style={{ flex: 1 }} className={styles.barTrack}>
                  <div
                    className={`${styles.barFill} ${styles.barFillBefore}`}
                    style={{ width: `${drift.before_pct}%` }}
                  >
                    <span className={styles.barPct}>{drift.before_pct.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
              {/* After bar */}
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 40, fontSize: 11, color: "var(--text-muted)", textAlign: "right" }}>After</div>
                <div style={{ flex: 1 }} className={styles.barTrack}>
                  <div
                    className={`${styles.barFill} ${styles.barFillAfter}`}
                    style={{ width: `${drift.after_pct}%` }}
                  >
                    <span className={styles.barPct}>{drift.after_pct.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.legend}>
        <div className={styles.legendItem}>
          <div className={styles.legendDot} style={{ background: "#1255CC" }} />
          Before
        </div>
        <div className={styles.legendItem}>
          <div className={styles.legendDot} style={{ background: "#040505" }} />
          After
        </div>
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>Asset Class</th>
            <th>Before</th>
            <th>After</th>
            <th>Target</th>
            <th>Diff</th>
          </tr>
        </thead>
        <tbody>
          {drifts.map((drift) => (
            <tr key={drift.asset_class}>
              <td>{ASSET_CLASS_LABELS[drift.asset_class] ?? drift.asset_class}</td>
              <td>{drift.before_pct.toFixed(1)}%</td>
              <td>{drift.after_pct.toFixed(1)}%</td>
              <td>{drift.target_pct.toFixed(1)}%</td>
              <td className={drift.diff_pct > 0 ? styles.diffPositive : drift.diff_pct < 0 ? styles.diffNegative : ""}>
                {drift.diff_pct > 0 ? "+" : ""}{drift.diff_pct.toFixed(1)}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
