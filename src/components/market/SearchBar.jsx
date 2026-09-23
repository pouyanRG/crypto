"use client";

export default function SearchBar({ value, onChange, placeholder = "Search coins..." }) {
  return <label className="block w-full max-w-sm"><span className="sr-only">Search coins</span><input type="search" value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-accent)]" /></label>;
}