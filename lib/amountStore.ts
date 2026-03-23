/**
 * Session-scoped amount persistence.
 * Amounts entered once are never lost during navigation — only cleared after
 * an order is executed (Confirmation page mount).
 */

const AUTO_KEY = "vs_auto_amount";
const FUND_KEY = "vs_fund_amounts";

function isClient(): boolean {
  return typeof window !== "undefined";
}

/** Save the auto-mode withdrawal amount (e.g. "10000") */
export function saveAutoAmount(amount: string): void {
  if (!isClient()) return;
  sessionStorage.setItem(AUTO_KEY, amount);
}

/** Load the auto-mode withdrawal amount, or "" if not set */
export function loadAutoAmount(): string {
  if (!isClient()) return "";
  return sessionStorage.getItem(AUTO_KEY) ?? "";
}

/** Save per-fund amounts for manual mode */
export function saveFundAmounts(amounts: Record<string, string>): void {
  if (!isClient()) return;
  sessionStorage.setItem(FUND_KEY, JSON.stringify(amounts));
}

/** Load per-fund amounts, or {} if not set */
export function loadFundAmounts(): Record<string, string> {
  if (!isClient()) return {};
  try {
    const raw = sessionStorage.getItem(FUND_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/** Clear all stored amounts — call only after order execution */
export function clearAmounts(): void {
  if (!isClient()) return;
  sessionStorage.removeItem(AUTO_KEY);
  sessionStorage.removeItem(FUND_KEY);
}
