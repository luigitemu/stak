import { Pressable, Text, View } from "react-native";

import { BoardRow } from "@/components/home/BoardRow";
import type { Board } from "@/lib/board-types";

interface BoardListSectionProps {
  boards: Board[];
  onOpenBoard: (id: string) => void;
  onSortPress: () => void;
}

export function BoardListSection({
  boards,
  onOpenBoard,
  onSortPress,
}: BoardListSectionProps) {
  return (
    <View>
      <View className="mb-3 flex-row items-center justify-between">
        <Text className="text-[13px] font-semibold uppercase tracking-wide text-muted">
          All Boards
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Sort boards"
          onPress={onSortPress}
          className="h-10 w-10 items-center justify-center rounded-xl"
        >
          <Text className="text-[15px] font-medium text-primary">Sort</Text>
        </Pressable>
      </View>
      <View className="gap-3">
        {boards.map((b) => (
          <BoardRow key={b.id} board={b} onPress={() => onOpenBoard(b.id)} />
        ))}
      </View>
    </View>
  );
}
