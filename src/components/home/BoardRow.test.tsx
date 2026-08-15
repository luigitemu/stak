import { fireEvent, render, screen } from "@testing-library/react-native";

import { BoardRow } from "@/components/home/BoardRow";
import type { Board } from "@/lib/board-types";

function makeBoard(overrides: Partial<Board> = {}): Board {
  return {
    id: "b1",
    name: "Product Launch",
    icon: "paperplane.fill",
    color: "orange",
    pinned: false,
    updatedLabel: "Updated 2h ago",
    columns: [
      { id: "c1", name: "To Do", tasks: [{ id: "t1" } as never] },
      { id: "c2", name: "In Progress", tasks: [{ id: "t2" } as never] },
      { id: "c3", name: "Done", tasks: [{ id: "t3" } as never] },
    ],
    ...overrides,
  };
}

test("renders the board name and updated label with task count", async () => {
  await render(<BoardRow board={makeBoard()} onPress={jest.fn()} />);
  expect(screen.getByText("Product Launch")).toBeVisible();
  expect(screen.getByText("Updated 2h ago · 3 tasks")).toBeVisible();
});

test("calls onPress when pressed", async () => {
  const onPress = jest.fn();
  await render(<BoardRow board={makeBoard()} onPress={onPress} />);
  await fireEvent.press(screen.getByRole("button", { name: "Product Launch" }));
  expect(onPress).toHaveBeenCalledTimes(1);
});

test("computes progress as done tasks over total tasks, matching /done/i columns", async () => {
  const board = makeBoard({
    columns: [
      {
        id: "c1",
        name: "To Do",
        tasks: [{ id: "t1" } as never, { id: "t2" } as never],
      },
      { id: "c2", name: "DONE (archive)", tasks: [{ id: "t3" } as never] },
    ],
  });
  await render(<BoardRow board={board} onPress={jest.fn()} />);
  expect(screen.getByText("Updated 2h ago · 3 tasks")).toBeVisible();
});

test("shows 0 tasks when board has no columns", async () => {
  await render(
    <BoardRow board={makeBoard({ columns: [] })} onPress={jest.fn()} />
  );
  expect(screen.getByText("Updated 2h ago · 0 tasks")).toBeVisible();
});
