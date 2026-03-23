"use client";

import { useEffect } from "react";
import styles from "./WaitSaveModal.module.css";
import type { WaitAndSaveLot } from "@/lib/types";

interface WaitSaveModalProps {
  lots: WaitAndSaveLot[];
  onClose: () => void;
  onRemind: () => void;
  onAdjust: () => void;
  onProceed: () => void;
}

function fmtMoney(n: number) {
  const abs = Math.abs(n);
  const formatted = abs.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  return n < 0 ? `-$${formatted}` : `$${formatted}`;
}

export default function WaitSaveModal({ lots, onClose, onRemind, onAdjust, onProceed }: WaitSaveModalProps) {
  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const totalSavings = lots.reduce((sum, l) => sum + l.savings, 0);

  return (
    <div className={styles.backdrop} onClick={onClose} role="dialog" aria-modal aria-labelledby="wait-save-title">
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.headerText}>
            <h2 id="wait-save-title">Wait &amp; Save Opportunity</h2>
            <p>
              Some lots are about to convert to long-term status. Waiting to sell could significantly reduce your tax bill.
            </p>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Fund</th>
                <th>Lot Date</th>
                <th>Converts LT</th>
                <th>Days</th>
                <th>Tax Now</th>
                <th>Tax If Wait</th>
                <th>Savings</th>
              </tr>
            </thead>
            <tbody>
              {lots.map((lot, i) => (
                <tr key={i}>
                  <td>{lot.fund}</td>
                  <td>{lot.lot_date}</td>
                  <td>{lot.converts_lt}</td>
                  <td>{lot.days_until_lt}</td>
                  <td>{fmtMoney(lot.tax_now)}</td>
                  <td>{fmtMoney(lot.tax_if_wait)}</td>
                  <td className={styles.savingsCell}>{fmtMoney(lot.savings)}</td>
                </tr>
              ))}
              <tr className={styles.totalRow}>
                <td colSpan={6}><strong>Total Potential Savings</strong></td>
                <td className={styles.savingsCell}><strong>{fmtMoney(totalSavings)}</strong></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className={styles.actions}>
          <button className={styles.btnOutline} onClick={onRemind}>
            Remind me in 40 days
          </button>
          <button className={styles.btnFilled} onClick={onAdjust}>
            Adjust sale to avoid these lots
          </button>
          <button className={styles.btnLink} onClick={onProceed}>
            Proceed with today&apos;s recommendation
          </button>
        </div>
      </div>
    </div>
  );
}
