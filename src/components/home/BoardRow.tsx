import { Pressable, Text, View } from "react-native";

import { shadow } from "@/components/board-shadows";
import { ProgressBar, SFIcon } from "@/components/board-ui";
import { BOARD_COLORS, type Board } from "@/lib/board-types";

interface BoardRowProps {
  board: Board;
  onPress: () => void;
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

export function BoardRow({ board, onPress }: BoardRowProps) {
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
