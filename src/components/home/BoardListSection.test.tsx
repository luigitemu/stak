import { fireEvent, render, screen } from "@testing-library/react-native";

import { BoardListSection } from "@/components/home/BoardListSection";
import type { Board } from "@/lib/board-types";

function makeBoard(overrides: Partial<Board> = {}): Board {
  return {
    id: "b1",
    name: "Product Launch",
    icon: "paperplane.fill",
    color: "orange",
    pinned: false,
    updatedLabel: "Updated 2h ago",
    columns: [],
    ...overrides,
  };
}

test("renders the section heading and a row per board", async () => {
  const boards = [
    makeBoard({ id: "b1", name: "Product Launch" }),
    makeBoard({ id: "b2", name: "Marketing" }),
  ];
  await render(
    <BoardListSection
      boards={boards}
      onOpenBoard={jest.fn()}
      onSortPress={jest.fn()}
    />
  );
  expect(screen.getByText("All Boards")).toBeVisible();
  expect(screen.getByText("Product Launch")).toBeVisible();
  expect(screen.getByText("Marketing")).toBeVisible();
});

test("renders the heading with no rows when there are no boards", async () => {
  await render(
    <BoardListSection
      boards={[]}
      onOpenBoard={jest.fn()}
      onSortPress={jest.fn()}
    />
  );
  expect(screen.getByText("All Boards")).toBeVisible();
});

test("calls onOpenBoard with the board id when a row is pressed", async () => {
  const onOpenBoard = jest.fn();
  await render(
    <BoardListSection
      boards={[makeBoard({ id: "b1" })]}
      onOpenBoard={onOpenBoard}
      onSortPress={jest.fn()}
    />
  );
  await fireEvent.press(screen.getByRole("button", { name: "Product Launch" }));
  expect(onOpenBoard).toHaveBeenCalledWith("b1");
});

test("calls onSortPress when the sort button is pressed", async () => {
  const onSortPress = jest.fn();
  await render(
    <BoardListSection
      boards={[]}
      onOpenBoard={jest.fn()}
      onSortPress={onSortPress}
    />
  );
  await fireEvent.press(screen.getByRole("button", { name: "Sort boards" }));
  expect(onSortPress).toHaveBeenCalledTimes(1);
});
