import { Pressable, ScrollView, Text, TextInput, View } from "react-native";

import { shadow } from "@/components/board-shadows";
import { Avatar, LabelPill, SFIcon } from "@/components/board-ui";
import type { FilteredColumn, Task } from "@/lib/board-types";
import { TEAM, TODAY, fmt } from "@/lib/board-types";

function TaskCard({
  task,
  dimmed,
  onPress,
}: {
  task: Task;
  dimmed: boolean;
  onPress: () => void;
}) {
  const overdue = !dimmed && !!task.due && task.due < TODAY;
  const assignee = TEAM.find((m) => m.id === task.assignee);
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={task.title}
      className={`gap-2 rounded-xl bg-card p-3 ${dimmed ? "opacity-60" : ""}`}
      style={shadow.card}
    >
      <View className="flex-row flex-wrap gap-1.5">
        {task.labels.map((label) => (
          <LabelPill key={label} label={label} />
        ))}
      </View>
      <Text className="text-[14px] font-semibold leading-[18px] text-ink">
        {task.title}
      </Text>
      <View className="min-h-[22px] flex-row items-center justify-between">
        <View className="flex-row items-center gap-1">
          <SFIcon
            name="calendar"
            size={12}
            color={overdue ? "#ff3b30" : "#8e8e93"}
          />
          <Text
            className={`text-[12px] font-medium ${overdue ? "text-destructive" : "text-muted"}`}
          >
            {fmt(task.due)}
          </Text>
        </View>
        {assignee && <Avatar uri={assignee.avatarUrl} size={22} />}
      </View>
    </Pressable>
  );
}

function BoardColumn({
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
  return (
    <View className="w-[260px]" style={{ maxHeight: "100%" }}>
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
      <ScrollView contentContainerStyle={{ gap: 10, paddingBottom: 8 }}>
        {column.tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            dimmed={column.done}
            onPress={() => onSelectTask(task.id)}
          />
        ))}
        {column.tasks.length === 0 && (
          <Text className="px-1 py-1.5 text-[12px] text-muted">No tasks</Text>
        )}
      </ScrollView>
    </View>
  );
}

export function BoardView({
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
  return (
    <ScrollView
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
    </ScrollView>
  );
}
