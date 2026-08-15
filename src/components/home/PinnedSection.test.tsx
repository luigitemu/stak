import { fireEvent, render, screen } from "@testing-library/react-native";

import { PinnedSection } from "@/components/home/PinnedSection";
import type { Board } from "@/lib/board-types";

function makeBoard(overrides: Partial<Board> = {}): Board {
  return {
    id: "b1",
    name: "Product Launch",
    icon: "paperplane.fill",
    color: "orange",
    pinned: true,
    updatedLabel: "Updated 2h ago",
    columns: [],
    ...overrides,
  };
}

test("renders nothing when there are no pinned boards", async () => {
  await render(<PinnedSection boards={[]} onOpenBoard={jest.fn()} />);
  expect(screen.queryByText("Pinned")).toBeNull();
});

test("renders the section heading and a card per pinned board", async () => {
  const boards = [
    makeBoard({ id: "b1", name: "Product Launch" }),
    makeBoard({ id: "b2", name: "Marketing" }),
  ];
  await render(<PinnedSection boards={boards} onOpenBoard={jest.fn()} />);
  expect(screen.getByText("Pinned")).toBeVisible();
  expect(screen.getByText("Product Launch")).toBeVisible();
  expect(screen.getByText("Marketing")).toBeVisible();
});

test("calls onOpenBoard with the board id when a card is pressed", async () => {
  const onOpenBoard = jest.fn();
  await render(
    <PinnedSection
      boards={[makeBoard({ id: "b1" })]}
      onOpenBoard={onOpenBoard}
    />
  );
  await fireEvent.press(screen.getByRole("button", { name: "Product Launch" }));
  expect(onOpenBoard).toHaveBeenCalledWith("b1");
});
