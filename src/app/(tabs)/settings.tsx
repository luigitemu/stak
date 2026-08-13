import { Host, Switch } from "@expo/ui";
import { Image } from "expo-image";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { SFIcon, shadow } from "@/components/board-ui";

type Row = {
  key: string;
  label: string;
  icon: string;
  color: string;
};

const ACCOUNT_ROWS: Row[] = [
  {
    key: "personal",
    label: "Personal Information",
    icon: "person.crop.circle",
    color: "#007aff",
  },
  {
    key: "security",
    label: "Security & Password",
    icon: "lock.fill",
    color: "#8e8e93",
  },
];

const SUPPORT_ROWS: Row[] = [
  {
    key: "help",
    label: "Help Center",
    icon: "questionmark.circle",
    color: "#5ac8fa",
  },
  {
    key: "about",
    label: "About Kanban",
    icon: "info.circle",
    color: "#5856d6",
  },
];

function IconBadge({ name, color }: { name: string; color: string }) {
  return (
    <View
      className="h-8 w-8 items-center justify-center rounded-lg"
      style={{ backgroundColor: `${color}1a` }}
    >
      <SFIcon name={name as never} size={16} color={color} />
    </View>
  );
}

function SettingsList({ rows }: { rows: Row[] }) {
  return (
    <View className="overflow-hidden rounded-2xl bg-card" style={shadow.card}>
      {rows.map((row, i) => (
        <View
          key={row.key}
          className={`flex-row items-center gap-3 px-3.5 py-3 ${i > 0 ? "border-t border-border" : ""}`}
        >
          <IconBadge name={row.icon} color={row.color} />
          <Text className="flex-1 text-[16px] text-ink">{row.label}</Text>
          <SFIcon name="chevron.right" size={13} color="#c7c7cc" />
        </View>
      ))}
    </View>
  );
}

export default function SettingsScreen() {
  const [notifications, setNotifications] = useState(true);

  return (
    <View className="flex-1 bg-bg">
      <SafeAreaView className="flex-1" edges={["top"]}>
        <View className="px-4 pb-2 pt-2">
          <Text className="text-[34px] font-bold text-ink">Settings</Text>
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingBottom: 32,
            gap: 24,
          }}
        >
          <View
            className="flex-row items-center gap-3.5 rounded-2xl bg-card p-4"
            style={shadow.card}
          >
            <Image
              source={{ uri: "https://i.pravatar.cc/150?img=68" }}
              style={{ width: 56, height: 56, borderRadius: 28 }}
              accessibilityLabel="Your profile photo"
            />
            <View className="min-w-0 flex-1">
              <Text className="text-[17px] font-bold text-ink">
                Luis Tejada
              </Text>
              <Text className="text-[13px] text-muted">
                softeng11@pulmonary-institute.com
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Edit profile"
              hitSlop={10}
            >
              <SFIcon name="pencil" size={18} color="#007aff" />
            </Pressable>
          </View>

          <View>
            <Text className="mb-2 pl-1 text-[13px] font-semibold uppercase tracking-wide text-muted">
              Account
            </Text>
            <SettingsList rows={ACCOUNT_ROWS} />
          </View>

          <View>
            <Text className="mb-2 pl-1 text-[13px] font-semibold uppercase tracking-wide text-muted">
              Preferences
            </Text>
            <View
              className="overflow-hidden rounded-2xl bg-card"
              style={shadow.card}
            >
              <View className="flex-row items-center gap-3 px-3.5 py-3">
                <IconBadge name="bell.fill" color="#ff9500" />
                <Text className="flex-1 text-[16px] text-ink">
                  Notifications
                </Text>
                <Host style={{ width: 51, height: 31 }}>
                  <Switch
                    value={notifications}
                    onValueChange={setNotifications}
                  />
                </Host>
              </View>
              <View className="flex-row items-center gap-3 border-t border-border px-3.5 py-3">
                <IconBadge name="paintpalette.fill" color="#5856d6" />
                <Text className="flex-1 text-[16px] text-ink">Appearance</Text>
                <Text className="text-[15px] text-muted">Light</Text>
                <SFIcon name="chevron.right" size={13} color="#c7c7cc" />
              </View>
              <View className="flex-row items-center gap-3 border-t border-border px-3.5 py-3">
                <IconBadge name="square.grid.2x2.fill" color="#34c759" />
                <Text className="flex-1 text-[16px] text-ink">
                  Default Board
                </Text>
                <SFIcon name="chevron.right" size={13} color="#c7c7cc" />
              </View>
            </View>
          </View>

          <View>
            <Text className="mb-2 pl-1 text-[13px] font-semibold uppercase tracking-wide text-muted">
              Support
            </Text>
            <SettingsList rows={SUPPORT_ROWS} />
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Log out"
            className="items-center rounded-2xl bg-card p-4"
            style={shadow.card}
          >
            <Text className="text-[16px] font-semibold text-destructive">
              Log Out
            </Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
