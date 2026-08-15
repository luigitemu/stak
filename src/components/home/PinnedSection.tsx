import { ScrollView, Text, View } from "react-native";

import { PinnedCard } from "@/components/home/PinnedCard";
import type { Board } from "@/lib/board-types";

interface PinnedSectionProps {
  boards: Board[];
  onOpenBoard: (id: string) => void;
}

export function PinnedSection({ boards, onOpenBoard }: PinnedSectionProps) {
  if (boards.length === 0) return null;

  return (
    <View className="mb-6">
      <Text className="mb-2.5 text-[13px] font-semibold uppercase tracking-wide text-muted">
        Pinned
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View className="flex-row gap-3">
          {boards.map((b) => (
            <PinnedCard
              key={b.id}
              board={b}
              onPress={() => onOpenBoard(b.id)}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
