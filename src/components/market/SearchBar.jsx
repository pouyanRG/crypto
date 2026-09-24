"use client";

import Input from "../ui/Input";

export default function SearchBar({ value, onChange, placeholder = "Search coins..." }) {
  return <div className="w-full max-w-sm"><Input id="market-search" type="search" aria-label="Search coins" value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} /></div>;
}