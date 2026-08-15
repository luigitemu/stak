import { createContext, use, useState, type ReactNode } from "react";

import { INITIAL_BOARDS } from "@/lib/board-fixtures";
import * as ops from "@/lib/board-ops";
import type { Board, BoardColor, Draft } from "@/lib/board-types";

type BoardContextValue = {
  boards: Board[];
  findBoard: (id: string | null | undefined) => Board | null;
  find: (
    boardId: string | null | undefined,
    taskId: string | null | undefined
  ) => ops.Found | null;
  addBoard: (name: string, icon: string, color: BoardColor) => string;
  togglePinned: (boardId: string) => void;
  renameColumn: (boardId: string, colId: string, name: string) => void;
  addColumn: (boardId: string) => void;
  moveTask: (
    boardId: string,
    id: string,
    colId: string,
    index?: number
  ) => void;
  saveTask: (draft: Draft) => string;
  deleteTask: (boardId: string, id: string) => void;
  toggleChecklistItem: (
    boardId: string,
    taskId: string,
    itemId: string
  ) => void;
};

const BoardContext = createContext<BoardContextValue | null>(null);

export function BoardProvider({ children }: { children: ReactNode }) {
  const [boards, setBoards] = useState(INITIAL_BOARDS);
  const [nextId, setNextId] = useState(1000);

  const value: BoardContextValue = {
    boards,
    findBoard: (id) => ops.findBoard(boards, id),
    find: (boardId, taskId) => ops.find(boards, boardId, taskId),
    addBoard: (name, icon, color) => {
      const id = `b${nextId}`;
      setBoards((prev) => ops.addBoard(prev, id, { name, icon, color }));
      setNextId((n) => n + 1);
      return id;
    },
    togglePinned: (boardId) =>
      setBoards((prev) => ops.togglePinned(prev, boardId)),
    renameColumn: (boardId, colId, name) =>
      setBoards((prev) => ops.renameColumn(prev, boardId, colId, name)),
    addColumn: (boardId) => {
      setBoards((prev) => ops.addColumn(prev, boardId, `col${nextId}`));
      setNextId((n) => n + 1);
    },
    moveTask: (boardId, id, colId, index) =>
      setBoards((prev) => ops.moveTask(prev, boardId, id, { colId, index })),
    saveTask: (draft) => {
      const id = draft.id || `t${nextId}`;
      setBoards((prev) => ops.saveTask(prev, draft, id));
      if (!draft.id) setNextId((n) => n + 1);
      return id;
    },
    deleteTask: (boardId, id) =>
      setBoards((prev) => ops.deleteTask(prev, boardId, id)),
    toggleChecklistItem: (boardId, taskId, itemId) =>
      setBoards((prev) =>
        ops.toggleChecklistItem(prev, boardId, taskId, itemId)
      ),
  };

  return (
    <BoardContext.Provider value={value}>{children}</BoardContext.Provider>
  );
}

export function useBoard() {
  const ctx = use(BoardContext);
  if (!ctx) throw new Error("useBoard must be used within a BoardProvider");
  return ctx;
}
