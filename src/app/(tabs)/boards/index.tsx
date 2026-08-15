import { router } from "expo-router";
import { useState } from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BoardListSection } from "@/components/home/BoardListSection";
import { CreateBoardButton } from "@/components/home/CreateBoardButton";
import { HomeHeader } from "@/components/home/HomeHeader";
import { PinnedSection } from "@/components/home/PinnedSection";
import { useBoard } from "@/lib/board-context";

export default function BoardsScreen() {
  const { boards } = useBoard();
  const [q, setQ] = useState("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const query = q.trim().toLowerCase();
  const filtered = query
    ? boards.filter((b) => b.name.toLowerCase().includes(query))
    : boards;

  const pinned = filtered.filter((b) => b.pinned);
  const rest = filtered.filter((b) => !b.pinned);

  const sortSign = sortDirection === "asc" ? 1 : -1;
  const sortedRest = [...rest].sort(
    (a, b) => sortSign * a.name.localeCompare(b.name)
  );

  const openBoard = (id: string) =>
    router.push({ pathname: "/boards/[id]", params: { id } });

  const toggleSort = () =>
    setSortDirection((d) => (d === "asc" ? "desc" : "asc"));

  return (
    <View className="flex-1 bg-bg">
      <SafeAreaView className="flex-1" edges={["top"]}>
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
        >
          <HomeHeader query={q} setQuery={setQ} />
          <PinnedSection boards={pinned} onOpenBoard={openBoard} />
          <BoardListSection
            boards={sortedRest}
            onOpenBoard={openBoard}
            onSortPress={toggleSort}
          />
          <CreateBoardButton />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
