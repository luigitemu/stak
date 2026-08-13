import { Host, Icon } from "@expo/ui";
import type { SFSymbol } from "sf-symbols-typescript";
import { Image } from "expo-image";
import { Text, View } from "react-native";

import { labelColor } from "@/lib/board-types";

export function SFIcon({
  name,
  size = 18,
  color = "#000000",
}: {
  name: SFSymbol;
  size?: number;
  color?: string;
}) {
  return (
    <Host style={{ width: size, height: size }}>
      <Icon name={name} size={size} color={color} />
    </Host>
  );
}

export function LabelPill({ label }: { label: string }) {
  const c = labelColor(label);
  return (
    <View
      className="rounded-full px-2 py-0.5"
      style={{ backgroundColor: c.bg }}
    >
      <Text className="text-[10px] font-bold uppercase" style={{ color: c.fg }}>
        {label}
      </Text>
    </View>
  );
}

export function Avatar({ uri, size = 24 }: { uri: string; size?: number }) {
  return (
    <Image
      source={{ uri }}
      style={{ width: size, height: size, borderRadius: size / 2 }}
      accessibilityIgnoresInvertColors
    />
  );
}

export function ProgressBar({
  value,
  color = "#007aff",
  width = 48,
}: {
  value: number;
  color?: string;
  width?: number;
}) {
  return (
    <View
      className="h-1.5 overflow-hidden rounded-full bg-secondary"
      style={{ width }}
    >
      <View
        className="h-full rounded-full"
        style={{ width: `${Math.round(value * 100)}%`, backgroundColor: color }}
      />
    </View>
  );
}
