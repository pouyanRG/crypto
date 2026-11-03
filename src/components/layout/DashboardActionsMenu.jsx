"use client";

import { useEffect, useRef, useState } from "react";
import NavIcon from "./NavIcon";
import ThemeSwitcher from "./ThemeSwitcher";

function downloadMarketCsv(coins) {
  const rows = [
    ["id", "name", "symbol", "current_price", "change_24h_percent", "market_cap", "total_volume"],
    ...coins.map((coin) => [
      coin.id,
      coin.name,
      coin.symbol,
      coin.current_price,
      coin.price_change_percentage_24h,
      coin.market_cap,
      coin.total_volume,
    ]),
  ];
  const csv = rows
    .map((row) => row.map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`).join(","))
    .join("\r\n");
  const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "crypto-market.csv";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

function ExportIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 15V3m0 0 4 4m-4-4-4 4M4 15v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4" />
    </svg>
  );
}

export default function DashboardActionsMenu({ coins = [], loading = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const triggerRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handlePointerDown = (event) => {
      if (!menuRef.current?.contains(event.target)) setIsOpen(false);
    };
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={menuRef} className="relative md:hidden">
      <button
        ref={triggerRef}
        type="button"
        aria-label={isOpen ? "Close dashboard options" : "Open dashboard options"}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls="dashboard-actions-menu"
        className="inline-flex size-11 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)] transition-[background-color,color,transform] duration-200 hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-primary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)] active:scale-[0.98]"
        onClick={() => setIsOpen((open) => !open)}
      >
        <NavIcon name="more" />
      </button>
      {isOpen && (
        <div
          id="dashboard-actions-menu"
          role="menu"
          aria-label="Dashboard options"
          className="absolute right-0 top-0 z-40 w-52 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-2 shadow-[var(--shadow-card)]"
        >
          <button
            type="button"
            role="menuitem"
            disabled={loading || coins.length === 0}
            className="inline-flex min-h-11 w-full items-center justify-start gap-3 rounded-[var(--radius-md)] px-3 text-sm font-medium text-[var(--color-text-secondary)] transition-[background-color,color,transform] duration-200 hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-primary)] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--color-accent)] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
            onClick={() => {
              downloadMarketCsv(coins);
              setIsOpen(false);
            }}
          >
            <ExportIcon />
            <span>Export</span>
          </button>
          <ThemeSwitcher compact onAction={() => setIsOpen(false)} />
        </div>
      )}
    </div>
  );
}
