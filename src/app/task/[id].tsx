import { router, Stack, useLocalSearchParams } from "expo-router";
import type { ReactNode } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Avatar, SFIcon } from "@/components/board-ui";
import { useBoard } from "@/lib/board-context";
import { TEAM } from "@/lib/board-fixtures";
import { fmt, type Board, type Task } from "@/lib/board-types";
import { firstParam } from "@/lib/params";

function Header({
  columnName,
  onEdit,
  onDelete,
}: {
  columnName: string;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <View className="flex-row items-center justify-between px-4 pb-3 pt-1">
      <Pressable
        onPress={() => router.back()}
        hitSlop={12}
        accessibilityRole="button"
        accessibilityLabel="Back"
        className="flex-row items-center gap-1"
      >
        <SFIcon name="chevron.left" size={18} color="#007aff" />
        <Text className="text-[17px] text-primary">Back</Text>
      </Pressable>
      <View className="rounded-full bg-primary-10 px-3 py-1">
        <Text className="text-[11px] font-bold uppercase tracking-wide text-primary">
          {columnName}
        </Text>
      </View>
      <View className="flex-row items-center gap-4">
        <Pressable
          onPress={onEdit}
          accessibilityRole="button"
          accessibilityLabel="Edit task"
          hitSlop={8}
        >
          <SFIcon name="pencil" size={18} color="#007aff" />
        </Pressable>
        <Pressable
          onPress={onDelete}
          accessibilityRole="button"
          accessibilityLabel="Delete task"
          hitSlop={8}
        >
          <SFIcon name="trash" size={18} color="#ff3b30" />
        </Pressable>
      </View>
    </View>
  );
}

function Meta({ task, boardName }: { task: Task; boardName: string }) {
  const assignee = TEAM.find((m) => m.id === task.assignee);
  return (
    <>
      <View className="px-4 pb-2 pt-4">
        <Text className="text-[28px] font-bold leading-[32px] text-ink">
          {task.title}
        </Text>
        <Text className="mt-1 text-[15px] text-muted">
          in <Text className="font-semibold text-ink">{boardName}</Text>
        </Text>
      </View>
      <View className="flex-row gap-3 px-4 pt-4">
        <View className="flex-1 gap-1.5 rounded-2xl bg-card p-3.5">
          <Text className="text-[11px] font-semibold uppercase tracking-wide text-muted">
            Assignee
          </Text>
          <View className="flex-row items-center gap-2">
            {assignee && <Avatar uri={assignee.avatarUrl} size={26} />}
            <Text className="text-[15px] font-semibold text-ink">
              {assignee?.name ?? "—"}
            </Text>
          </View>
        </View>
        <View className="flex-1 gap-1.5 rounded-2xl bg-card p-3.5">
          <Text className="text-[11px] font-semibold uppercase tracking-wide text-muted">
            Due Date
          </Text>
          <View className="flex-row items-center gap-1.5">
            <SFIcon name="calendar" size={14} color="#007aff" />
            <Text className="text-[15px] font-semibold text-primary">
              {fmt(task.due) || "—"}
            </Text>
          </View>
        </View>
      </View>
      <View className="gap-2 px-4 pt-5">
        <Text className="text-[13px] font-semibold uppercase tracking-wide text-muted">
          Description
        </Text>
        <View className="rounded-2xl bg-card p-3.5">
          <Text className="text-[14px] leading-[20px] text-ink">
            {task.notes || "No description."}
          </Text>
        </View>
      </View>
    </>
  );
}

function Checklist({
  task,
  onToggle,
}: {
  task: Task;
  onToggle: (itemId: string) => void;
}) {
  if (task.checklist.length === 0) return null;
  const done = task.checklist.filter((i) => i.done).length;
  return (
    <View className="gap-2 px-4 pt-5">
      <View className="flex-row items-center justify-between">
        <Text className="text-[13px] font-semibold uppercase tracking-wide text-muted">
          Checklist
        </Text>
        <Text className="text-[13px] font-bold text-primary">
          {done}/{task.checklist.length} Done
        </Text>
      </View>
      <View className="overflow-hidden rounded-2xl bg-card">
        {task.checklist.map((item, i) => (
          <Pressable
            key={item.id}
            onPress={() => onToggle(item.id)}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: item.done }}
            accessibilityLabel={item.text}
            className={`flex-row items-center gap-3 px-3.5 py-3 ${i > 0 ? "border-t border-border" : ""}`}
          >
            <SFIcon
              name={item.done ? "checkmark.circle.fill" : "circle"}
              size={20}
              color={item.done ? "#007aff" : "#c7c7cc"}
            />
            <Text
              className={`flex-1 text-[15px] ${item.done ? "text-muted line-through" : "text-ink"}`}
            >
              {item.text}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function MoveTo({
  board,
  currentColId,
  onMove,
}: {
  board: Board;
  currentColId: string;
  onMove: (colId: string) => void;
}) {
  const rows = board.columns.reduce<ReactNode[]>((acc, col) => {
    if (col.id === currentColId) return acc;
    const i = acc.length;
    acc.push(
      <Pressable
        key={col.id}
        onPress={() => onMove(col.id)}
        accessibilityRole="button"
        accessibilityLabel={`Move to ${col.name}`}
        className={`flex-row items-center justify-between px-3.5 py-3 ${i > 0 ? "border-t border-border" : ""}`}
      >
        <Text className="text-[15px] text-ink">{col.name}</Text>
        <SFIcon name="arrow.right" size={14} color="#007aff" />
      </Pressable>
    );
    return acc;
  }, []);

  return (
    <View className="gap-2 px-4 pt-5">
      <Text className="text-[13px] font-semibold uppercase tracking-wide text-muted">
        Move to
      </Text>
      <View className="overflow-hidden rounded-2xl bg-card">{rows}</View>
    </View>
  );
}

export default function TaskDetailSheet() {
  const params = useLocalSearchParams<{ id: string; board: string }>();
  const id = firstParam(params.id);
  const boardId = firstParam(params.board);
  const { find, moveTask, deleteTask, toggleChecklistItem } = useBoard();
  const active = find(boardId, id);

  if (!active) return null;
  const { board, c, t } = active;

  return (
    <SafeAreaView className="flex-1 bg-sheet">
      <Stack.Screen options={{ headerShown: false }} />
      <Header
        columnName={c.name}
        onEdit={() =>
          router.push({
            pathname: "/task/edit",
            params: { id: t.id, board: board.id },
          })
        }
        onDelete={() => {
          deleteTask(board.id, t.id);
          router.back();
        }}
      />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        <Meta task={t} boardName={board.name} />
        <Checklist
          task={t}
          onToggle={(itemId) => toggleChecklistItem(board.id, t.id, itemId)}
        />
        <MoveTo
          board={board}
          currentColId={c.id}
          onMove={(colId) => {
            moveTask(board.id, t.id, colId);
            router.back();
          }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
