import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { Avatar, SFIcon } from '@/components/board-ui';
import { useBoard } from '@/lib/board-context';
import { fmt, TEAM } from '@/lib/board-types';
import { firstParam } from '@/lib/params';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TaskDetailSheet() {
  const params = useLocalSearchParams<{ id: string; board: string }>();
  const id = firstParam(params.id);
  const boardId = firstParam(params.board);
  const { find, moveTask, deleteTask, toggleChecklistItem } = useBoard();
  const active = find(boardId, id);

  if (!active) return null;
  const { board, c, t } = active;
  const assignee = TEAM.find((m) => m.id === t.assignee);
  const done = t.checklist.filter((i) => i.done).length;

  return (
    <SafeAreaView className="flex-1 bg-sheet">
      <Stack.Screen options={{ headerShown: false }} />
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
            {c.name}
          </Text>
        </View>
        <View className="flex-row items-center gap-4">
          <Pressable
            onPress={() =>
              router.push({
                pathname: '/task/edit',
                params: { id: t.id, board: board.id },
              })
            }
            accessibilityRole="button"
            accessibilityLabel="Edit task"
            hitSlop={8}
          >
            <SFIcon name="pencil" size={18} color="#007aff" />
          </Pressable>
          <Pressable
            onPress={() => {
              deleteTask(board.id, t.id);
              router.back();
            }}
            accessibilityRole="button"
            accessibilityLabel="Delete task"
            hitSlop={8}
          >
            <SFIcon name="trash" size={18} color="#ff3b30" />
          </Pressable>
        </View>
      </View>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        <View className="px-4 pb-2 pt-4">
          <View className="mb-3 self-start rounded-full bg-primary-10 px-3 py-1">
            <Text className="text-[11px] font-bold uppercase tracking-wide text-primary">
              {c.name}
            </Text>
          </View>
          <Text className="text-[28px] font-bold leading-[32px] text-ink">
            {t.title}
          </Text>
          <Text className="mt-1 text-[15px] text-muted">
            in <Text className="font-semibold text-ink">{board.name}</Text>
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
                {assignee?.name ?? '—'}
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
                {fmt(t.due) || '—'}
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
              {t.notes || 'No description.'}
            </Text>
          </View>
        </View>

        {t.checklist.length > 0 && (
          <View className="gap-2 px-4 pt-5">
            <View className="flex-row items-center justify-between">
              <Text className="text-[13px] font-semibold uppercase tracking-wide text-muted">
                Checklist
              </Text>
              <Text className="text-[13px] font-bold text-primary">
                {done}/{t.checklist.length} Done
              </Text>
            </View>
            <View className="overflow-hidden rounded-2xl bg-card">
              {t.checklist.map((item, i) => (
                <Pressable
                  key={item.id}
                  onPress={() => toggleChecklistItem(board.id, t.id, item.id)}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: item.done }}
                  accessibilityLabel={item.text}
                  className={`flex-row items-center gap-3 px-3.5 py-3 ${i > 0 ? 'border-t border-border' : ''}`}
                >
                  <SFIcon
                    name={item.done ? 'checkmark.circle.fill' : 'circle'}
                    size={20}
                    color={item.done ? '#007aff' : '#c7c7cc'}
                  />
                  <Text
                    className={`flex-1 text-[15px] ${item.done ? 'text-muted line-through' : 'text-ink'}`}
                  >
                    {item.text}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        <View className="gap-2 px-4 pt-5">
          <Text className="text-[13px] font-semibold uppercase tracking-wide text-muted">
            Move to
          </Text>
          <View className="overflow-hidden rounded-2xl bg-card">
            {board.columns
              .filter((col) => col.id !== c.id)
              .map((col, i) => (
                <Pressable
                  key={col.id}
                  onPress={() => {
                    moveTask(board.id, t.id, col.id);
                    router.back();
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={`Move to ${col.name}`}
                  className={`flex-row items-center justify-between px-3.5 py-3 ${i > 0 ? 'border-t border-border' : ''}`}
                >
                  <Text className="text-[15px] text-ink">{col.name}</Text>
                  <SFIcon name="arrow.right" size={14} color="#007aff" />
                </Pressable>
              ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
