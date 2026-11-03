import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import Button from "./Button";
import Card from "./Card";
import EmptyState from "./EmptyState";
import ErrorState from "./ErrorState";
import Input from "./Input";
import Select from "./Select";
import { Table, TableCell, TableEmpty, TableError, TableHead, TableLoading, TableRow } from "./Table";
import Tabs, { TabPanel } from "./Tabs";
import Skeleton from "./Skeleton";

describe("shared UI primitives", () => {
  afterEach(cleanup);

  it("prevents interaction while Button is loading", () => {
    const onClick = vi.fn();
    render(<Button loading onClick={onClick}>Save</Button>);
    const button = screen.getByRole("button", { name: "Save" });
    expect(button).toBeDisabled();
    fireEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
    expect(button).toHaveAttribute("aria-busy", "true");
  });

  it("keeps Button's loading and disabled contract authoritative", () => {
    render(<Button loading disabled={false} type="submit">Save</Button>);
    const button = screen.getByRole("button", { name: "Save" });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("type", "submit");
  });

  it("makes an interactive Card keyboard-usable", () => {
    const onClick = vi.fn();
    render(<Card variant="interactive" onClick={onClick}>Details</Card>);
    const card = screen.getByRole("button", { name: "Details" });
    expect(card).toHaveAttribute("tabindex", "0");
    fireEvent.keyDown(card, { key: "Enter" });
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("moves focus between enabled tabs with arrow keys", () => {
    render(<Tabs id="market-tabs" active="all" onChange={vi.fn()} tabs={[{ value: "all", label: "All" }, { value: "gainers", label: "Gainers" }, { value: "losers", label: "Losers", disabled: true }]} />);
    const all = screen.getByRole("tab", { name: "All" });
    const gainers = screen.getByRole("tab", { name: "Gainers" });
    all.focus();
    fireEvent.keyDown(all, { key: "ArrowRight" });
    expect(gainers).toHaveFocus();
    expect(all).toHaveAttribute("aria-selected", "true");
  });

  it("falls back to the first enabled tab and supports automatic activation", () => {
    const onChange = vi.fn();
    render(<Tabs id="fallback-tabs" active="disabled" activationMode="automatic" onChange={onChange} tabs={[{ value: "disabled", label: "Disabled", disabled: true }, { value: "first", label: "First" }, { value: "second", label: "Second" }]} />);
    const first = screen.getByRole("tab", { name: "First" });
    const second = screen.getByRole("tab", { name: "Second" });
    expect(first).toHaveAttribute("aria-selected", "true");
    first.focus();
    fireEvent.keyDown(first, { key: "ArrowRight" });
    expect(second).toHaveFocus();
    expect(onChange).toHaveBeenCalledWith("second");
  });

  it("uses accessible touch-sized styling for polished tabs", () => {
    render(<Tabs id="range-tabs" appearance="polished" active="30" tabs={[{ value: "7", label: "7d" }, { value: "30", label: "30d" }]} />);
    const activeTab = screen.getByRole("tab", { name: "30d" });
    expect(activeTab).toHaveClass("min-h-11");
    expect(activeTab).toHaveClass("flex-1");
    expect(activeTab).toHaveClass("text-sm");
    expect(activeTab).toHaveClass("bg-[var(--color-accent)]");
    expect(activeTab).toHaveClass("text-white");
    expect(screen.getByRole("tab", { name: "7d" })).toHaveAttribute("aria-selected", "false");
  });

  it("connects a tab to its panel", () => {
    render(<><Tabs id="detail-tabs" panelId="detail-panel" active="summary" tabs={[{ value: "summary", label: "Summary" }]} /><TabPanel id="detail-panel-summary" tabId="detail-tabs-summary" tabValue="summary" active>Content</TabPanel></>);
    expect(screen.getByRole("tab")).toHaveAttribute("aria-controls", "detail-panel-summary");
    expect(screen.getByRole("tabpanel")).toHaveAttribute("aria-labelledby", "detail-tabs-summary");
  });

  it("keeps every tab connected when ranges share one dynamic panel", () => {
    render(
      <>
        <Tabs id="range-tabs" active="30" tabs={[{ value: "7", label: "7d", panelId: "chart-panel" }, { value: "30", label: "30d", panelId: "chart-panel" }]} />
        <div id="chart-panel" role="tabpanel" aria-labelledby="range-tabs-30">Chart</div>
      </>,
    );
    for (const tab of screen.getAllByRole("tab")) {
      expect(document.getElementById(tab.getAttribute("aria-controls") ?? "")).toBeInTheDocument();
    }
  });

  it("connects Input errors to the input with ARIA", () => {
    render(<Input id="coin-search" label="Search coins" error="Enter a coin name" />);
    const input = screen.getByRole("textbox", { name: "Search coins" });
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAttribute("aria-describedby", "coin-search-message");
    expect(screen.getByText("Enter a coin name")).toHaveAttribute("role", "alert");
  });

  it("supports a clear action and preserves caller described-by", () => {
    const onClear = vi.fn();
    render(<Input id="search" type="search" aria-describedby="external-help" value="btc" onChange={vi.fn()} onClear={onClear} appearance="polished" />);
    const input = screen.getByRole("searchbox");
    expect(input).toHaveAttribute("aria-describedby", "external-help");
    expect(input).toHaveClass("search-with-clear");
    const clearButton = screen.getByRole("button", { name: "Clear input" });
    expect(clearButton).toHaveClass("size-11");
    fireEvent.click(clearButton);
    expect(onClear).toHaveBeenCalledTimes(1);
  });

  it("shows the clear action only when the input has a value", () => {
    const { rerender } = render(<Input id="empty-search" value="" onChange={vi.fn()} onClear={vi.fn()} appearance="polished" />);
    expect(screen.queryByRole("button", { name: "Clear input" })).not.toBeInTheDocument();

    rerender(<Input id="empty-search" value="btc" onChange={vi.fn()} onClear={vi.fn()} appearance="polished" />);
    expect(screen.getByRole("button", { name: "Clear input" })).toBeInTheDocument();
  });

  it("supports selecting an option and disabled Select state", () => {
    render(<Select id="currency" label="Currency" value="usd" onChange={vi.fn()} disabled><option value="usd">USD</option></Select>);
    expect(screen.getByRole("combobox", { name: "Currency" })).toBeDisabled();
    expect(screen.getByRole("combobox", { name: "Currency" })).toHaveClass("min-h-11");
    expect(screen.getByRole("option", { name: "USD" })).toHaveProperty("selected", true);
  });

  it("makes clickable table rows keyboard accessible", () => {
    const onClick = vi.fn();
    render(<Table caption="Coins"><TableHead><TableCell header>Coin</TableCell></TableHead><tbody><TableRow onClick={onClick}><TableCell>Bitcoin</TableCell></TableRow></tbody></Table>);
    const row = screen.getByRole("row", { name: "Bitcoin" });
    expect(row).toHaveAttribute("tabindex", "0");
    fireEvent.keyDown(row, { key: "Enter" });
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("renders table empty and loading states as table rows", () => {
    render(<Table ariaLabel="Assets"><TableHead><TableCell header>Asset</TableCell></TableHead><tbody><TableEmpty colSpan={1} /><TableLoading colSpan={1} /><TableError colSpan={1}>Could not load assets</TableError></tbody></Table>);
    expect(screen.getByRole("cell", { name: "No data available" })).toBeInTheDocument();
    expect(screen.getByRole("row", { busy: true })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "Could not load assets" })).toBeInTheDocument();
  });

  it("keeps Skeleton out of the accessibility tree", () => {
    render(<Skeleton variant="row" />);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(document.querySelector('[aria-hidden="true"]')).toBeInTheDocument();
  });

  it("keeps empty and error messaging distinct", () => {
    render(<><EmptyState title="No coins" description="Add a coin to begin." /><ErrorState title="Market unavailable" /></>);
    expect(screen.getByRole("heading", { name: "No coins" })).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent("Market unavailable");
  });
});