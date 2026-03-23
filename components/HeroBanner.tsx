import styles from "./HeroBanner.module.css";

// Static hero banner — identical on every screen per CLAUDE.md v5.
// Props are accepted but ignored; content never changes based on route.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function HeroBanner(_props: any) {
  return (
    <div className={styles.heroBanner}>
      <div className={styles.inner}>
        <div className={styles.innerRow}>
          <div className={styles.leftCol}>
            <div className={styles.welcomeText}>Welcome back, Michael</div>
            <div className={styles.portfolioValue}>$580,745.29</div>
          </div>
          <div className={styles.rightCol}>
            <div className={styles.rightTopLink}>
              Value as of: March 13, 2026, 4:15 p.m. ET
            </div>
            <div className={styles.rightSubLine}>
              Last login: March 13, 2026, 4:38 p.m. ET
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
