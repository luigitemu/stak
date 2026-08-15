import { fireEvent, render, screen } from "@testing-library/react-native";
import { router } from "expo-router";

import { BoardProvider } from "@/lib/board-context";
import BoardsScreen from "@/app/(tabs)/boards/index";

function renderScreen() {
  return render(
    <BoardProvider>
      <BoardsScreen />
    </BoardProvider>
  );
}

test("search filters boards by a case-insensitive substring match on name", async () => {
  await renderScreen();
  expect(screen.getByText("Hiring Pipeline")).toBeVisible();

  await fireEvent.changeText(screen.getByLabelText("Search boards"), "design");

  expect(screen.getByText("Design System")).toBeVisible();
  expect(screen.queryByText("Hiring Pipeline")).toBeNull();
});

test("buckets pinned boards under Pinned and the rest under All Boards", async () => {
  await renderScreen();
  // b1 "Product Launch" and b2 "Design System" are pinned in INITIAL_BOARDS.
  expect(screen.getByText("Pinned")).toBeVisible();
  // Pinned boards render as PinnedCard (name + "N active tasks").
  expect(screen.getByRole("button", { name: "Product Launch" })).toBeVisible();
  // Unpinned boards render as BoardRow, e.g. "Frontend Overhaul".
  expect(
    screen.getByRole("button", { name: "Frontend Overhaul" })
  ).toBeVisible();
});

test("pressing a pinned board card navigates to /boards/[id]", async () => {
  await renderScreen();
  await fireEvent.press(screen.getByRole("button", { name: "Product Launch" }));
  expect(router.push).toHaveBeenCalledWith({
    pathname: "/boards/[id]",
    params: { id: "b1" },
  });
});

test("pressing an unpinned board row navigates to /boards/[id]", async () => {
  await renderScreen();
  await fireEvent.press(
    screen.getByRole("button", { name: "Frontend Overhaul" })
  );
  expect(router.push).toHaveBeenCalledWith({
    pathname: "/boards/[id]",
    params: { id: "b3" },
  });
});

function unpinnedRowOrder() {
  const names = ["Frontend Overhaul", "Q3 Marketing", "Hiring Pipeline"];
  return screen
    .getAllByRole("button")
    .map((el) => el.props.accessibilityLabel)
    .filter((label) => names.includes(label));
}

test("pressing Sort toggles All Boards between ascending and descending name order", async () => {
  await renderScreen();
  expect(unpinnedRowOrder()).toEqual([
    "Frontend Overhaul",
    "Hiring Pipeline",
    "Q3 Marketing",
  ]);

  await fireEvent.press(screen.getByRole("button", { name: "Sort boards" }));
  expect(unpinnedRowOrder()).toEqual([
    "Q3 Marketing",
    "Hiring Pipeline",
    "Frontend Overhaul",
  ]);

  await fireEvent.press(screen.getByRole("button", { name: "Sort boards" }));
  expect(unpinnedRowOrder()).toEqual([
    "Frontend Overhaul",
    "Hiring Pipeline",
    "Q3 Marketing",
  ]);
});
