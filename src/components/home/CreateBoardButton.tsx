import { Pressable, Text } from "react-native";

import { shadow } from "@/components/board-shadows";
import { SFIcon } from "@/components/board-ui";

export function CreateBoardButton() {
  return (
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
  );
}
