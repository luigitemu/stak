import type { Board, Column, Draft, Task } from "@/lib/board-types";

export type Found = { board: Board; c: Column; t: Task };

function mapBoard(
  boards: Board[],
  boardId: string,
  fn: (board: Board) => Board
): Board[] {
  return boards.map((board) => (board.id === boardId ? fn(board) : board));
}

export function findBoard(
  boards: Board[],
  id: string | null | undefined
): Board | null {
  return boards.find((board) => board.id === id) ?? null;
}

export function find(
  boards: Board[],
  boardId: string | null | undefined,
  taskId: string | null | undefined
): Found | null {
  const board = findBoard(boards, boardId);
  if (!board || !taskId) return null;
  for (const c of board.columns) {
    const t = c.tasks.find((task) => task.id === taskId);
    if (t) return { board, c, t };
  }
  return null;
}

export function togglePinned(boards: Board[], boardId: string): Board[] {
  return mapBoard(boards, boardId, (board) => ({
    ...board,
    pinned: !board.pinned,
  }));
}

export function renameColumn(
  boards: Board[],
  boardId: string,
  colId: string,
  name: string
): Board[] {
  return mapBoard(boards, boardId, (board) => ({
    ...board,
    columns: board.columns.map((c) => (c.id === colId ? { ...c, name } : c)),
  }));
}

export function addColumn(
  boards: Board[],
  boardId: string,
  colId: string
): Board[] {
  return mapBoard(boards, boardId, (board) => ({
    ...board,
    columns: [...board.columns, { id: colId, name: "New column", tasks: [] }],
  }));
}

export function moveTask(
  boards: Board[],
  boardId: string,
  taskId: string,
  target: { colId: string; index?: number }
): Board[] {
  return mapBoard(boards, boardId, (board) => {
    let moved: Task | undefined;
    const stripped = board.columns.map((c) => {
      const idx = c.tasks.findIndex((t) => t.id === taskId);
      if (idx === -1) return c;
      moved = c.tasks[idx];
      return { ...c, tasks: c.tasks.filter((t) => t.id !== taskId) };
    });
    if (!moved) return board;
    return {
      ...board,
      columns: stripped.map((c) => {
        if (c.id !== target.colId) return c;
        const at =
          target.index === undefined
            ? c.tasks.length
            : Math.max(0, Math.min(target.index, c.tasks.length));
        const tasks = c.tasks.slice();
        tasks.splice(at, 0, moved!);
        return { ...c, tasks };
      }),
    };
  });
}

function parseLabels(labels: string): string[] {
  return labels
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
}

export function saveTask(
  boards: Board[],
  draft: Draft,
  newId: string
): Board[] {
  const existing = find(boards, draft.board, draft.id)?.t;
  const task: Task = {
    id: draft.id || newId,
    title: draft.title.trim() || "Untitled task",
    notes: draft.notes,
    due: draft.due,
    priority: draft.priority,
    labels: parseLabels(draft.labels),
    assignee: draft.assignee,
    checklist: existing?.checklist ?? [],
  };
  return mapBoard(boards, draft.board, (board) => {
    const columns = board.columns.map((c) => ({
      ...c,
      tasks: draft.id
        ? c.tasks.filter((x) => x.id !== draft.id)
        : c.tasks.slice(),
    }));
    const target = columns.find((c) => c.id === draft.col) ?? columns[0];
    return {
      ...board,
      columns: columns.map((c) =>
        c.id === target.id ? { ...c, tasks: [...c.tasks, task] } : c
      ),
    };
  });
}

export function deleteTask(
  boards: Board[],
  boardId: string,
  id: string
): Board[] {
  return mapBoard(boards, boardId, (board) => ({
    ...board,
    columns: board.columns.map((c) => ({
      ...c,
      tasks: c.tasks.filter((t) => t.id !== id),
    })),
  }));
}

export function toggleChecklistItem(
  boards: Board[],
  boardId: string,
  taskId: string,
  itemId: string
): Board[] {
  return mapBoard(boards, boardId, (board) => ({
    ...board,
    columns: board.columns.map((c) => ({
      ...c,
      tasks: c.tasks.map((t) =>
        t.id !== taskId
          ? t
          : {
              ...t,
              checklist: t.checklist.map((item) =>
                item.id === itemId ? { ...item, done: !item.done } : item
              ),
            }
      ),
    })),
  }));
}
