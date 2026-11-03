"use client";

import Tabs from "../ui/Tabs";

const DEFAULT_TABS = [
  { value: "all", label: "All", panelId: "market-results" },
  { value: "gainers", label: "Top Gainers", panelId: "market-results" },
  { value: "losers", label: "Top Losers", panelId: "market-results" },
];

export default function TabsBar({ active = "all", onChange, tabs = DEFAULT_TABS }) {
  return <Tabs
    id="market-tabs"
    ariaLabel="Market filters"
    tabs={tabs}
    active={active}
    onChange={onChange}
    activationMode="automatic"
    appearance="polished"
    className="w-full max-w-full sm:w-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
  />;
}