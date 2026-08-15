import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { router, useLocalSearchParams } from "expo-router";

import { BoardProvider } from "@/lib/board-context";
import BoardDetailScreen from "@/app/(tabs)/boards/[id]";

// BoardView has its own dedicated test file (board-view.test.tsx). Mocking
// it here isolates this screen's wiring: the callbacks it hands to
// BoardView should reach useBoard with the right arguments.
let capturedProps: {
  columns: { id: string; name: string; tasks: { id: string }[] }[];
  onSelectTask: (id: string) => void;
  onAddTask: (colId: string) => void;
  onMoveTask: (taskId: string, colId: string, index: number) => void;
} | null = null;

jest.mock("@/components/board/board-view", () => ({
  BoardView: (props: typeof capturedProps) => {
    capturedProps = props;
    return null;
  },
}));

const mockUseLocalSearchParams = useLocalSearchParams as jest.Mock;

function renderScreen() {
  return render(
    <BoardProvider>
      <BoardDetailScreen />
    </BoardProvider>
  );
}

beforeEach(() => {
  capturedProps = null;
});

test("renders the board found via useLocalSearchParams", async () => {
  mockUseLocalSearchParams.mockReturnValue({ id: "b1" });
  await renderScreen();
  expect(screen.getByText("Product Launch")).toBeVisible();
});

test("returns null gracefully when the board is not found", async () => {
  mockUseLocalSearchParams.mockReturnValue({ id: "does-not-exist" });
  const view = await renderScreen();
  expect(view.toJSON()).toBeNull();
});

test("add-column button wires through to useBoard's addColumn", async () => {
  mockUseLocalSearchParams.mockReturnValue({ id: "b1" });
  await renderScreen();
  const before = capturedProps!.columns.length;
  await fireEvent.press(screen.getByRole("button", { name: "Add column" }));
  expect(capturedProps!.columns.length).toBe(before + 1);
});

test("onSelectTask navigates to /task/[id] with the board id", async () => {
  mockUseLocalSearchParams.mockReturnValue({ id: "b1" });
  await renderScreen();
  await act(() => capturedProps!.onSelectTask("t1"));
  expect(router.push).toHaveBeenCalledWith({
    pathname: "/task/[id]",
    params: { id: "t1", board: "b1" },
  });
});

test("onAddTask navigates to /task/edit with the board and column id", async () => {
  mockUseLocalSearchParams.mockReturnValue({ id: "b1" });
  await renderScreen();
  await act(() => capturedProps!.onAddTask("c2"));
  expect(router.push).toHaveBeenCalledWith({
    pathname: "/task/edit",
    params: { board: "b1", col: "c2" },
  });
});

test("onMoveTask wires through to useBoard's moveTask", async () => {
  mockUseLocalSearchParams.mockReturnValue({ id: "b1" });
  await renderScreen();
  await act(() => capturedProps!.onMoveTask("t1", "c3", 0));
  const c3 = capturedProps!.columns.find((c) => c.id === "c3")!;
  expect(c3.tasks[0].id).toBe("t1");
  const c1 = capturedProps!.columns.find((c) => c.id === "c1")!;
  expect(c1.tasks.map((t) => t.id)).not.toContain("t1");
});
