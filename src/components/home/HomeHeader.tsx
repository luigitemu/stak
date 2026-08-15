import { Image } from "expo-image";
import { Pressable, Text, TextInput, View } from "react-native";

import { SFIcon } from "@/components/board-ui";

interface HomeHeaderProps {
  query: string;
  setQuery: (query: string) => void;
}

export function HomeHeader({ query, setQuery }: HomeHeaderProps) {
  return (
    <>
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
            value={query}
            onChangeText={setQuery}
            placeholder="Search boards..."
            placeholderTextColor="#8e8e93"
            accessibilityLabel="Search boards"
            className="flex-1 text-[16px] text-ink"
          />
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Filter boards"
          className="h-12 w-12 items-center justify-center rounded-xl bg-secondary active:opacity-80"
        >
          <SFIcon name="slider.horizontal.3" size={18} color="#007aff" />
        </Pressable>
      </View>
    </>
  );
}
