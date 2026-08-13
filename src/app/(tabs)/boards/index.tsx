import { Image } from "expo-image";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ProgressBar, SFIcon, shadow } from "@/components/board-ui";
import { useBoard } from "@/lib/board-context";
import { BOARD_COLORS, type Board } from "@/lib/board-types";

function activeTaskCount(board: Board) {
  return board.columns.reduce(
    (n, c) => n + (/done/i.test(c.name) ? 0 : c.tasks.length),
    0,
  );
}

function boardProgress(board: Board) {
  let total = 0;
  let done = 0;
  for (const c of board.columns) {
    total += c.tasks.length;
    if (/done/i.test(c.name)) done += c.tasks.length;
  }
  return total === 0 ? 0 : done / total;
}

function PinnedCard({ board, onPress }: { board: Board; onPress: () => void }) {
  const c = BOARD_COLORS[board.color];
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={board.name}
      className="w-[150px] rounded-2xl bg-card p-4"
      style={shadow.card}
    >
      <View className="mb-3 flex-row items-center justify-between">
        <View
          className="h-8 w-8 items-center justify-center rounded-full"
          style={{ backgroundColor: c.bg }}
        >
          <SFIcon name={board.icon as never} size={16} color={c.fg} />
        </View>
        <SFIcon name="star.fill" size={16} color={c.fg} />
      </View>
      <Text className="mb-1 text-[17px] font-semibold text-ink">
        {board.name}
      </Text>
      <Text className="text-[13px] text-muted">
        {activeTaskCount(board)} active tasks
      </Text>
    </Pressable>
  );
}

function BoardRow({ board, onPress }: { board: Board; onPress: () => void }) {
  const c = BOARD_COLORS[board.color];
  const total = board.columns.reduce((n, col) => n + col.tasks.length, 0);
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={board.name}
      className="flex-row items-center rounded-2xl bg-card p-4"
      style={shadow.card}
    >
      <View
        className="mr-4 h-10 w-10 items-center justify-center rounded-xl"
        style={{ backgroundColor: c.bg }}
      >
        <SFIcon name={board.icon as never} size={20} color={c.fg} />
      </View>
      <View className="min-w-0 flex-1">
        <Text className="text-[17px] font-semibold text-ink" numberOfLines={1}>
          {board.name}
        </Text>
        <Text className="mt-0.5 text-[13px] text-muted">
          {board.updatedLabel} · {total} tasks
        </Text>
      </View>
      <ProgressBar value={boardProgress(board)} color={c.fg} />
    </Pressable>
  );
}

export default function BoardsScreen() {
  const { boards } = useBoard();
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return boards;
    return boards.filter((b) => b.name.toLowerCase().includes(query));
  }, [boards, q]);

  const pinned = filtered.filter((b) => b.pinned);
  const rest = filtered.filter((b) => !b.pinned);

  const openBoard = (id: string) =>
    router.push({ pathname: "/boards/[id]", params: { id } });

  return (
    <View className="flex-1 bg-bg">
      <SafeAreaView className="flex-1" edges={["top"]}>
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
        >
          <View className="flex-row items-center justify-between pb-4 pt-2">
            <Text className="text-[34px] font-bold text-ink">Boards</Text>
            <Image
              source={{ uri: "https://i.pravatar.cc/150?img=68" }}
              style={{ width: 40, height: 40, borderRadius: 20 }}
              accessibilityLabel="Your profile"
            />
          </View>

          <View className="mb-6 flex-row items-center gap-2.5">
            <View className="h-12 flex-1 flex-row items-center gap-2 rounded-xl bg-secondary px-3.5">
              <SFIcon name="magnifyingglass" size={17} color="#8e8e93" />
              <TextInput
                value={q}
                onChangeText={setQ}
                placeholder="Search boards..."
                placeholderTextColor="#8e8e93"
                accessibilityLabel="Search boards"
                className="flex-1 text-[16px] text-ink"
              />
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Filter boards"
              className="h-12 w-12 items-center justify-center rounded-xl bg-secondary"
            >
              <SFIcon name="slider.horizontal.3" size={18} color="#007aff" />
            </Pressable>
          </View>

          {pinned.length > 0 && (
            <View className="mb-6">
              <Text className="mb-2.5 text-[13px] font-semibold uppercase tracking-wide text-muted">
                Pinned
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="flex-row gap-3">
                  {pinned.map((b) => (
                    <PinnedCard
                      key={b.id}
                      board={b}
                      onPress={() => openBoard(b.id)}
                    />
                  ))}
                </View>
              </ScrollView>
            </View>
          )}

          <View className="mb-3 flex-row items-center justify-between">
            <Text className="text-[13px] font-semibold uppercase tracking-wide text-muted">
              All Boards
            </Text>
            <Text className="text-[15px] font-medium text-primary">Sort</Text>
          </View>
          <View className="gap-3">
            {rest.map((b) => (
              <BoardRow key={b.id} board={b} onPress={() => openBoard(b.id)} />
            ))}
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Create new board"
            className="mt-4 flex-row items-center justify-center gap-2 rounded-2xl bg-card p-4"
            style={shadow.card}
          >
            <SFIcon name="plus" size={17} color="#007aff" />
            <Text className="text-[16px] font-semibold text-primary">
              Create New Board
            </Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
