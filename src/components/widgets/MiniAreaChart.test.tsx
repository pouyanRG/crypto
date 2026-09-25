import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import MiniAreaChart from "./MiniAreaChart";

describe("MiniAreaChart", () => {
  afterEach(cleanup);

  it("uses the supplied dimensions for the Recharts wrapper", () => {
    const { container } = render(
      <MiniAreaChart data={[{ value: 1 }, { value: 2 }]} width={88} height={40} />,
    );

    expect(container.querySelector(".recharts-wrapper")).toHaveStyle({
      width: "88px",
      height: "40px",
    });
  });
});