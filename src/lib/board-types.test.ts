import { BOARD_COLORS, fmt, labelColor } from "@/lib/board-types";

describe("fmt", () => {
  test("formats an ISO date string as 'Mon D'", () => {
    expect(fmt("2026-08-14")).toBe("Aug 14");
  });

  test("returns an empty string for an empty input", () => {
    expect(fmt("")).toBe("");
  });
});

describe("labelColor", () => {
  test("returns the same BOARD_COLORS entry for the same label every time", () => {
    const first = labelColor("Design");
    const second = labelColor("Design");
    expect(first).toEqual(second);
    expect(Object.values(BOARD_COLORS)).toContainEqual(first);
  });

  test("hashes different labels across the color set (not all identical)", () => {
    const labels = ["Design", "Dev", "Copy", "Marketing", "QA", "Ops"];
    const colors = new Set(labels.map((l) => labelColor(l).fg));
    expect(colors.size).toBeGreaterThan(1);
  });
});
