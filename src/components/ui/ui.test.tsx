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

  it("connects a tab to its panel", () => {
    render(<><Tabs id="detail-tabs" panelId="detail-panel" active="summary" tabs={[{ value: "summary", label: "Summary" }]} /><TabPanel id="detail-panel-summary" tabId="detail-tabs-summary" tabValue="summary" active>Content</TabPanel></>);
    expect(screen.getByRole("tab")).toHaveAttribute("aria-controls", "detail-panel-summary");
    expect(screen.getByRole("tabpanel")).toHaveAttribute("aria-labelledby", "detail-tabs-summary");
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
    render(<Input id="search" aria-describedby="external-help" value="btc" onChange={vi.fn()} onClear={onClear} />);
    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("aria-describedby", "external-help");
    fireEvent.click(screen.getByRole("button", { name: "Clear input" }));
    expect(onClear).toHaveBeenCalledTimes(1);
  });

  it("supports selecting an option and disabled Select state", () => {
    render(<Select id="currency" label="Currency" value="usd" onChange={vi.fn()} disabled><option value="usd">USD</option></Select>);
    expect(screen.getByRole("combobox", { name: "Currency" })).toBeDisabled();
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