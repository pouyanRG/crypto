import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import DataSourceStatus from "./DataSourceStatus";
import Nav from "./Nav";
import MobileTabBar from "./MobileTabBar";
import ThemeSwitcher from "./ThemeSwitcher";
import { useAppStore } from "../../lib/store/useAppStore";

const { usePathname } = vi.hoisted(() => ({ usePathname: vi.fn() }));

vi.mock("next/navigation", () => ({
  usePathname,
}));

describe("shared layout", () => {
  beforeEach(() => {
    usePathname.mockReturnValue("/");
    useAppStore.setState({ theme: "dark", watchlistIds: [] });
  });

  afterEach(cleanup);

  it("marks only the exact dashboard route active", () => {
    usePathname.mockReturnValue("/coin/bitcoin");
    render(<Nav />);

    expect(screen.getByRole("link", { name: "Dashboard" })).not.toHaveAttribute("aria-current");
    expect(screen.getByRole("link", { name: "Markets" })).not.toHaveAttribute("aria-current");
    expect(screen.getByRole("link", { name: "Discover" })).not.toHaveAttribute("aria-current");
  });

  it("marks nested routes active without matching similar prefixes", () => {
    usePathname.mockReturnValue("/market/bitcoin");
    const { rerender } = render(<Nav />);
    expect(screen.getByRole("link", { name: "Markets" })).toHaveAttribute("aria-current", "page");

    usePathname.mockReturnValue("/marketplace");
    rerender(<Nav />);
    expect(screen.getByRole("link", { name: "Markets" })).not.toHaveAttribute("aria-current");
  });

  it("marks the discovery route active", () => {
    usePathname.mockReturnValue("/discover");
    render(<Nav />);

    expect(screen.getByRole("link", { name: "Discover" })).toHaveAttribute("aria-current", "page");
  });

  it("keeps desktop and mobile navigation targets comfortably sized", () => {
    render(<><Nav /><MobileTabBar /></>);

    const desktopNav = screen.getByRole("navigation", { name: "Primary navigation" });
    expect(within(desktopNav).getByRole("link", { name: "Markets" })).toHaveClass("min-h-11");
    const mobileLinks = screen.getAllByRole("link").filter((link) => link.closest('[aria-label="Mobile navigation"]'));
    expect(mobileLinks).toHaveLength(5);
    expect(mobileLinks.every((link) => link.className.includes("h-14"))).toBe(true);
  });

  it("toggles the persisted theme through the shared store", () => {
    render(<ThemeSwitcher />);
    const button = screen.getByRole("button", { name: "Switch to light theme" });

    fireEvent.click(button);

    expect(useAppStore.getState().theme).toBe("light");
    expect(screen.getByRole("button", { name: "Switch to dark theme" })).toBeInTheDocument();
  });

  it("renders a truthful and accessible market data status", () => {
    render(<DataSourceStatus status="unavailable" />);

    expect(screen.getByText("Market data unavailable")).toHaveAttribute(
      "aria-label",
      "Market data status: Market data unavailable",
    );
  });

  it("shows how recently market data was updated", async () => {
    const updatedAt = Date.now() - 6 * 60 * 1000;
    render(<DataSourceStatus status="live" lastUpdatedAt={updatedAt} />);

    await waitFor(() => {
      expect(screen.getByText("Data delayed")).toBeInTheDocument();
      expect(screen.getByText("Response received 6 min ago")).toBeInTheDocument();
    });
  });

  it("keeps a delayed status visible in compact layouts", () => {
    render(<DataSourceStatus status="stale" compact lastUpdatedAt={Date.now() - 6 * 60 * 1000} />);

    expect(screen.getByRole("status", { name: /Data delayed/ })).toHaveTextContent("Delayed");
  });
});