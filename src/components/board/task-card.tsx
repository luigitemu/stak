import { Pressable, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  measure,
  runOnJS,
  useAnimatedRef,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";

import { useBoardDrag } from "@/components/board/board-drag-context";
import { shadow } from "@/components/board-shadows";
import { Avatar, LabelPill, SFIcon } from "@/components/board-ui";
import { resolveDrop, upsertTaskLayout } from "@/lib/board-drag";
import { TEAM } from "@/lib/board-fixtures";
import { TODAY, fmt, type Task } from "@/lib/board-types";

export function TaskCardContent({
  task,
  overdue,
}: {
  task: Task;
  overdue: boolean;
}) {
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

export function TaskCard({
  task,
  dimmed,
  columnId,
  onPress,
}: {
  task: Task;
  dimmed: boolean;
  columnId: string;
  onPress: () => void;
}) {
  const { metrics, activeDrag, actions } = useBoardDrag();
  const isDragging = activeDrag?.taskId === task.id;
  const overdue = !dimmed && !!task.due && task.due < TODAY;

  const cardRef = useAnimatedRef<Animated.View>();
  const baseX = useSharedValue(0);
  const baseY = useSharedValue(0);

  const pan = Gesture.Pan()
    .activateAfterLongPress(150)
    .onStart(() => {
      const card = measure(cardRef);
      const board = measure(metrics.scrollRef);
      if (!card || !board) {
        return;
      }
      baseX.value = card.pageX - board.pageX;
      baseY.value = card.pageY - board.pageY;
      metrics.overlayX.value = baseX.value;
      metrics.overlayY.value = baseY.value;
      metrics.overlayW.value = card.width;
      metrics.overlayH.value = card.height;
      runOnJS(actions.start)(task);
    })
    .onUpdate((e) => {
      metrics.overlayX.value = baseX.value + e.translationX;
      metrics.overlayY.value = baseY.value + e.translationY;
    })
    .onEnd(() => {
      const target = resolveDrop({
        overlay: {
          x: metrics.overlayX.value,
          y: metrics.overlayY.value,
          width: metrics.overlayW.value,
          height: metrics.overlayH.value,
        },
        scrollX: metrics.scrollX.value,
        columns: metrics.columnLayouts.value,
        tasksByColumn: metrics.taskLayouts.value,
        columnScrollY: metrics.columnScrollY.value,
        columnHeaderY: metrics.columnHeaderY.value,
        draggedTaskId: task.id,
      });

      if (!target) {
        runOnJS(actions.cancel)(task.id);
        return;
      }
      runOnJS(actions.drop)(task.id, target.columnId, target.index);
    })
    .onFinalize(() => {
      runOnJS(actions.cancel)(task.id);
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
          metrics.taskLayouts.value = upsertTaskLayout(
            metrics.taskLayouts.value,
            columnId,
            { id: task.id, y, height }
          );
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
