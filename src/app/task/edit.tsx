import {
  FieldGroup,
  Host,
  Picker,
  Row,
  Spacer,
  TextInput,
  Text as UIText,
} from "@expo/ui";
import { DateTimePicker } from "@expo/ui/community/datetime-picker";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

import { useBoard } from "@/lib/board-context";
import { blankDraft, TEAM } from "@/lib/board-fixtures";
import type { Found } from "@/lib/board-ops";
import { PRIORITIES, type Column, type Draft } from "@/lib/board-types";
import { firstParam } from "@/lib/params";

function draftFromExisting(existing: Found): Draft {
  return {
    id: existing.t.id,
    title: existing.t.title,
    notes: existing.t.notes,
    due: existing.t.due,
    priority: existing.t.priority,
    labels: existing.t.labels.join(", "),
    assignee: existing.t.assignee,
    board: existing.board.id,
    col: existing.c.id,
  };
}

function TaskEditForm({
  draft,
  columns,
  onChange,
}: {
  draft: Draft;
  columns: Column[];
  onChange: (patch: Partial<Draft>) => void;
}) {
  return (
    <Host style={{ flex: 1, width: "100%" }}>
      <FieldGroup>
        <FieldGroup.Section title="Task">
          <TextInput
            defaultValue={draft.title}
            onChangeText={(v) => onChange({ title: v })}
            placeholder="What needs doing?"
          />
          <TextInput
            defaultValue={draft.notes}
            onChangeText={(v) => onChange({ notes: v })}
            placeholder="Description, links, acceptance criteria"
            multiline
            numberOfLines={3}
          />
          <Row>
            <UIText>Due</UIText>
            <Spacer flexible />
            <DateTimePicker
              value={draft.due ? new Date(draft.due) : new Date()}
              onValueChange={(_, date) =>
                onChange({ due: date.toISOString().slice(0, 10) })
              }
              mode="date"
              display="compact"
              style={{ alignSelf: "flex-end" }}
            />
          </Row>
        </FieldGroup.Section>
        <FieldGroup.Section title="Assignment">
          <Row>
            <UIText>Assignee</UIText>
            <Spacer flexible />
            <Picker
              selectedValue={draft.assignee}
              onValueChange={(v) => onChange({ assignee: v })}
            >
              {TEAM.map((m) => (
                <Picker.Item key={m.id} label={m.name} value={m.id} />
              ))}
            </Picker>
          </Row>
          <Row>
            <UIText>Priority</UIText>
            <Spacer flexible />
            <Picker
              selectedValue={draft.priority}
              onValueChange={(v) => onChange({ priority: v })}
            >
              {PRIORITIES.map((p) => (
                <Picker.Item key={p} label={p} value={p} />
              ))}
            </Picker>
          </Row>
          <Row>
            <UIText>Column</UIText>
            <Spacer flexible />
            <Picker
              selectedValue={draft.col}
              onValueChange={(v) => onChange({ col: v })}
            >
              {columns.map((c) => (
                <Picker.Item key={c.id} label={c.name} value={c.id} />
              ))}
            </Picker>
          </Row>
        </FieldGroup.Section>
        <FieldGroup.Section title="Labels">
          <TextInput
            defaultValue={draft.labels}
            onChangeText={(v) => onChange({ labels: v })}
            placeholder="Design, Dev, Marketing"
          />
        </FieldGroup.Section>
      </FieldGroup>
    </Host>
  );
}

export default function TaskEditSheet() {
  const params = useLocalSearchParams<{
    id?: string;
    board: string;
    col?: string;
  }>();
  const id = firstParam(params.id);
  const boardId = firstParam(params.board);
  const col = firstParam(params.col);
  const { findBoard, find, saveTask } = useBoard();
  const board = findBoard(boardId);
  const existing = find(boardId, id);

  const [draft, setDraft] = useState<Draft>(() =>
    existing
      ? draftFromExisting(existing)
      : blankDraft(boardId!, col ?? board?.columns[0]?.id ?? "")
  );

  if (!board) return null;

  return (
    <View className="flex-1 bg-sheet">
      <Stack.Screen
        options={{
          title: draft.id ? "Edit task" : "New task",
          headerLeft: () => (
            <Pressable
              onPress={() => router.back()}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel="Cancel"
              className="px-4"
            >
              <Text className="text-[16px] text-primary">Cancel</Text>
            </Pressable>
          ),
          headerRight: () => (
            <Pressable
              onPress={() => {
                saveTask(draft);
                router.back();
              }}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel="Save task"
              className="px-2"
            >
              <Text className="font-bold text-[16px] text-primary">Save</Text>
            </Pressable>
          ),
        }}
      />
      <TaskEditForm
        draft={draft}
        columns={board.columns}
        onChange={(patch) => setDraft((d) => ({ ...d, ...patch }))}
      />
    </View>
  );
}
