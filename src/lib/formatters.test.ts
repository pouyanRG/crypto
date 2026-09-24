import { describe, expect, it } from "vitest";
import { formatCompact, formatPercent, formatPrice, formatUpdatedAt } from "./formatters";

describe("shared formatters", () => {
  it("preserves meaningful precision for small prices", () => {
    expect(formatPrice(0.00001234)).toContain("0.00001234");
    expect(formatPrice(null)).toBe("—");
  });

  it("formats compact values and signed percentages", () => {
    expect(formatCompact(1250000)).toBe("1.25M");
    expect(formatPercent(2.5)).toBe("+2.5%");
    expect(formatPercent(-1.25)).toBe("-1.25%");
    expect(formatPercent(0)).toBe("0%");
  });

  it("handles invalid update timestamps explicitly", () => {
    expect(formatUpdatedAt("not-a-date")).toBe("—");
    expect(formatUpdatedAt(0)).not.toBe("—");
  });
});