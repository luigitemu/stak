import { Pressable, Text, View } from "react-native";
import { shadow } from "@/components/board-shadows";
import { SFIcon } from "@/components/board-ui";
import { BOARD_COLORS, type Board } from "@/lib/board-types";

function activeTaskCount(board: Board) {
  return board.columns.reduce(
    (n, c) => n + (/done/i.test(c.name) ? 0 : c.tasks.length),
    0
  );
}

export function PinnedCard({
  board,
  onPress,
}: {
  board: Board;
  onPress: () => void;
}) {
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
