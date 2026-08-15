import { Pressable, Text, TextInput, View } from "react-native";
import Animated, { useAnimatedScrollHandler } from "react-native-reanimated";

import { useBoardDrag } from "@/components/board/board-drag-context";
import { TaskCard } from "@/components/board/task-card";
import { SFIcon } from "@/components/board-ui";
import { upsertColumnLayout } from "@/lib/board-drag";
import type { FilteredColumn } from "@/lib/board-types";

export function BoardColumn({
  column,
  onRename,
  onSelectTask,
  onAddTask,
}: {
  column: FilteredColumn;
  onRename: (name: string) => void;
  onSelectTask: (id: string) => void;
  onAddTask: () => void;
}) {
  const { metrics } = useBoardDrag();

  const listScrollHandler = useAnimatedScrollHandler((e) => {
    metrics.columnScrollY.value = {
      ...metrics.columnScrollY.value,
      [column.id]: e.contentOffset.y,
    };
  });

  return (
    <View
      className="w-[260px]"
      style={{ maxHeight: "100%" }}
      onLayout={(e) => {
        const { x, width } = e.nativeEvent.layout;
        metrics.columnLayouts.value = upsertColumnLayout(
          metrics.columnLayouts.value,
          { id: column.id, x, width }
        );
      }}
    >
      <View className="flex-row items-center gap-2 px-1 pb-2.5">
        <View className="h-5 min-w-5 items-center justify-center rounded-full bg-secondary px-1.5">
          <Text className="text-[11px] font-bold text-muted">
            {column.tasks.length}
          </Text>
        </View>
        <TextInput
          value={column.name}
          onChangeText={onRename}
          accessibilityLabel="Column name"
          className="flex-1 text-[13px] font-bold uppercase tracking-wide text-muted"
        />
        <Pressable
          onPress={onAddTask}
          accessibilityRole="button"
          accessibilityLabel={`Add task to ${column.name}`}
          hitSlop={8}
        >
          <SFIcon name="plus" size={16} color="#007aff" />
        </Pressable>
      </View>
      <Animated.ScrollView
        onScroll={listScrollHandler}
        scrollEventThrottle={16}
        contentContainerStyle={{ gap: 10, paddingBottom: 8 }}
        onLayout={(e) => {
          metrics.columnHeaderY.value = {
            ...metrics.columnHeaderY.value,
            [column.id]: e.nativeEvent.layout.y,
          };
        }}
      >
        {column.tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            dimmed={column.done}
            columnId={column.id}
            onPress={() => onSelectTask(task.id)}
          />
        ))}
        {column.tasks.length === 0 && (
          <Text className="px-1 py-1.5 text-[12px] text-muted">No tasks</Text>
        )}
      </Animated.ScrollView>
    </View>
  );
}
