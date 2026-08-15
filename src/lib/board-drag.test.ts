import {
  findDropColumn,
  findInsertIndex,
  resolveDrop,
  upsertColumnLayout,
  upsertTaskLayout,
  type ColumnLayout,
  type DropGeometry,
  type TaskLayout,
} from "@/lib/board-drag";

const columns: ColumnLayout[] = [
  { id: "c1", x: 0, width: 100 },
  { id: "c2", x: 120, width: 100 },
  { id: "c3", x: 240, width: 100 },
];

describe("findDropColumn", () => {
  test("returns the column containing the drop point", () => {
    expect(findDropColumn(columns, 50)?.id).toBe("c1");
    expect(findDropColumn(columns, 150)?.id).toBe("c2");
    expect(findDropColumn(columns, 300)?.id).toBe("c3");
  });

  test("includes both column edges", () => {
    expect(findDropColumn(columns, 0)?.id).toBe("c1");
    expect(findDropColumn(columns, 100)?.id).toBe("c1");
  });

  test("returns undefined in the gap between columns", () => {
    expect(findDropColumn(columns, 110)).toBeUndefined();
  });

  test("returns undefined past the last column", () => {
    expect(findDropColumn(columns, 999)).toBeUndefined();
  });

  test("returns undefined when there are no columns", () => {
    expect(findDropColumn([], 50)).toBeUndefined();
  });
});

describe("findInsertIndex", () => {
  // Three 40pt rows stacked from y=0, so midpoints are 20, 60 and 100.
  const rows: TaskLayout[] = [
    { id: "t1", y: 0, height: 40 },
    { id: "t2", y: 40, height: 40 },
    { id: "t3", y: 80, height: 40 },
  ];

  test("inserts at the front when dropped above the first midpoint", () => {
    expect(findInsertIndex(rows, "x", 0)).toBe(0);
    expect(findInsertIndex(rows, "x", 19)).toBe(0);
  });

  test("inserts after a row once past its midpoint", () => {
    expect(findInsertIndex(rows, "x", 20)).toBe(1);
    expect(findInsertIndex(rows, "x", 59)).toBe(1);
    expect(findInsertIndex(rows, "x", 60)).toBe(2);
  });

  test("appends when dropped below every midpoint", () => {
    expect(findInsertIndex(rows, "x", 500)).toBe(3);
  });

  test("excludes the dragged task from the index calculation", () => {
    // Without t1 the remaining midpoints are 60 and 100, so a drop at 30 is
    // still the front of the list.
    expect(findInsertIndex(rows, "t1", 30)).toBe(0);
    expect(findInsertIndex(rows, "t1", 70)).toBe(1);
  });

  test("returns 0 for an empty column", () => {
    expect(findInsertIndex([], "t1", 100)).toBe(0);
  });

  test("returns 0 when the column holds only the dragged task", () => {
    expect(findInsertIndex([rows[0]], "t1", 100)).toBe(0);
  });

  test("sorts unordered rows before comparing", () => {
    const shuffled = [rows[2], rows[0], rows[1]];
    expect(findInsertIndex(shuffled, "x", 20)).toBe(1);
    expect(findInsertIndex(shuffled, "x", 500)).toBe(3);
  });
});

function geometry(overrides: Partial<DropGeometry> = {}): DropGeometry {
  return {
    overlay: { x: 0, y: 0, width: 80, height: 40 },
    scrollX: 0,
    columns,
    tasksByColumn: {},
    columnScrollY: {},
    columnHeaderY: {},
    draggedTaskId: "t1",
    ...overrides,
  };
}

describe("resolveDrop", () => {
  test("resolves to the column under the overlay's horizontal midpoint", () => {
    // Overlay spans x 100..180, so its midpoint is 140 -> c2.
    const target = resolveDrop(
      geometry({ overlay: { x: 100, y: 0, width: 80, height: 40 } })
    );
    expect(target).toEqual({ columnId: "c2", index: 0 });
  });

  test("returns null when released outside every column", () => {
    // Midpoint 110 falls in the gap between c1 and c2.
    expect(
      resolveDrop(geometry({ overlay: { x: 70, y: 0, width: 80, height: 40 } }))
    ).toBeNull();
  });

  test("accounts for horizontal board scroll", () => {
    // Overlay midpoint is 40, but 200 of scroll puts it at 240 -> c3.
    const target = resolveDrop(
      geometry({
        overlay: { x: 0, y: 0, width: 80, height: 40 },
        scrollX: 200,
      })
    );
    expect(target?.columnId).toBe("c3");
  });

  test("subtracts the column header offset from the drop position", () => {
    const rows: TaskLayout[] = [
      { id: "a", y: 0, height: 40 },
      { id: "b", y: 40, height: 40 },
    ];
    // Overlay midpoint y is 70; a 60pt header puts it at 10 in content space,
    // which is above the first midpoint (20).
    const target = resolveDrop(
      geometry({
        overlay: { x: 0, y: 50, width: 80, height: 40 },
        tasksByColumn: { c1: rows },
        columnHeaderY: { c1: 60 },
      })
    );
    expect(target).toEqual({ columnId: "c1", index: 0 });
  });

  test("adds the column's list scroll offset to the drop position", () => {
    const rows: TaskLayout[] = [
      { id: "a", y: 0, height: 40 },
      { id: "b", y: 40, height: 40 },
    ];
    // Overlay midpoint y is 20 which alone would insert at index 1; scrolling
    // the list by 100 pushes the effective drop to 120, past both midpoints.
    const target = resolveDrop(
      geometry({
        overlay: { x: 0, y: 0, width: 80, height: 40 },
        tasksByColumn: { c1: rows },
        columnScrollY: { c1: 100 },
      })
    );
    expect(target).toEqual({ columnId: "c1", index: 2 });
  });

  test("treats a column with no recorded task layouts as empty", () => {
    const target = resolveDrop(
      geometry({ overlay: { x: 0, y: 500, width: 80, height: 40 } })
    );
    expect(target).toEqual({ columnId: "c1", index: 0 });
  });
});

describe("upsertTaskLayout", () => {
  test("adds a layout to a column that has none", () => {
    const next = upsertTaskLayout({}, "c1", { id: "t1", y: 0, height: 40 });
    expect(next).toEqual({ c1: [{ id: "t1", y: 0, height: 40 }] });
  });

  test("replaces an existing entry for the same task rather than duplicating", () => {
    const first = upsertTaskLayout({}, "c1", { id: "t1", y: 0, height: 40 });
    const second = upsertTaskLayout(first, "c1", {
      id: "t1",
      y: 90,
      height: 50,
    });
    expect(second.c1).toEqual([{ id: "t1", y: 90, height: 50 }]);
  });

  test("keeps other tasks and other columns intact", () => {
    const base = {
      c1: [{ id: "t1", y: 0, height: 40 }],
      c2: [{ id: "t9", y: 0, height: 40 }],
    };
    const next = upsertTaskLayout(base, "c1", { id: "t2", y: 40, height: 40 });
    expect(next.c1).toHaveLength(2);
    expect(next.c2).toEqual(base.c2);
  });

  test("does not mutate the input", () => {
    const base = { c1: [{ id: "t1", y: 0, height: 40 }] };
    upsertTaskLayout(base, "c1", { id: "t2", y: 40, height: 40 });
    expect(base.c1).toHaveLength(1);
  });
});

describe("upsertColumnLayout", () => {
  test("appends a new column", () => {
    expect(upsertColumnLayout([], { id: "c1", x: 0, width: 100 })).toEqual([
      { id: "c1", x: 0, width: 100 },
    ]);
  });

  test("replaces an existing column by id", () => {
    const next = upsertColumnLayout(columns, { id: "c2", x: 500, width: 200 });
    expect(next).toHaveLength(3);
    expect(next.find((c) => c.id === "c2")).toEqual({
      id: "c2",
      x: 500,
      width: 200,
    });
  });

  test("does not mutate the input", () => {
    const base: ColumnLayout[] = [{ id: "c1", x: 0, width: 100 }];
    upsertColumnLayout(base, { id: "c1", x: 9, width: 9 });
    expect(base).toEqual([{ id: "c1", x: 0, width: 100 }]);
  });
});
