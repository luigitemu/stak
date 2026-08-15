import { INITIAL_BOARDS, TEAM, blankDraft } from "@/lib/board-fixtures";

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

  test("every task references a real team member", () => {
    const memberIds = new Set(TEAM.map((m) => m.id));
    const assignees = INITIAL_BOARDS.flatMap((b) =>
      b.columns.flatMap((c) => c.tasks.map((t) => t.assignee))
    );
    for (const assignee of assignees) {
      expect(memberIds).toContain(assignee);
    }
  });
});
