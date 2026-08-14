// NOTE: the drag-and-drop pan gesture (react-native-gesture-handler +
// react-native-reanimated) is intentionally NOT exercised here — simulating
// a native pan gesture requires a real gesture runtime, so these tests
// cover only the static render, task counts, empty states, and the
// non-gesture interactive controls (rename input, add-task, add-column).
import { fireEvent, render, screen } from "@testing-library/react-native";

import { BoardView } from "@/components/board/board-view";
import type { FilteredColumn } from "@/lib/board-types";

function makeColumns(): FilteredColumn[] {
  return [
    {
      id: "c1",
      name: "To Do",
      done: false,
      tasks: [
        {
          id: "t1",
          title: "Finalize hero section",
          notes: "",
          due: "2026-08-14",
          priority: "Med",
          labels: ["Design"],
          assignee: "JT",
          checklist: [],
        },
        {
          id: "t2",
          title: "Setup email automation",
          notes: "",
          due: "2026-08-15",
          priority: "Low",
          labels: [],
          assignee: "MK",
          checklist: [],
        },
      ],
    },
    {
      id: "c2",
      name: "Review",
      done: false,
      tasks: [],
    },
  ];
}

async function renderBoard(overrides: Partial<Parameters<typeof BoardView>[0]> = {}) {
  const props = {
    columns: makeColumns(),
    onRenameColumn: jest.fn(),
    onAddColumn: jest.fn(),
    onSelectTask: jest.fn(),
    onAddTask: jest.fn(),
    onMoveTask: jest.fn(),
    ...overrides,
  };
  await render(<BoardView {...props} />);
  return { props };
}

test("renders each column's task count badge", async () => {
  await renderBoard();
  expect(screen.getByText("2")).toBeVisible(); // c1 has 2 tasks
  expect(screen.getByText("0")).toBeVisible(); // c2 has 0 tasks
});

test("renders every task's title", async () => {
  await renderBoard();
  expect(screen.getByText("Finalize hero section")).toBeVisible();
  expect(screen.getByText("Setup email automation")).toBeVisible();
});

test("shows 'No tasks' in an empty column", async () => {
  await renderBoard();
  expect(screen.getByText("No tasks")).toBeVisible();
});

test("pressing a task card fires onSelectTask with the task id", async () => {
  const { props } = await renderBoard();
  await fireEvent.press(
    screen.getByRole("button", { name: "Finalize hero section" })
  );
  expect(props.onSelectTask).toHaveBeenCalledWith("t1");
});

test("editing the column name input fires onRenameColumn with the column id", async () => {
  const { props } = await renderBoard();
  const [input] = screen.getAllByLabelText("Column name");
  await fireEvent.changeText(input, "Backlog");
  expect(props.onRenameColumn).toHaveBeenCalledWith("c1", "Backlog");
});

test("pressing a column's add-task button fires onAddTask with that column id", async () => {
  const { props } = await renderBoard();
  await fireEvent.press(
    screen.getByRole("button", { name: "Add task to To Do" })
  );
  expect(props.onAddTask).toHaveBeenCalledWith("c1");
});

test("pressing the trailing add-column button fires onAddColumn", async () => {
  const { props } = await renderBoard();
  await fireEvent.press(screen.getByRole("button", { name: "Add column" }));
  expect(props.onAddColumn).toHaveBeenCalledTimes(1);
});
