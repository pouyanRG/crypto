"use client";

import Tabs from "../ui/Tabs";

const DEFAULT_TABS = [
  { value: "all", label: "All" },
  { value: "gainers", label: "Top Gainers" },
  { value: "losers", label: "Top Losers" },
];

export default function TabsBar({ active = "all", onChange, tabs = DEFAULT_TABS }) {
  return <Tabs
    id="market-tabs"
    ariaLabel="Market filters"
    tabs={tabs}
    active={active}
    onChange={onChange}
    activationMode="automatic"
    className="w-full justify-start border-x-0 border-t-0 border-b rounded-none bg-transparent p-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
  />;
}