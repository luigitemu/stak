import {
  addBoard,
  addColumn,
  deleteTask,
  find,
  findBoard,
  moveTask,
  renameColumn,
  saveTask,
  toggleChecklistItem,
  togglePinned,
} from "@/lib/board-ops";
import { INITIAL_BOARDS } from "@/lib/board-fixtures";
import type { Board, Draft } from "@/lib/board-types";

function boards(): Board[] {
  return structuredClone(INITIAL_BOARDS);
}

function newDraft(overrides: Partial<Draft> = {}): Draft {
  return {
    id: null,
    title: "Write release notes",
    notes: "",
    due: "2026-09-01",
    priority: "Low",
    labels: " Design ,, Dev ,  ",
    assignee: "MK",
    board: "b1",
    col: "c1",
    ...overrides,
  };
}

describe("findBoard", () => {
  test("returns the matching board", () => {
    expect(findBoard(boards(), "b1")?.name).toBe("Product Launch");
  });

  test("returns null when no board matches", () => {
    expect(findBoard(boards(), "nope")).toBeNull();
  });

  test("returns null when the id is missing", () => {
    expect(findBoard(boards(), undefined)).toBeNull();
    expect(findBoard(boards(), null)).toBeNull();
  });
});

describe("addBoard", () => {
  test("appends a new board with seeded columns", () => {
    const result = addBoard(boards(), "b9", {
      name: "Launch Plan",
      icon: "flag.fill",
      color: "sky",
    });
    const board = result.at(-1);
    expect(board).toMatchObject({
      id: "b9",
      name: "Launch Plan",
      icon: "flag.fill",
      color: "sky",
      pinned: false,
      updatedLabel: "Just now",
    });
    expect(board?.columns.map((c) => c.name)).toEqual([
      "To Do",
      "In Progress",
      "Done",
    ]);
    expect(result).toHaveLength(boards().length + 1);
  });

  test("falls back to a default name when blank", () => {
    const result = addBoard(boards(), "b9", {
      name: "   ",
      icon: "flag.fill",
      color: "sky",
    });
    expect(result.at(-1)?.name).toBe("Untitled board");
  });
});

describe("find", () => {
  test("returns the board, column, and task for a valid task id", () => {
    const found = find(boards(), "b1", "t1");
    expect(found?.board.id).toBe("b1");
    expect(found?.c.id).toBe("c1");
    expect(found?.t.id).toBe("t1");
  });

  test("returns null when the board does not exist", () => {
    expect(find(boards(), "nope", "t1")).toBeNull();
  });

  test("returns null when the task does not exist", () => {
    expect(find(boards(), "b1", "nope")).toBeNull();
  });

  test("returns null when taskId is missing", () => {
    expect(find(boards(), "b1", undefined)).toBeNull();
    expect(find(boards(), "b1", null)).toBeNull();
  });
});

test("togglePinned flips the board's pinned flag", () => {
  const after = togglePinned(boards(), "b3");
  expect(findBoard(after, "b3")?.pinned).toBe(true);
  expect(findBoard(togglePinned(after, "b3"), "b3")?.pinned).toBe(false);
});

test("renameColumn updates only the targeted column's name", () => {
  const board = findBoard(renameColumn(boards(), "b1", "c1", "Backlog"), "b1")!;
  expect(board.columns.find((c) => c.id === "c1")?.name).toBe("Backlog");
  expect(board.columns.find((c) => c.id === "c2")?.name).toBe("In Progress");
});

test("addColumn appends an empty column with the given id", () => {
  const before = findBoard(boards(), "b1")!.columns.length;
  const board = findBoard(addColumn(boards(), "b1", "col1000"), "b1")!;
  expect(board.columns).toHaveLength(before + 1);
  expect(board.columns[board.columns.length - 1]).toEqual({
    id: "col1000",
    name: "New column",
    tasks: [],
  });
});

describe("moveTask", () => {
  test("moves a task to a specific index in another column", () => {
    const board = findBoard(
      moveTask(boards(), "b1", "t1", { colId: "c3", index: 0 }),
      "b1"
    )!;
    expect(
      board.columns.find((c) => c.id === "c1")!.tasks.map((t) => t.id)
    ).not.toContain("t1");
    expect(board.columns.find((c) => c.id === "c3")!.tasks[0].id).toBe("t1");
  });

  test("moves a task within the same column", () => {
    const board = findBoard(
      moveTask(boards(), "b1", "t3", { colId: "c1", index: 0 }),
      "b1"
    )!;
    const c1 = board.columns.find((c) => c.id === "c1")!;
    expect(c1.tasks.map((t) => t.id)).toEqual(["t3", "t1", "t2"]);
  });

  test("is a no-op when the task does not exist", () => {
    const before = boards();
    expect(moveTask(before, "b1", "does-not-exist", { colId: "c3" })).toEqual(
      before
    );
  });

  test("appends to the end of the target column when no index is given", () => {
    const board = findBoard(
      moveTask(boards(), "b1", "t7", { colId: "c1" }),
      "b1"
    )!;
    const c1 = board.columns.find((c) => c.id === "c1")!;
    expect(c1.tasks[c1.tasks.length - 1].id).toBe("t7");
  });

  test("clamps an out-of-range index to the column bounds", () => {
    const high = findBoard(
      moveTask(boards(), "b1", "t7", { colId: "c1", index: 999 }),
      "b1"
    )!;
    const c1 = high.columns.find((c) => c.id === "c1")!;
    expect(c1.tasks[c1.tasks.length - 1].id).toBe("t7");

    const low = findBoard(
      moveTask(boards(), "b1", "t7", { colId: "c1", index: -5 }),
      "b1"
    )!;
    expect(low.columns.find((c) => c.id === "c1")!.tasks[0].id).toBe("t7");
  });
});

describe("saveTask", () => {
  test("creates a new task with parsed, trimmed, non-empty labels", () => {
    const after = saveTask(boards(), newDraft(), "t999");
    const found = find(after, "b1", "t999")!;
    expect(found.t.labels).toEqual(["Design", "Dev"]);
    expect(found.t.title).toBe("Write release notes");
    expect(found.t.checklist).toEqual([]);
  });

  test("falls back to 'Untitled task' when the title is blank", () => {
    const after = saveTask(boards(), newDraft({ title: "   " }), "t999");
    expect(find(after, "b1", "t999")?.t.title).toBe("Untitled task");
  });

  test("editing an existing task preserves its checklist", () => {
    const before = find(boards(), "b1", "t4")!.t;
    const after = saveTask(
      boards(),
      newDraft({
        id: "t4",
        title: "Implement payment gateway integration (v2)",
        notes: before.notes,
        due: before.due,
        priority: before.priority,
        labels: before.labels.join(", "),
        assignee: before.assignee,
        board: "b1",
        col: "c2",
      }),
      "unused"
    );
    const saved = find(after, "b1", "t4")!.t;
    expect(saved.title).toBe("Implement payment gateway integration (v2)");
    expect(saved.checklist).toEqual(before.checklist);
  });

  test("falls back to the first column when the target column is missing", () => {
    const after = saveTask(boards(), newDraft({ col: "missing" }), "t999");
    const found = find(after, "b1", "t999")!;
    expect(found.c.id).toBe("c1");
  });
});

test("deleteTask removes the task from its column", () => {
  const after = deleteTask(boards(), "b1", "t1");
  expect(find(after, "b1", "t1")).toBeNull();
});

test("toggleChecklistItem flips a single item without touching siblings", () => {
  const after = toggleChecklistItem(boards(), "b1", "t4", "k3");
  const checklist = find(after, "b1", "t4")!.t.checklist;
  expect(checklist.find((i) => i.id === "k3")!.done).toBe(true);
  expect(checklist.find((i) => i.id === "k1")!.done).toBe(true);
});
