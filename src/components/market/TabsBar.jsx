"use client";

import Tabs from "../ui/Tabs";

const DEFAULT_TABS = [{ value: "all", label: "All" }, { value: "gainers", label: "Top Gainers" }, { value: "losers", label: "Top Losers" }, { value: "trending", label: "Trending" }];

export default function TabsBar({ active = "all", onChange, tabs = DEFAULT_TABS }) {
  return <Tabs id="market-tabs" ariaLabel="Market filters" tabs={tabs} active={active} onChange={onChange} activationMode="automatic" className="w-full justify-start rounded-none border-b border-[var(--color-border)] bg-transparent p-0" />;
}