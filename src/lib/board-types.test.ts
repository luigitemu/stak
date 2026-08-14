import {
  BOARD_COLORS,
  blankDraft,
  fmt,
  INITIAL_BOARDS,
  labelColor,
  TEAM,
} from "@/lib/board-types";

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

describe("blankDraft", () => {
  test("returns a draft shaped for a new task in the given board/column", () => {
    const draft = blankDraft("b1", "c2");
    expect(draft).toEqual({
      id: null,
      title: "",
      notes: "",
      due: "",
      priority: "Med",
      labels: "",
      assignee: TEAM[0].id,
      board: "b1",
      col: "c2",
    });
  });
});

describe("INITIAL_BOARDS", () => {
  test("is non-empty", () => {
    expect(INITIAL_BOARDS.length).toBeGreaterThan(0);
  });

  test("every board has a unique id", () => {
    const ids = INITIAL_BOARDS.map((b) => b.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test("every column id is unique within its board", () => {
    for (const board of INITIAL_BOARDS) {
      const colIds = board.columns.map((c) => c.id);
      expect(new Set(colIds).size).toBe(colIds.length);
    }
  });

  test("every task id is globally unique across all boards", () => {
    const taskIds = INITIAL_BOARDS.flatMap((b) =>
      b.columns.flatMap((c) => c.tasks.map((t) => t.id))
    );
    expect(new Set(taskIds).size).toBe(taskIds.length);
  });
});
