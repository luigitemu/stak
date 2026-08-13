import { createContext, use, useState, type ReactNode } from "react";

import {
  INITIAL_BOARDS,
  type Board,
  type Column,
  type Draft,
  type Task,
} from "@/lib/board-types";

type Found = { board: Board; c: Column; t: Task };

type BoardContextValue = {
  boards: Board[];
  findBoard: (id: string | null | undefined) => Board | null;
  find: (
    boardId: string | null | undefined,
    taskId: string | null | undefined,
  ) => Found | null;
  togglePinned: (boardId: string) => void;
  renameColumn: (boardId: string, colId: string, name: string) => void;
  addColumn: (boardId: string) => void;
  moveTask: (boardId: string, id: string, colId: string) => void;
  saveTask: (draft: Draft) => string;
  deleteTask: (boardId: string, id: string) => void;
  toggleChecklistItem: (
    boardId: string,
    taskId: string,
    itemId: string,
  ) => void;
};

const BoardContext = createContext<BoardContextValue | null>(null);

export function BoardProvider({ children }: { children: ReactNode }) {
  const [boards, setBoards] = useState<Board[]>(INITIAL_BOARDS);
  const [nextId, setNextId] = useState(1000);

  const findBoard = (id: string | null | undefined): Board | null =>
    boards.find((b) => b.id === id) ?? null;

  const find = (
    boardId: string | null | undefined,
    taskId: string | null | undefined,
  ): Found | null => {
    const board = findBoard(boardId);
    if (!board || !taskId) return null;
    for (const c of board.columns) {
      const t = c.tasks.find((t) => t.id === taskId);
      if (t) return { board, c, t };
    }
    return null;
  };

  const updateBoard = (boardId: string, fn: (b: Board) => Board) => {
    setBoards((prev) => prev.map((b) => (b.id === boardId ? fn(b) : b)));
  };

  const togglePinned = (boardId: string) => {
    updateBoard(boardId, (b) => ({ ...b, pinned: !b.pinned }));
  };

  const renameColumn = (boardId: string, colId: string, name: string) => {
    updateBoard(boardId, (b) => ({
      ...b,
      columns: b.columns.map((c) => (c.id === colId ? { ...c, name } : c)),
    }));
  };

  const addColumn = (boardId: string) => {
    updateBoard(boardId, (b) => ({
      ...b,
      columns: [
        ...b.columns,
        { id: `col${nextId}`, name: "New column", tasks: [] },
      ],
    }));
    setNextId((n) => n + 1);
  };

  const moveTask = (boardId: string, id: string, colId: string) => {
    updateBoard(boardId, (b) => {
      let moved: Task | undefined;
      const stripped = b.columns.map((c) => {
        const idx = c.tasks.findIndex((t) => t.id === id);
        if (idx === -1) return c;
        moved = c.tasks[idx];
        return { ...c, tasks: c.tasks.filter((t) => t.id !== id) };
      });
      if (!moved) return b;
      return {
        ...b,
        columns: stripped.map((c) =>
          c.id === colId ? { ...c, tasks: [...c.tasks, moved!] } : c,
        ),
      };
    });
  };

  const saveTask = (draft: Draft) => {
    const id = draft.id || `t${nextId}`;
    const existing = find(draft.board, draft.id)?.t;
    const t: Task = {
      id,
      title: draft.title.trim() || "Untitled task",
      notes: draft.notes,
      due: draft.due,
      priority: draft.priority,
      labels: draft.labels
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean),
      assignee: draft.assignee,
      checklist: existing?.checklist ?? [],
    };
    updateBoard(draft.board, (b) => {
      const columns = b.columns.map((c) => ({
        ...c,
        tasks: draft.id
          ? c.tasks.filter((x) => x.id !== draft.id)
          : c.tasks.slice(),
      }));
      const target = columns.find((c) => c.id === draft.col) ?? columns[0];
      return {
        ...b,
        columns: columns.map((c) =>
          c.id === target.id ? { ...c, tasks: [...c.tasks, t] } : c,
        ),
      };
    });
    if (!draft.id) setNextId((n) => n + 1);
    return id;
  };

  const deleteTask = (boardId: string, id: string) => {
    updateBoard(boardId, (b) => ({
      ...b,
      columns: b.columns.map((c) => ({
        ...c,
        tasks: c.tasks.filter((t) => t.id !== id),
      })),
    }));
  };

  const toggleChecklistItem = (
    boardId: string,
    taskId: string,
    itemId: string,
  ) => {
    updateBoard(boardId, (b) => ({
      ...b,
      columns: b.columns.map((c) => ({
        ...c,
        tasks: c.tasks.map((t) =>
          t.id !== taskId
            ? t
            : {
                ...t,
                checklist: t.checklist.map((item) =>
                  item.id === itemId ? { ...item, done: !item.done } : item,
                ),
              },
        ),
      })),
    }));
  };

  return (
    <BoardContext.Provider
      value={{
        boards,
        findBoard,
        find,
        togglePinned,
        renameColumn,
        addColumn,
        moveTask,
        saveTask,
        deleteTask,
        toggleChecklistItem,
      }}
    >
      {children}
    </BoardContext.Provider>
  );
}

export function useBoard() {
  const ctx = use(BoardContext);
  if (!ctx) throw new Error("useBoard must be used within a BoardProvider");
  return ctx;
}
