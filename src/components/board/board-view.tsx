import { Pressable, View } from "react-native";
import Animated, { useAnimatedStyle } from "react-native-reanimated";

import { BoardColumn } from "@/components/board/board-column";
import {
  BoardDragProvider,
  useBoardDrag,
} from "@/components/board/board-drag-context";
import { TaskCardContent } from "@/components/board/task-card";
import { shadow } from "@/components/board-shadows";
import { SFIcon } from "@/components/board-ui";
import { TODAY, type FilteredColumn } from "@/lib/board-types";

/** Follows the dragged card under the finger, above the board. */
function DragOverlay() {
  const { metrics, activeDrag } = useBoardDrag();

  const overlayStyle = useAnimatedStyle(() => ({
    position: "absolute",
    left: metrics.overlayX.value,
    top: metrics.overlayY.value,
    width: metrics.overlayW.value,
    height: metrics.overlayH.value,
  }));

  if (!activeDrag) {
    return null;
  }

  return (
    <Animated.View
      pointerEvents="none"
      className="gap-2 rounded-xl bg-card p-3"
      style={[shadow.card, overlayStyle, { opacity: 0.95, zIndex: 1000 }]}
    >
      <TaskCardContent
        task={activeDrag.task}
        overdue={!!activeDrag.task.due && activeDrag.task.due < TODAY}
      />
    </Animated.View>
  );
}

function BoardCanvas({
  columns,
  onRenameColumn,
  onAddColumn,
  onSelectTask,
  onAddTask,
}: {
  columns: FilteredColumn[];
  onRenameColumn: (colId: string, name: string) => void;
  onAddColumn: () => void;
  onSelectTask: (id: string) => void;
  onAddTask: (colId: string) => void;
}) {
  const { metrics, onBoardScroll } = useBoardDrag();

  return (
    <View className="flex-1">
      <Animated.ScrollView
        ref={metrics.scrollRef}
        onScroll={onBoardScroll}
        scrollEventThrottle={16}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 16, padding: 16 }}
        className="flex-1"
      >
        {columns.map((column) => (
          <BoardColumn
            key={column.id}
            column={column}
            onRename={(name) => onRenameColumn(column.id, name)}
            onSelectTask={onSelectTask}
            onAddTask={() => onAddTask(column.id)}
          />
        ))}
        <Pressable
          onPress={onAddColumn}
          accessibilityRole="button"
          accessibilityLabel="Add column"
          className="w-[120px] items-center justify-center self-stretch rounded-2xl bg-ink/[0.04]"
        >
          <SFIcon name="plus" size={16} color="#8e8e93" />
        </Pressable>
      </Animated.ScrollView>
      <DragOverlay />
    </View>
  );
}

export function BoardView({
  columns,
  onRenameColumn,
  onAddColumn,
  onSelectTask,
  onAddTask,
  onMoveTask,
}: {
  columns: FilteredColumn[];
  onRenameColumn: (colId: string, name: string) => void;
  onAddColumn: () => void;
  onSelectTask: (id: string) => void;
  onAddTask: (colId: string) => void;
  onMoveTask: (taskId: string, colId: string, index: number) => void;
}) {
  return (
    <BoardDragProvider onMoveTask={onMoveTask}>
      <BoardCanvas
        columns={columns}
        onRenameColumn={onRenameColumn}
        onAddColumn={onAddColumn}
        onSelectTask={onSelectTask}
        onAddTask={onAddTask}
      />
    </BoardDragProvider>
  );
}
