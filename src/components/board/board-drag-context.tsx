import { createContext, use, useState } from "react";
import Animated, {
  useAnimatedRef,
  useAnimatedScrollHandler,
  useSharedValue,
  type SharedValue,
} from "react-native-reanimated";

import type { ColumnLayout, TaskLayout } from "@/lib/board-drag";
import type { Task } from "@/lib/board-types";

export type ActiveDrag = { taskId: string; task: Task } | null;

/**
 * Layout and overlay positions shared with the UI thread. Written by the
 * columns and cards as they lay out, read by the pan gesture on release.
 */
export type DragMetrics = {
  scrollX: SharedValue<number>;
  columnLayouts: SharedValue<ColumnLayout[]>;
  taskLayouts: SharedValue<Record<string, TaskLayout[]>>;
  columnScrollY: SharedValue<Record<string, number>>;
  columnHeaderY: SharedValue<Record<string, number>>;
  overlayX: SharedValue<number>;
  overlayY: SharedValue<number>;
  overlayW: SharedValue<number>;
  overlayH: SharedValue<number>;
  scrollRef: ReturnType<typeof useAnimatedRef<Animated.ScrollView>>;
};

export type DragActions = {
  start: (task: Task) => void;
  drop: (taskId: string, columnId: string, index: number) => void;
  cancel: (taskId: string) => void;
};

export type BoardDragValue = {
  metrics: DragMetrics;
  activeDrag: ActiveDrag;
  actions: DragActions;
  /** Horizontal board scroll handler, wired to the board's ScrollView. */
  onBoardScroll: ReturnType<typeof useAnimatedScrollHandler>;
};

const BoardDragContext = createContext<BoardDragValue | null>(null);

export function useBoardDrag() {
  const value = use(BoardDragContext);
  if (!value) {
    throw new Error("useBoardDrag must be used within a BoardDragProvider");
  }
  return value;
}

/**
 * Owns every shared value involved in dragging so cards and columns can read
 * them from context instead of receiving nine props through two layers.
 */
export function BoardDragProvider({
  onMoveTask,
  children,
}: {
  onMoveTask: (taskId: string, columnId: string, index: number) => void;
  children: React.ReactNode;
}) {
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollX = useSharedValue(0);
  const columnLayouts = useSharedValue<ColumnLayout[]>([]);
  const taskLayouts = useSharedValue<Record<string, TaskLayout[]>>({});
  const columnScrollY = useSharedValue<Record<string, number>>({});
  const columnHeaderY = useSharedValue<Record<string, number>>({});
  const overlayX = useSharedValue(0);
  const overlayY = useSharedValue(0);
  const overlayW = useSharedValue(0);
  const overlayH = useSharedValue(0);

  const [activeDrag, setActiveDrag] = useState<ActiveDrag>(null);

  const onBoardScroll = useAnimatedScrollHandler((e) => {
    scrollX.value = e.contentOffset.x;
  });

  const actions: DragActions = {
    start: (task) => setActiveDrag({ taskId: task.id, task }),
    drop: (taskId, columnId, index) => {
      onMoveTask(taskId, columnId, index);
      setActiveDrag(null);
    },
    cancel: (taskId) =>
      setActiveDrag((current) =>
        current && current.taskId === taskId ? null : current
      ),
  };

  return (
    <BoardDragContext
      value={{
        metrics: {
          scrollX,
          columnLayouts,
          taskLayouts,
          columnScrollY,
          columnHeaderY,
          overlayX,
          overlayY,
          overlayW,
          overlayH,
          scrollRef,
        },
        activeDrag,
        actions,
        onBoardScroll,
      }}
    >
      {children}
    </BoardDragContext>
  );
}
