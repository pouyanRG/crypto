"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Input from "../ui/Input";

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
        aria-label="Search coins"
        placeholder="Search coins..."
        value={term}
        onChange={(event) => setTerm(event.target.value)}
        onClear={() => setTerm("")}
      />
    </form>
  );
}
