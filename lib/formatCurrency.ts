/**
 * Shared currency formatting and G/L colour utilities.
 * Use these everywhere — never duplicate formatting logic in components.
 */

/** Format as $X,XXX.XX or -$X,XXX.XX (always 2 decimal places) */
export function fmtMoney(n: number): string {
  if (n === 0) return "$0.00";
  const abs = Math.abs(n);
  const s = abs.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return (n < 0 ? "-$" : "$") + s;
}

/** Format gain/loss with explicit sign: +$X,XXX.XX or -$X,XXX.XX */
export function fmtGL(n: number): string {
  const abs = Math.abs(n);
  const s = abs.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return (n < 0 ? "-$" : "+$") + s;
}

/**
 * Return the CSS colour for a gain/loss/tax value.
 * Positive → green (#007A00 = var(--positive))
 * Negative → red  (#C8102E = var(--negative))
 * Zero     → inherit (no colour)
 */
export function glColor(n: number): string {
  if (n > 0) return "#007A00";
  if (n < 0) return "#C8102E";
  return "inherit";
}

/** Inline style object — use directly on any JSX element */
export function glStyle(n: number): { color: string } {
  return { color: glColor(n) };
}
