import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import DataSourceStatus from "./DataSourceStatus";
import Nav from "./Nav";
import ThemeSwitcher from "./ThemeSwitcher";
import { useAppStore } from "../../lib/store/useAppStore";

const { usePathname } = vi.hoisted(() => ({ usePathname: vi.fn() }));

vi.mock("next/navigation", () => ({
  usePathname,
}));

describe("shared layout", () => {
  beforeEach(() => {
    usePathname.mockReturnValue("/");
    useAppStore.setState({ theme: "dark", watchlistIds: [], portfolio: [] });
  });

  afterEach(cleanup);

  it("marks only the exact dashboard route active", () => {
    usePathname.mockReturnValue("/coin/bitcoin");
    render(<Nav />);

    expect(screen.getByRole("link", { name: "Dashboard" })).not.toHaveAttribute("aria-current");
    expect(screen.getByRole("link", { name: "Markets" })).not.toHaveAttribute("aria-current");
  });

  it("marks nested routes active without matching similar prefixes", () => {
    usePathname.mockReturnValue("/market/bitcoin");
    const { rerender } = render(<Nav />);
    expect(screen.getByRole("link", { name: "Markets" })).toHaveAttribute("aria-current", "page");

    usePathname.mockReturnValue("/marketplace");
    rerender(<Nav />);
    expect(screen.getByRole("link", { name: "Markets" })).not.toHaveAttribute("aria-current");
  });

  it("toggles the persisted theme through the shared store", () => {
    render(<ThemeSwitcher />);
    const button = screen.getByRole("button", { name: "Switch to light theme" });

    fireEvent.click(button);

    expect(useAppStore.getState().theme).toBe("light");
    expect(screen.getByRole("button", { name: "Switch to dark theme" })).toBeInTheDocument();
  });

  it("renders a truthful and accessible data source status", () => {
    render(<DataSourceStatus status="unavailable" />);

    expect(screen.getByText("API unavailable")).toHaveAttribute("aria-label", "Data source status: API unavailable");
  });
});