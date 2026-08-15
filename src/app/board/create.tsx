import { Stack, router } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, TextInput, View } from "react-native";

import { SFIcon } from "@/components/board-ui";
import { useBoard } from "@/lib/board-context";
import { BOARD_COLORS, BOARD_ICONS, type BoardColor } from "@/lib/board-types";

const RED = "#ff3b30";

type IconPickerProps = {
  icon: (typeof BOARD_ICONS)[number];
  onChange: (icon: (typeof BOARD_ICONS)[number]) => void;
};

function IconPicker({ icon, onChange }: IconPickerProps) {
  return (
    <View className="flex-row flex-wrap gap-2  w-full justify-between">
      {BOARD_ICONS.map((option) => {
        const selected = option === icon;
        return (
          <Pressable
            key={option}
            onPress={() => onChange(option)}
            accessibilityRole="button"
            accessibilityLabel={`Icon ${option}`}
            accessibilityState={{ selected }}
            className="h-12 w-12 items-center justify-center rounded-full bg-card"
            style={
              selected ? { borderWidth: 2, borderColor: "#007aff" } : undefined
            }
          >
            <SFIcon
              name={option}
              size={20}
              color={selected ? "#007aff" : "#8e8e93"}
            />
          </Pressable>
        );
      })}
    </View>
  );
}

type ColorPickerProps = {
  color: BoardColor;
  onChange: (color: BoardColor) => void;
};

const COLOR_PICKER_COLUMNS = 7;
const COLOR_PICKER_GAP = 8;
const SELECTION_RING_WIDTH = 2;
const SELECTION_RING_GAP = 3;

function ColorPicker({ color, onChange }: ColorPickerProps) {
  const [rowWidth, setRowWidth] = useState(0);
  const size = rowWidth
    ? (rowWidth - COLOR_PICKER_GAP * (COLOR_PICKER_COLUMNS - 1)) /
      COLOR_PICKER_COLUMNS
    : 48;

  return (
    <View
      onLayout={(e) => setRowWidth(e.nativeEvent.layout.width)}
      className="flex-row flex-wrap"
      style={{ gap: COLOR_PICKER_GAP }}
    >
      {(Object.keys(BOARD_COLORS) as BoardColor[]).map((option) => {
        const selected = option === color;
        const c = BOARD_COLORS[option];
        const fillSize = selected
          ? size - 2 * (SELECTION_RING_WIDTH + SELECTION_RING_GAP)
          : size;
        return (
          <Pressable
            key={option}
            onPress={() => onChange(option)}
            accessibilityRole="button"
            accessibilityLabel={`Color ${option}`}
            accessibilityState={{ selected }}
            className="items-center justify-center rounded-full"
            style={{
              width: size,
              height: size,
              borderWidth: selected ? SELECTION_RING_WIDTH : 0,
              borderColor: "#007aff",
            }}
          >
            <View
              style={{
                width: fillSize,
                height: fillSize,
                borderRadius: fillSize / 2,
                backgroundColor: c.fg,
              }}
            />
          </Pressable>
        );
      })}
    </View>
  );
}

type HeaderButtonProps = {
  onPress: () => void;
  label: string;
  icon: (typeof BOARD_ICONS)[number] | "xmark" | "checkmark";
  color: string;
};

function HeaderButton({ onPress, label, icon, color }: HeaderButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={12}
      accessibilityRole="button"
      accessibilityLabel={label}
      className="h-9 w-9 items-center justify-center rounded-full bg-card"
    >
      <SFIcon name={icon} size={16} color={color} />
    </Pressable>
  );
}

export default function CreateBoardSheet() {
  const { addBoard } = useBoard();
  const [name, setName] = useState("");
  const [icon, setIcon] = useState<(typeof BOARD_ICONS)[number]>(
    BOARD_ICONS[0]
  );
  const [color, setColor] = useState<BoardColor>("orange");

  const trimmedName = name.trim();
  const isValid = trimmedName.length > 0;

  const create = () => {
    if (!isValid) {
      return;
    }
    const id = addBoard(trimmedName, icon, color);
    router.replace({ pathname: "/boards/[id]", params: { id } });
  };

  return (
    <View className="flex-1 bg-sheet">
      <Stack.Screen
        options={{
          title: "New board",
          headerLeft: () => (
            <HeaderButton
              onPress={() => router.back()}
              label="Cancel"
              icon="xmark"
              color="#8e8e93"
            />
          ),
          headerRight: () => (
            <HeaderButton
              onPress={create}
              label="Create board"
              icon="checkmark"
              color="#007aff"
            />
          ),
        }}
      />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{
          paddingBottom: 32,
          gap: 24,
          paddingHorizontal: 16,
          paddingTop: 16,
        }}
      >
        <View className="items-center gap-3 px-4 pt-6 bg-white/55 rounded-2xl p-4">
          <View
            className="h-24 w-24 items-center justify-center rounded-full"
            style={{
              backgroundColor: BOARD_COLORS[color].fg,
              boxShadow: `0 0 10px 0 ${BOARD_COLORS[color].bg}`,
            }}
          >
            <SFIcon name={icon} size={40} color="#ffffff" />
          </View>

          <View className="w-full gap-1">
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Board name"
              placeholderTextColor="#8e8e93"
              autoFocus
              returnKeyType="done"
              onSubmitEditing={create}
              className="w-full rounded-2xl bg-card px-4 py-3 text-center text-[17px] text-label"
            />
          </View>
        </View>

        <View className="gap-2 bg-white/55 rounded-2xl p-4">
          <ColorPicker color={color} onChange={setColor} />
        </View>

        <View className="gap-2 bg-white/55 rounded-2xl p-4">
          <IconPicker icon={icon} onChange={setIcon} />
        </View>
      </ScrollView>
    </View>
  );
}
