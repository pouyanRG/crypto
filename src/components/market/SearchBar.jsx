"use client";

import Input from "../ui/Input";

function SearchIcon() {
  return <svg viewBox="0 0 20 20" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true"><circle cx="8.75" cy="8.75" r="5.75" /><path d="m13 13 4 4" /></svg>;
}

export default function SearchBar({ value, onChange, placeholder = "Search coins..." }) {
  return (
    <div className="w-full sm:max-w-sm">
      <Input
        id="market-search"
        type="search"
        aria-label="Search coins"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onClear={() => onChange("")}
        leadingIcon={<SearchIcon />}
        appearance="polished"
        placeholder={placeholder}
        className="min-h-11 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-text-primary)] shadow-[inset_0_1px_0_rgba(255,255,255,0.02)] placeholder:text-[var(--color-text-secondary)] hover:border-[var(--color-text-muted)] active:border-[var(--color-accent)] focus-visible:border-[var(--color-accent)] focus-visible:ring-2 focus-visible:ring-[var(--color-accent-muted)]"
      />
    </div>
  );
}