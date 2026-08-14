import { fireEvent, render, screen } from "@testing-library/react-native";
import { router, useLocalSearchParams } from "expo-router";

import { BoardProvider } from "@/lib/board-context";
import TaskDetailSheet from "./[id]";

const mockUseLocalSearchParams = useLocalSearchParams as jest.Mock;

function renderScreen() {
  return render(
    <BoardProvider>
      <TaskDetailSheet />
    </BoardProvider>
  );
}

test("renders the task's detail when found", async () => {
  mockUseLocalSearchParams.mockReturnValue({ id: "t4", board: "b1" });
  await renderScreen();
  expect(
    screen.getByText("Implement payment gateway integration")
  ).toBeVisible();
  expect(screen.getByText("Product Launch")).toBeVisible();
});

test("returns null when the task is not found", async () => {
  mockUseLocalSearchParams.mockReturnValue({ id: "nope", board: "b1" });
  const view = await renderScreen();
  expect(view.toJSON()).toBeNull();
});

test("tapping a checklist item toggles it via toggleChecklistItem", async () => {
  mockUseLocalSearchParams.mockReturnValue({ id: "t4", board: "b1" });
  await renderScreen();
  const item = screen.getByRole("checkbox", {
    name: "Frontend checkout form styling",
  });
  expect(item.props.accessibilityState).toMatchObject({ checked: false });
  await fireEvent.press(item);
  expect(
    screen.getByRole("checkbox", { name: "Frontend checkout form styling" })
      .props.accessibilityState
  ).toMatchObject({ checked: true });
});

test("delete calls deleteTask and navigates back", async () => {
  mockUseLocalSearchParams.mockReturnValue({ id: "t4", board: "b1" });
  const view = await renderScreen();
  await fireEvent.press(screen.getByRole("button", { name: "Delete task" }));
  expect(router.back).toHaveBeenCalledTimes(1);
  // deleteTask() removed the task from board-context state, so this same
  // tree now re-renders with `find` returning null.
  expect(view.toJSON()).toBeNull();
});

test("'Move to' excludes the task's current column and moves + navigates back on press", async () => {
  mockUseLocalSearchParams.mockReturnValue({ id: "t4", board: "b1" });
  await renderScreen();
  // t4 lives in "In Progress" — that column must not appear as a move target.
  expect(screen.queryByText("Move to In Progress")).toBeNull();
  expect(screen.getByRole("button", { name: "Move to Review" })).toBeVisible();

  await fireEvent.press(screen.getByRole("button", { name: "Move to Done" }));
  expect(router.back).toHaveBeenCalledTimes(1);
});
