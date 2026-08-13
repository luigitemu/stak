import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { SFIcon } from "@/components/board-ui";

export default function AlertsScreen() {
  return (
    <View className="flex-1 bg-bg">
      <SafeAreaView className="flex-1" edges={["top"]}>
        <View className="px-4 pb-2 pt-2">
          <Text className="text-[34px] font-bold text-ink">Alerts</Text>
        </View>
        <View className="flex-1 items-center justify-center gap-3 px-8">
          <SFIcon name="bell.slash" size={36} color="#c7c7cc" />
          <Text className="text-center text-[15px] text-muted">
            No alerts yet. You&apos;ll see mentions and due-date reminders here.
          </Text>
        </View>
      </SafeAreaView>
    </View>
  );
}
