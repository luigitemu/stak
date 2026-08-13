import { router, useLocalSearchParams } from "expo-router";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  BoardDetailHeader,
  BoardDetailToolbar,
} from "@/components/board/board-toolbar";
import { BoardView } from "@/components/board/board-view";
import { useBoard } from "@/lib/board-context";
import { firstParam } from "@/lib/params";

export default function BoardDetailScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const id = firstParam(params.id)!;
  const { findBoard, renameColumn, addColumn, moveTask } = useBoard();
  const board = findBoard(id);

  const filtered = board
    ? board.columns.map((c) => ({ ...c, done: /done/i.test(c.name) }))
    : [];

  if (!board) return null;

  const openTask = (taskId: string) =>
    router.push({
      pathname: "/task/[id]",
      params: { id: taskId, board: board.id },
    });

  const addTask = (colId: string) =>
    router.push({
      pathname: "/task/edit",
      params: { board: board.id, col: colId },
    });

  return (
    <View className="flex-1 bg-bg">
      <SafeAreaView className="flex-1">
        <BoardDetailHeader title={board.name} />
        <BoardDetailToolbar onAddColumn={() => addColumn(board.id)} />
        <BoardView
          columns={filtered}
          onRenameColumn={(colId, name) => renameColumn(board.id, colId, name)}
          onAddColumn={() => addColumn(board.id)}
          onSelectTask={openTask}
          onAddTask={addTask}
          onMoveTask={(taskId, colId, index) =>
            moveTask(board.id, taskId, colId, index)
          }
        />
      </SafeAreaView>
    </View>
  );
}
