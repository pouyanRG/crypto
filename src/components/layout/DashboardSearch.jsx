"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Input from "../ui/Input";

function SearchIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </svg>
  );
}

export default function DashboardSearch() {
  const router = useRouter();
  const [term, setTerm] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    const q = term.trim();
    router.push(q ? `/market?q=${encodeURIComponent(q)}` : "/market");
  };

  return (
    <form role="search" onSubmit={handleSubmit} className="w-full sm:max-w-sm">
      <Input
        id="dashboard-search"
        type="search"
        enterKeyHint="search"
        appearance="polished"
        aria-label="Search coins"
        placeholder="Search coins..."
        leadingIcon={<SearchIcon />}
        clearLabel="Clear search"
        className="dashboard-search-input"
        value={term}
        onChange={(event) => setTerm(event.target.value)}
        onClear={() => setTerm("")}
      />
    </form>
  );
}
