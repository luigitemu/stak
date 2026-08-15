/**
 * Pure geometry for resolving where a dragged task lands.
 *
 * These run inside a Reanimated gesture callback on the UI thread, hence the
 * 'worklet' directives. They take plain values rather than shared values so the
 * logic stays testable without a gesture runtime.
 */

export type ColumnLayout = { id: string; x: number; width: number };
export type TaskLayout = { id: string; y: number; height: number };

export type DropGeometry = {
  /** Drag overlay position and size, relative to the board scroll viewport. */
  overlay: { x: number; y: number; width: number; height: number };
  /** Horizontal board scroll offset. */
  scrollX: number;
  columns: ColumnLayout[];
  tasksByColumn: Record<string, TaskLayout[]>;
  /** Vertical scroll offset within each column's task list. */
  columnScrollY: Record<string, number>;
  /** Y offset of each column's task list within the column. */
  columnHeaderY: Record<string, number>;
  /** Excluded from insert-index math so a task doesn't displace itself. */
  draggedTaskId: string;
};

export type DropTarget = { columnId: string; index: number };

/** Column under the overlay's horizontal midpoint, in board content space. */
export function findDropColumn(
  columns: ColumnLayout[],
  dropX: number
): ColumnLayout | undefined {
  "worklet";
  return columns.find((c) => dropX >= c.x && dropX <= c.x + c.width);
}

/**
 * Index at which a task dropped at `dropY` should be inserted, by comparing
 * against each row's vertical midpoint. Rows need not be pre-sorted.
 */
export function findInsertIndex(
  rows: TaskLayout[],
  draggedTaskId: string,
  dropY: number
): number {
  "worklet";
  const others = rows
    .filter((r) => r.id !== draggedTaskId)
    .sort((a, b) => a.y - b.y);

  for (let i = 0; i < others.length; i++) {
    if (dropY < others[i].y + others[i].height / 2) {
      return i;
    }
  }
  return others.length;
}

/**
 * Resolves a drag release into a target column and insert index, or null when
 * the overlay was released outside every column.
 */
export function resolveDrop(geometry: DropGeometry): DropTarget | null {
  "worklet";
  const { overlay, scrollX, draggedTaskId } = geometry;

  const dropX = overlay.x + overlay.width / 2 + scrollX;
  const column = findDropColumn(geometry.columns, dropX);
  if (!column) {
    return null;
  }

  // The overlay is positioned in viewport space, while task layouts are in the
  // column list's content space, so undo the header offset and re-apply scroll.
  const headerY = geometry.columnHeaderY[column.id] ?? 0;
  const listScrollY = geometry.columnScrollY[column.id] ?? 0;
  const dropY = overlay.y + overlay.height / 2 - headerY + listScrollY;

  const rows = geometry.tasksByColumn[column.id] ?? [];

  return {
    columnId: column.id,
    index: findInsertIndex(rows, draggedTaskId, dropY),
  };
}

/** Replaces a task's layout entry within a column, keyed by task id. */
export function upsertTaskLayout(
  tasksByColumn: Record<string, TaskLayout[]>,
  columnId: string,
  layout: TaskLayout
): Record<string, TaskLayout[]> {
  "worklet";
  const rows = (tasksByColumn[columnId] ?? []).filter(
    (r) => r.id !== layout.id
  );
  return { ...tasksByColumn, [columnId]: [...rows, layout] };
}

/** Replaces a column's layout entry, keyed by column id. */
export function upsertColumnLayout(
  columns: ColumnLayout[],
  layout: ColumnLayout
): ColumnLayout[] {
  "worklet";
  return [...columns.filter((c) => c.id !== layout.id), layout];
}
