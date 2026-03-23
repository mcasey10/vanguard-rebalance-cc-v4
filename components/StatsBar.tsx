import styles from "./StatsBar.module.css";

interface StatItem {
  label: string;
  value: string;
  type?: "default" | "positive" | "negative" | "warning";
}

interface StatsBarProps {
  stats: StatItem[];
}

function fmt(value: string, type?: string) {
  switch (type) {
    case "positive": return styles.statValuePositive;
    case "negative": return styles.statValueNegative;
    case "warning": return styles.statValueWarning;
    default: return "";
  }
}

export default function StatsBar({ stats }: StatsBarProps) {
  return (
    <div className={styles.statsBar}>
      <div className={styles.inner}>
        {stats.map((stat, i) => (
          <div key={i} className={styles.statItem}>
            <span className={styles.statLabel}>{stat.label}</span>
            <span className={`${styles.statValue} ${fmt(stat.value, stat.type)}`}>
              {stat.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
