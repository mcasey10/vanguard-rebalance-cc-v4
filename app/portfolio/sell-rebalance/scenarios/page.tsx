"use client";

import { useEffect, useState, useRef, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import GlobalNav from "@/components/GlobalNav";
import HeroBanner from "@/components/HeroBanner";
import SectionNav from "@/components/SectionNav";
import ScenarioColumn from "@/components/ScenarioColumn";
import styles from "./page.module.css";
import type { ScenarioData, ScenarioTaxImpact } from "@/lib/types";

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

// Canonical recommendation amounts
const REC_AMOUNTS: Record<string, string> = {
  VTSAX: "6000",
  VBTLX: "4000",
  VFIAX: "0",
  VIGAX: "0",
  VXUS: "0",
};

function makeEmptyAmounts() {
  return Object.fromEntries(TICKERS.map((t) => [t, ""])) as Record<string, string>;
}

async function callScenario(rawAmounts: Record<string, string>): Promise<ScenarioTaxImpact | null> {
  const fund_amounts: Record<string, number> = {};
  let hasAny = false;
  for (const t of TICKERS) {
    const v = parseFloat(rawAmounts[t]?.replace(/,/g, "") ?? "0") || 0;
    fund_amounts[t] = v;
    if (v > 0) hasAny = true;
  }
  if (!hasAny) return null;

  try {
    const res = await fetch(`${API_URL}/scenario`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ account_id: "brokerage-001", fund_amounts }),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

function ScenariosContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const source = searchParams.get("source");
  const isManualSource = source === "manual";

  // Build initial raw amounts from URL params
  const initRawAmounts = (): Record<string, string> => {
    const amounts: Record<string, string> = {};
    let hasManual = false;
    for (const t of TICKERS) {
      const v = searchParams.get(t);
      if (v) { amounts[t] = v; hasManual = true; }
      else amounts[t] = "";
    }
    if (!hasManual) {
      for (const t of TICKERS) amounts[t] = REC_AMOUNTS[t] ?? "";
    }
    return amounts;
  };

  const initScenarioA = (): ScenarioData => {
    const rawAmts = initRawAmounts();
    const numAmounts: Record<string, number> = {};
    for (const t of TICKERS) numAmounts[t] = parseFloat(rawAmts[t] ?? "0") || 0;
    return {
      id: "a",
      name: "Scenario A",
      amounts: numAmounts,
      result: null,
      source: isManualSource ? "manual" : "recommendation",
    };
  };

  const [scenarios, setScenarios] = useState<ScenarioData[]>([initScenarioA()]);
  const [rawAmounts, setRawAmounts] = useState<Record<string, Record<string, string>>>({
    a: initRawAmounts(),
  });
  const debounceRefs = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const fetchScenario = useCallback(async (id: string, amts: Record<string, string>) => {
    const result = await callScenario(amts);
    setScenarios((prev) => prev.map((s) => s.id === id ? { ...s, result, amounts: Object.fromEntries(TICKERS.map((t) => [t, parseFloat(amts[t] ?? "0") || 0])) as Record<string, number> } : s));
  }, []);

  // Initial fetch for scenario A
  useEffect(() => {
    const amts = rawAmounts["a"];
    fetchScenario("a", amts);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAmountChange = (id: string, ticker: string, value: string) => {
    const cleaned = value.replace(/[^0-9.,]/g, "");
    setRawAmounts((prev) => ({
      ...prev,
      [id]: { ...prev[id], [ticker]: cleaned },
    }));

    if (debounceRefs.current[id]) clearTimeout(debounceRefs.current[id]);
    debounceRefs.current[id] = setTimeout(() => {
      const newAmts = { ...(rawAmounts[id] ?? {}), [ticker]: cleaned };
      fetchScenario(id, newAmts);
    }, 400);
  };

  const handleNameChange = (id: string, name: string) => {
    setScenarios((prev) => prev.map((s) => s.id === id ? { ...s, name } : s));
  };

  const addScenario = () => {
    if (scenarios.length >= 3) return;
    const id = String.fromCharCode(97 + scenarios.length); // a, b, c
    const newAmts = makeEmptyAmounts();
    setScenarios((prev) => [
      ...prev,
      {
        id,
        name: `Scenario ${id.toUpperCase()}`,
        amounts: {},
        result: null,
        source: "manual",
      },
    ]);
    setRawAmounts((prev) => ({ ...prev, [id]: newAmts }));
  };

  const deleteScenario = (id: string) => {
    if (scenarios.length <= 1) return; // cannot delete last scenario
    setScenarios((prev) => {
      const filtered = prev.filter((s) => s.id !== id);
      // Re-assign IDs: a, b, c
      return filtered.map((s, idx) => ({ ...s, id: String.fromCharCode(97 + idx) }));
    });
    setRawAmounts((prev) => {
      const filtered = Object.entries(prev)
        .filter(([k]) => k !== id)
        .map(([, v]) => v);
      const newAmounts: Record<string, Record<string, string>> = {};
      filtered.forEach((v, idx) => {
        newAmounts[String.fromCharCode(97 + idx)] = v;
      });
      return newAmounts;
    });
  };

  const resetToRec = (id: string) => {
    const amts = { ...REC_AMOUNTS };
    setRawAmounts((prev) => ({ ...prev, [id]: amts }));
    fetchScenario(id, amts);
  };

  const executeScenario = (id: string) => {
    const amts = rawAmounts[id] ?? {};
    const params = new URLSearchParams();
    params.set("source", "manual");
    let total = 0;
    for (const t of TICKERS) {
      const v = parseFloat(amts[t]?.replace(/,/g, "") ?? "0") || 0;
      if (v > 0) { params.set(t, String(v)); total += v; }
    }
    params.set("amount", String(total));
    router.push(`/portfolio/sell-rebalance/confirmation?${params.toString()}`);
  };

  return (
    <div className={styles.pageWrapper}>
      <GlobalNav />
      <HeroBanner
        title="Sell &amp; Rebalance — Scenarios"
        subtitle="Compare up to 3 scenarios side by side"
        breadcrumbs={[
          { label: "My accounts", href: "/portfolio/balances" },
          { label: "Sell &amp; Rebalance", href: "/portfolio/sell-rebalance" },
          { label: "Scenarios" },
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
              className={`${styles.modeTab}${tab.href === "/portfolio/sell-rebalance/scenarios" ? ` ${styles.modeTabActive}` : ""}`}
            >
              {tab.label}
            </Link>
          ))}
        </div>
      </div>

      <main className={styles.main}>
        <div className={styles.mainInner}>
          <div className={styles.scenariosGrid}>
            {scenarios.map((scenario, idx) => {
              const label = `Scenario ${String.fromCharCode(65 + idx)}`;
              const isFirst = idx === 0;
              const helperText = isManualSource
                ? "Based on your manual entries"
                : "Pre-filled from Recommendation";
              const showReset = isFirst && !isManualSource;

              return (
                <ScenarioColumn
                  key={scenario.id}
                  scenario={scenario}
                  label={label}
                  helperText={helperText}
                  showResetLink={showReset}
                  onNameChange={(name) => handleNameChange(scenario.id, name)}
                  onAmountChange={(ticker, value) => handleAmountChange(scenario.id, ticker, value)}
                  onReset={() => resetToRec(scenario.id)}
                  onDelete={() => deleteScenario(scenario.id)}
                  rawAmounts={rawAmounts[scenario.id] ?? makeEmptyAmounts()}
                  navs={NAVS}
                />
              );
            })}

            {/* Add Scenario column */}
            {scenarios.length < 3 && (
              <div className={styles.addScenarioCol}>
                <button className={styles.addScenarioBtn} onClick={addScenario}>
                  <span className={styles.addScenarioPlus}>+</span>
                  Add Scenario
                </button>
              </div>
            )}
          </div>

        </div>
      </main>

      {/* Sticky footer — no "Back to Auto Mode" link */}
      <div className={styles.stickyFooter}>
        <div className={styles.stickyFooterInner}>
          {scenarios.map((scenario, idx) => {
            const label = `Execute Scenario ${String.fromCharCode(65 + idx)}`;
            return (
              <button
                key={scenario.id}
                className={styles.btnExecute}
                onClick={() => executeScenario(scenario.id)}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function ScenariosPage() {
  return (
    <Suspense>
      <ScenariosContent />
    </Suspense>
  );
}
