import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";

import { Avatar, SFIcon } from "@/components/board-ui";
import { TEAM } from "@/lib/board-fixtures";

export function BoardDetailHeader({ title }: { title: string }) {
  return (
    <View className="flex-row items-center gap-2 px-4 pb-3 pt-1">
      <Pressable
        onPress={() => router.back()}
        hitSlop={12}
        accessibilityRole="button"
        accessibilityLabel="Back to boards"
        className="flex-row items-center"
      >
        <SFIcon name="chevron.left" size={20} color="#007aff" />
      </Pressable>
      <Text className="flex-1 text-[22px] font-bold text-ink" numberOfLines={1}>
        {title}
      </Text>
      <View className="flex-row items-center gap-8 ">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Search tasks"
          hitSlop={10}
        >
          <SFIcon name="magnifyingglass" size={20} color="#007aff" />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Board options"
          hitSlop={10}
        >
          <SFIcon name="ellipsis.circle" size={22} color="#007aff" />
        </Pressable>
      </View>
    </View>
  );
}

export function BoardDetailToolbar({
  onAddColumn,
}: {
  onAddColumn: () => void;
}) {
  return (
    <View className="flex-row items-center gap-2 px-4 pb-3">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Filter tasks"
        className="flex-row items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5"
      >
        <SFIcon
          name="line.3.horizontal.decrease.circle"
          size={15}
          color="#000000"
        />
        <Text className="text-[14px] font-medium text-ink">Filter</Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Sort tasks"
        className="flex-row items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5"
      >
        <SFIcon name="arrow.up.arrow.down" size={14} color="#000000" />
        <Text className="text-[14px] font-medium text-ink">Sort</Text>
      </Pressable>
      <View className="mx-1 h-5 w-px bg-border" />
      <View className="flex-1 flex-row items-center">
        {TEAM.slice(0, 2).map((m, i) => (
          <View
            key={m.id}
            style={{ marginLeft: i === 0 ? 0 : -8 }}
            className="rounded-full border-2 border-bg"
          >
            <Avatar uri={m.avatarUrl} size={28} />
          </View>
        ))}
        {TEAM.length > 2 && (
          <View className="-ml-2 h-7 w-7 items-center justify-center rounded-full border-2 border-bg bg-secondary">
            <Text className="text-[11px] font-semibold text-muted">
              +{TEAM.length - 2}
            </Text>
          </View>
        )}
      </View>
      <Pressable
        onPress={onAddColumn}
        accessibilityRole="button"
        accessibilityLabel="Add column"
        hitSlop={10}
      >
        <SFIcon name="plus.circle.fill" size={22} color="#007aff" />
      </Pressable>
    </View>
  );
}
