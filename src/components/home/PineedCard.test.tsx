import { fireEvent, render, screen } from "@testing-library/react-native";

import { PinnedCard } from "@/components/home/PineedCard";
import type { Board } from "@/lib/board-types";

function makeBoard(overrides: Partial<Board> = {}): Board {
  return {
    id: "b1",
    name: "Product Launch",
    icon: "paperplane.fill",
    color: "orange",
    pinned: true,
    updatedLabel: "Updated 2h ago",
    columns: [
      {
        id: "c1",
        name: "To Do",
        tasks: [{ id: "t1" } as never, { id: "t2" } as never],
      },
      { id: "c2", name: "In Progress", tasks: [{ id: "t3" } as never] },
      {
        id: "c3",
        name: "Done",
        tasks: [{ id: "t4" } as never, { id: "t5" } as never],
      },
      { id: "c4", name: "DONE (archive)", tasks: [{ id: "t6" } as never] },
    ],
    ...overrides,
  };
}

test("renders the board name", async () => {
  await render(<PinnedCard board={makeBoard()} onPress={jest.fn()} />);
  expect(screen.getByText("Product Launch")).toBeVisible();
});

test("counts active tasks, excluding columns whose name matches /done/i", async () => {
  await render(<PinnedCard board={makeBoard()} onPress={jest.fn()} />);
  // 2 (To Do) + 1 (In Progress) = 3; both "Done" columns are excluded.
  expect(screen.getByText("3 active tasks")).toBeVisible();
});

test("fires onPress when tapped", async () => {
  const onPress = jest.fn();
  await render(<PinnedCard board={makeBoard()} onPress={onPress} />);
  await fireEvent.press(screen.getByRole("button", { name: "Product Launch" }));
  expect(onPress).toHaveBeenCalledTimes(1);
});

test("sets an accessibilityLabel matching the board name", async () => {
  await render(
    <PinnedCard
      board={makeBoard({ name: "Design System" })}
      onPress={jest.fn()}
    />
  );
  expect(screen.getByLabelText("Design System")).toBeVisible();
});
