import { act, renderHook } from "@testing-library/react-native";
import type { ReactNode } from "react";

import { BoardProvider, useBoard } from "@/lib/board-context";
import { INITIAL_BOARDS } from "@/lib/board-types";

function wrapper({ children }: { children: ReactNode }) {
  return <BoardProvider>{children}</BoardProvider>;
}

function setup() {
  return renderHook(() => useBoard(), { wrapper });
}

test("useBoard throws when used outside a BoardProvider", async () => {
  const spy = jest.spyOn(console, "error").mockImplementation(() => {});
  await expect(renderHook(() => useBoard())).rejects.toThrow(
    "useBoard must be used within a BoardProvider"
  );
  spy.mockRestore();
});

test("boards are seeded from INITIAL_BOARDS", async () => {
  const { result } = await setup();
  expect(result.current.boards).toHaveLength(INITIAL_BOARDS.length);
  expect(result.current.boards[0].id).toBe(INITIAL_BOARDS[0].id);
});

describe("findBoard", () => {
  test("returns the matching board", async () => {
    const { result } = await setup();
    expect(result.current.findBoard("b1")?.name).toBe("Product Launch");
  });

  test("returns null when no board matches", async () => {
    const { result } = await setup();
    expect(result.current.findBoard("nope")).toBeNull();
  });
});

describe("find", () => {
  test("returns the board, column, and task for a valid task id", async () => {
    const { result } = await setup();
    const found = result.current.find("b1", "t1");
    expect(found?.board.id).toBe("b1");
    expect(found?.c.id).toBe("c1");
    expect(found?.t.id).toBe("t1");
  });

  test("returns null when the board does not exist", async () => {
    const { result } = await setup();
    expect(result.current.find("nope", "t1")).toBeNull();
  });

  test("returns null when the task does not exist in the board", async () => {
    const { result } = await setup();
    expect(result.current.find("b1", "nope")).toBeNull();
  });

  test("returns null when taskId is undefined", async () => {
    const { result } = await setup();
    expect(result.current.find("b1", undefined)).toBeNull();
  });
});

test("togglePinned flips the board's pinned flag", async () => {
  const { result } = await setup();
  expect(result.current.findBoard("b3")?.pinned).toBe(false);
  await act(() => result.current.togglePinned("b3"));
  expect(result.current.findBoard("b3")?.pinned).toBe(true);
  await act(() => result.current.togglePinned("b3"));
  expect(result.current.findBoard("b3")?.pinned).toBe(false);
});

test("renameColumn updates only the targeted column's name", async () => {
  const { result } = await setup();
  await act(() => result.current.renameColumn("b1", "c1", "Backlog"));
  const board = result.current.findBoard("b1")!;
  expect(board.columns.find((c) => c.id === "c1")?.name).toBe("Backlog");
  expect(board.columns.find((c) => c.id === "c2")?.name).toBe("In Progress");
});

describe("addColumn", () => {
  test("appends a new empty column with a unique incrementing id", async () => {
    const { result } = await setup();
    const before = result.current.findBoard("b1")!.columns.length;
    await act(() => result.current.addColumn("b1"));
    const afterFirst = result.current.findBoard("b1")!;
    expect(afterFirst.columns).toHaveLength(before + 1);
    const added = afterFirst.columns[afterFirst.columns.length - 1];
    expect(added).toEqual({ id: "col1000", name: "New column", tasks: [] });

    await act(() => result.current.addColumn("b1"));
    const afterSecond = result.current.findBoard("b1")!;
    const addedSecond = afterSecond.columns[afterSecond.columns.length - 1];
    expect(addedSecond.id).toBe("col1001");
  });
});

describe("moveTask", () => {
  test("moves a task to a specific index in another column", async () => {
    const { result } = await setup();
    await act(() => result.current.moveTask("b1", "t1", "c3", 0));
    const board = result.current.findBoard("b1")!;
    expect(
      board.columns.find((c) => c.id === "c1")!.tasks.map((t) => t.id)
    ).not.toContain("t1");
    const c3 = board.columns.find((c) => c.id === "c3")!;
    expect(c3.tasks[0].id).toBe("t1");
  });

  test("moves a task within the same column", async () => {
    const { result } = await setup();
    // c1 starts as [t1, t2, t3]; move t3 to index 0.
    await act(() => result.current.moveTask("b1", "t3", "c1", 0));
    const c1 = result.current
      .findBoard("b1")!
      .columns.find((c) => c.id === "c1")!;
    expect(c1.tasks.map((t) => t.id)).toEqual(["t3", "t1", "t2"]);
  });

  test("is a no-op when the task does not exist", async () => {
    const { result } = await setup();
    const before = result.current.findBoard("b1");
    await act(() => result.current.moveTask("b1", "does-not-exist", "c3"));
    const after = result.current.findBoard("b1");
    expect(after).toEqual(before);
  });

  test("appends to the end of the target column when no index is given", async () => {
    const { result } = await setup();
    await act(() => result.current.moveTask("b1", "t7", "c1"));
    const c1 = result.current
      .findBoard("b1")!
      .columns.find((c) => c.id === "c1")!;
    expect(c1.tasks[c1.tasks.length - 1].id).toBe("t7");
  });
});

describe("saveTask", () => {
  test("creates a new task with parsed, trimmed, non-empty labels", async () => {
    const { result } = await setup();
    let newId = "";
    await act(() => {
      newId = result.current.saveTask({
        id: null,
        title: "Write release notes",
        notes: "",
        due: "2026-09-01",
        priority: "Low",
        labels: " Design ,, Dev ,  ",
        assignee: "MK",
        board: "b1",
        col: "c1",
      });
    });
    const found = result.current.find("b1", newId);
    expect(found?.t.labels).toEqual(["Design", "Dev"]);
    expect(found?.t.title).toBe("Write release notes");
  });

  test("falls back to 'Untitled task' when the title is blank", async () => {
    const { result } = await setup();
    let newId = "";
    await act(() => {
      newId = result.current.saveTask({
        id: null,
        title: "   ",
        notes: "",
        due: "",
        priority: "Med",
        labels: "",
        assignee: "MK",
        board: "b1",
        col: "c1",
      });
    });
    expect(result.current.find("b1", newId)?.t.title).toBe("Untitled task");
  });

  test("editing an existing task preserves its checklist", async () => {
    const { result } = await setup();
    const before = result.current.find("b1", "t4")!.t;
    expect(before.checklist.length).toBeGreaterThan(0);
    await act(() => {
      result.current.saveTask({
        id: "t4",
        title: "Implement payment gateway integration (v2)",
        notes: before.notes,
        due: before.due,
        priority: before.priority,
        labels: before.labels.join(", "),
        assignee: before.assignee,
        board: "b1",
        col: "c2",
      });
    });
    const after = result.current.find("b1", "t4")!.t;
    expect(after.title).toBe("Implement payment gateway integration (v2)");
    expect(after.checklist).toEqual(before.checklist);
  });
});

test("deleteTask removes the task from its column", async () => {
  const { result } = await setup();
  expect(result.current.find("b1", "t1")).not.toBeNull();
  await act(() => result.current.deleteTask("b1", "t1"));
  expect(result.current.find("b1", "t1")).toBeNull();
});

test("toggleChecklistItem flips a single item's done state without touching siblings", async () => {
  const { result } = await setup();
  const before = result.current
    .find("b1", "t4")!
    .t.checklist.find((i) => i.id === "k3")!;
  expect(before.done).toBe(false);
  await act(() => result.current.toggleChecklistItem("b1", "t4", "k3"));
  const checklist = result.current.find("b1", "t4")!.t.checklist;
  expect(checklist.find((i) => i.id === "k3")!.done).toBe(true);
  expect(checklist.find((i) => i.id === "k1")!.done).toBe(true);
});
