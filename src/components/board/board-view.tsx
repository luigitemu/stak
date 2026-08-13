import { useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  measure,
  runOnJS,
  useAnimatedRef,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  type SharedValue,
} from "react-native-reanimated";

import { shadow } from "@/components/board-shadows";
import { Avatar, LabelPill, SFIcon } from "@/components/board-ui";
import type { FilteredColumn, Task } from "@/lib/board-types";
import { TEAM, TODAY, fmt } from "@/lib/board-types";

type ColumnLayout = { id: string; x: number; width: number };
type TaskLayout = { id: string; y: number; height: number };
type ActiveDrag = { taskId: string; task: Task } | null;

function TaskCardContent({ task, overdue }: { task: Task; overdue: boolean }) {
  const assignee = TEAM.find((m) => m.id === task.assignee);
  return (
    <>
      <View className="flex-row flex-wrap gap-1.5">
        {task.labels.map((label) => (
          <LabelPill key={label} label={label} />
        ))}
      </View>
      <Text className="text-[14px] font-semibold leading-[18px] text-ink">
        {task.title}
      </Text>
      <View className="min-h-[22px] flex-row items-center justify-between">
        <View className="flex-row items-center gap-1">
          <SFIcon
            name="calendar"
            size={12}
            color={overdue ? "#ff3b30" : "#8e8e93"}
          />
          <Text
            className={`text-[12px] font-medium ${overdue ? "text-destructive" : "text-muted"}`}
          >
            {fmt(task.due)}
          </Text>
        </View>
        {assignee && <Avatar uri={assignee.avatarUrl} size={22} />}
      </View>
    </>
  );
}

function TaskCard({
  task,
  dimmed,
  columnId,
  isDragging,
  onPress,
  onDragStart,
  onDrop,
  onDragCancel,
  scrollX,
  columnLayouts,
  taskLayouts,
  columnScrollY,
  columnHeaderY,
  scrollRef,
  overlayX,
  overlayY,
  overlayW,
  overlayH,
}: {
  task: Task;
  dimmed: boolean;
  columnId: string;
  isDragging: boolean;
  onPress: () => void;
  onDragStart: (task: Task) => void;
  onDrop: (taskId: string, colId: string, index: number) => void;
  onDragCancel: (taskId: string) => void;
  scrollX: SharedValue<number>;
  columnLayouts: SharedValue<ColumnLayout[]>;
  taskLayouts: SharedValue<Record<string, TaskLayout[]>>;
  columnScrollY: SharedValue<Record<string, number>>;
  columnHeaderY: SharedValue<Record<string, number>>;
  scrollRef: ReturnType<typeof useAnimatedRef<Animated.ScrollView>>;
  overlayX: SharedValue<number>;
  overlayY: SharedValue<number>;
  overlayW: SharedValue<number>;
  overlayH: SharedValue<number>;
}) {
  const overdue = !dimmed && !!task.due && task.due < TODAY;
  const cardRef = useAnimatedRef<Animated.View>();
  const baseX = useSharedValue(0);
  const baseY = useSharedValue(0);

  const pan = Gesture.Pan()
    .activateAfterLongPress(150)
    .onStart(() => {
      const card = measure(cardRef);
      const board = measure(scrollRef);
      if (card && board) {
        baseX.value = card.pageX - board.pageX;
        baseY.value = card.pageY - board.pageY;
        overlayX.value = baseX.value;
        overlayY.value = baseY.value;
        overlayW.value = card.width;
        overlayH.value = card.height;
        runOnJS(onDragStart)(task);
      }
    })
    .onUpdate((e) => {
      overlayX.value = baseX.value + e.translationX;
      overlayY.value = baseY.value + e.translationY;
    })
    .onEnd(() => {
      const target = columnLayouts.value.find((c) => {
        const dropX = overlayX.value + overlayW.value / 2 + scrollX.value;
        return dropX >= c.x && dropX <= c.x + c.width;
      });
      if (!target) {
        runOnJS(onDragCancel)(task.id);
        return;
      }
      const headerY = columnHeaderY.value[target.id] ?? 0;
      const colScrollY = columnScrollY.value[target.id] ?? 0;
      const dropYContent =
        overlayY.value + overlayH.value / 2 - headerY + colScrollY;
      const rows = (taskLayouts.value[target.id] ?? [])
        .filter((r) => r.id !== task.id)
        .sort((a, b) => a.y - b.y);
      let insertIndex = rows.length;
      for (let i = 0; i < rows.length; i++) {
        if (dropYContent < rows[i].y + rows[i].height / 2) {
          insertIndex = i;
          break;
        }
      }
      runOnJS(onDrop)(task.id, target.id, insertIndex);
    })
    .onFinalize(() => {
      runOnJS(onDragCancel)(task.id);
    });

  const style = useAnimatedStyle(() => ({
    opacity: isDragging ? 0 : dimmed ? 0.6 : 1,
  }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View
        ref={cardRef}
        style={style}
        onLayout={(e) => {
          const { y, height } = e.nativeEvent.layout;
          const rows = (taskLayouts.value[columnId] ?? []).filter(
            (r) => r.id !== task.id
          );
          taskLayouts.value = {
            ...taskLayouts.value,
            [columnId]: [...rows, { id: task.id, y, height }],
          };
        }}
      >
        <Pressable
          onPress={onPress}
          accessibilityRole="button"
          accessibilityLabel={task.title}
          className="gap-2 rounded-xl bg-card p-3"
          style={shadow.card}
        >
          <TaskCardContent task={task} overdue={overdue} />
        </Pressable>
      </Animated.View>
    </GestureDetector>
  );
}

function BoardColumn({
  column,
  onRename,
  onSelectTask,
  onAddTask,
  activeTaskId,
  onDragStart,
  onDropTask,
  onDragCancel,
  scrollX,
  columnLayouts,
  taskLayouts,
  columnScrollY,
  columnHeaderY,
  scrollRef,
  overlayX,
  overlayY,
  overlayW,
  overlayH,
}: {
  column: FilteredColumn;
  onRename: (name: string) => void;
  onSelectTask: (id: string) => void;
  onAddTask: () => void;
  activeTaskId: string | null;
  onDragStart: (task: Task) => void;
  onDropTask: (taskId: string, colId: string, index: number) => void;
  onDragCancel: (taskId: string) => void;
  scrollX: SharedValue<number>;
  columnLayouts: SharedValue<ColumnLayout[]>;
  taskLayouts: SharedValue<Record<string, TaskLayout[]>>;
  columnScrollY: SharedValue<Record<string, number>>;
  columnHeaderY: SharedValue<Record<string, number>>;
  scrollRef: ReturnType<typeof useAnimatedRef<Animated.ScrollView>>;
  overlayX: SharedValue<number>;
  overlayY: SharedValue<number>;
  overlayW: SharedValue<number>;
  overlayH: SharedValue<number>;
}) {
  const listScrollHandler = useAnimatedScrollHandler((e) => {
    columnScrollY.value = {
      ...columnScrollY.value,
      [column.id]: e.contentOffset.y,
    };
  });

  return (
    <View
      className="w-[260px]"
      style={{ maxHeight: "100%" }}
      onLayout={(e) => {
        const { x, width } = e.nativeEvent.layout;
        columnLayouts.value = [
          ...columnLayouts.value.filter((c) => c.id !== column.id),
          { id: column.id, x, width },
        ];
      }}
    >
      <View className="flex-row items-center gap-2 px-1 pb-2.5">
        <View className="h-5 min-w-5 items-center justify-center rounded-full bg-secondary px-1.5">
          <Text className="text-[11px] font-bold text-muted">
            {column.tasks.length}
          </Text>
        </View>
        <TextInput
          value={column.name}
          onChangeText={onRename}
          accessibilityLabel="Column name"
          className="flex-1 text-[13px] font-bold uppercase tracking-wide text-muted"
        />
        <Pressable
          onPress={onAddTask}
          accessibilityRole="button"
          accessibilityLabel={`Add task to ${column.name}`}
          hitSlop={8}
        >
          <SFIcon name="plus" size={16} color="#007aff" />
        </Pressable>
      </View>
      <Animated.ScrollView
        onScroll={listScrollHandler}
        scrollEventThrottle={16}
        contentContainerStyle={{ gap: 10, paddingBottom: 8 }}
        onLayout={(e) => {
          columnHeaderY.value = {
            ...columnHeaderY.value,
            [column.id]: e.nativeEvent.layout.y,
          };
        }}
      >
        {column.tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            dimmed={column.done}
            columnId={column.id}
            isDragging={activeTaskId === task.id}
            onPress={() => onSelectTask(task.id)}
            onDragStart={onDragStart}
            onDrop={onDropTask}
            onDragCancel={onDragCancel}
            scrollX={scrollX}
            columnLayouts={columnLayouts}
            taskLayouts={taskLayouts}
            columnScrollY={columnScrollY}
            columnHeaderY={columnHeaderY}
            scrollRef={scrollRef}
            overlayX={overlayX}
            overlayY={overlayY}
            overlayW={overlayW}
            overlayH={overlayH}
          />
        ))}
        {column.tasks.length === 0 && (
          <Text className="px-1 py-1.5 text-[12px] text-muted">No tasks</Text>
        )}
      </Animated.ScrollView>
    </View>
  );
}

export function BoardView({
  columns,
  onRenameColumn,
  onAddColumn,
  onSelectTask,
  onAddTask,
  onMoveTask,
}: {
  columns: FilteredColumn[];
  onRenameColumn: (colId: string, name: string) => void;
  onAddColumn: () => void;
  onSelectTask: (id: string) => void;
  onAddTask: (colId: string) => void;
  onMoveTask: (taskId: string, colId: string, index: number) => void;
}) {
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollX = useSharedValue(0);
  const columnLayouts = useSharedValue<ColumnLayout[]>([]);
  const taskLayouts = useSharedValue<Record<string, TaskLayout[]>>({});
  const columnScrollY = useSharedValue<Record<string, number>>({});
  const columnHeaderY = useSharedValue<Record<string, number>>({});
  const overlayX = useSharedValue(0);
  const overlayY = useSharedValue(0);
  const overlayW = useSharedValue(0);
  const overlayH = useSharedValue(0);

  const [activeDrag, setActiveDrag] = useState<ActiveDrag>(null);

  const scrollHandler = useAnimatedScrollHandler((e) => {
    scrollX.value = e.contentOffset.x;
  });

  const handleDragStart = (task: Task) => {
    setActiveDrag({ taskId: task.id, task });
  };
  const handleDrop = (taskId: string, colId: string, index: number) => {
    onMoveTask(taskId, colId, index);
    setActiveDrag(null);
  };
  const handleDragCancel = (taskId: string) => {
    setActiveDrag((d) => (d && d.taskId === taskId ? null : d));
  };

  const overlayStyle = useAnimatedStyle(() => ({
    position: "absolute",
    left: overlayX.value,
    top: overlayY.value,
    width: overlayW.value,
    height: overlayH.value,
  }));

  return (
    <View className="flex-1">
      <Animated.ScrollView
        ref={scrollRef}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 16, padding: 16 }}
        className="flex-1"
      >
        {columns.map((column) => (
          <BoardColumn
            key={column.id}
            column={column}
            onRename={(name) => onRenameColumn(column.id, name)}
            onSelectTask={onSelectTask}
            onAddTask={() => onAddTask(column.id)}
            activeTaskId={activeDrag?.taskId ?? null}
            onDragStart={handleDragStart}
            onDropTask={handleDrop}
            onDragCancel={handleDragCancel}
            scrollX={scrollX}
            columnLayouts={columnLayouts}
            taskLayouts={taskLayouts}
            columnScrollY={columnScrollY}
            columnHeaderY={columnHeaderY}
            scrollRef={scrollRef}
            overlayX={overlayX}
            overlayY={overlayY}
            overlayW={overlayW}
            overlayH={overlayH}
          />
        ))}
        <Pressable
          onPress={onAddColumn}
          accessibilityRole="button"
          accessibilityLabel="Add column"
          className="w-[120px] items-center justify-center self-stretch rounded-2xl bg-ink/[0.04]"
        >
          <SFIcon name="plus" size={16} color="#8e8e93" />
        </Pressable>
      </Animated.ScrollView>
      {activeDrag && (
        <Animated.View
          pointerEvents="none"
          className="gap-2 rounded-xl bg-card p-3"
          style={[shadow.card, overlayStyle, { opacity: 0.95, zIndex: 1000 }]}
        >
          <TaskCardContent
            task={activeDrag.task}
            overdue={!!activeDrag.task.due && activeDrag.task.due < TODAY}
          />
        </Animated.View>
      )}
    </View>
  );
}
