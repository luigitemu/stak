import { fireEvent, render, screen } from "@testing-library/react-native";
import { router } from "expo-router";
import { ActionSheetIOS } from "react-native";

import { BoardProvider, useBoard } from "@/lib/board-context";
import CreateBoardSheet from "@/app/board/create";

// Small probe that exposes the live useBoard() API alongside the screen so
// assertions can read board state without re-implementing board-context.
function Probe({
  onReady,
}: {
  onReady: (api: ReturnType<typeof useBoard>) => void;
}) {
  onReady(useBoard());
  return null;
}

async function renderScreen() {
  let api: ReturnType<typeof useBoard> | null = null;
  await render(
    <BoardProvider>
      <Probe onReady={(a) => (api = a)} />
      <CreateBoardSheet />
    </BoardProvider>
  );
  return { getApi: () => api! };
}

test("folder.fill and orange are preselected", async () => {
  await renderScreen();
  expect(
    screen.getByLabelText("Icon folder.fill").props.accessibilityState.selected
  ).toBe(true);
  expect(
    screen.getByLabelText("Color orange").props.accessibilityState.selected
  ).toBe(true);
});

test("picking an icon selects it and deselects the previous one", async () => {
  await renderScreen();
  await fireEvent.press(screen.getByLabelText("Icon flag.fill"));
  expect(
    screen.getByLabelText("Icon flag.fill").props.accessibilityState.selected
  ).toBe(true);
  expect(
    screen.getByLabelText("Icon folder.fill").props.accessibilityState.selected
  ).toBe(false);
});

test("picking a color selects it and deselects the previous one", async () => {
  await renderScreen();
  await fireEvent.press(screen.getByLabelText("Color sky"));
  expect(
    screen.getByLabelText("Color sky").props.accessibilityState.selected
  ).toBe(true);
  expect(
    screen.getByLabelText("Color orange").props.accessibilityState.selected
  ).toBe(false);
});

test("Create adds a board with the chosen name/icon/color and navigates to it", async () => {
  const { getApi } = await renderScreen();
  const before = getApi().boards.length;

  await fireEvent.changeText(
    screen.getByPlaceholderText("Board name"),
    "Launch Plan"
  );
  await fireEvent.press(screen.getByLabelText("Icon flag.fill"));
  await fireEvent.press(screen.getByLabelText("Color sky"));
  await fireEvent.press(screen.getByRole("button", { name: "Create board" }));

  const boards = getApi().boards;
  expect(boards).toHaveLength(before + 1);
  const created = boards.at(-1)!;
  expect(created).toMatchObject({
    name: "Launch Plan",
    icon: "flag.fill",
    color: "sky",
    pinned: false,
  });
  expect(created.columns.map((c) => c.name)).toEqual([
    "To Do",
    "In Progress",
    "Done",
  ]);
  expect(router.replace).toHaveBeenCalledWith({
    pathname: "/boards/[id]",
    params: { id: created.id },
  });
});

test("Create with a blank name does not save", async () => {
  const { getApi } = await renderScreen();
  const before = getApi().boards.length;

  const createButton = screen.getByRole("button", { name: "Create board" });
  await fireEvent.press(createButton);
  expect(getApi().boards).toHaveLength(before);

  await fireEvent.changeText(screen.getByPlaceholderText("Board name"), "   ");
  await fireEvent.press(createButton);
  expect(getApi().boards).toHaveLength(before);
});

test("Cancel navigates back immediately when the form is untouched", async () => {
  const { getApi } = await renderScreen();
  const before = getApi().boards.length;

  await fireEvent.press(screen.getByRole("button", { name: "Cancel" }));

  expect(getApi().boards).toHaveLength(before);
  expect(router.back).toHaveBeenCalledTimes(1);
});

test("Cancel with unsaved changes asks to discard before navigating back", async () => {
  const showActionSheet = jest
    .spyOn(ActionSheetIOS, "showActionSheetWithOptions")
    .mockImplementation(() => {});
  await renderScreen();

  await fireEvent.changeText(
    screen.getByPlaceholderText("Board name"),
    "Launch Plan"
  );
  await fireEvent.press(screen.getByRole("button", { name: "Cancel" }));

  expect(showActionSheet).toHaveBeenCalledTimes(1);
  expect(router.back).not.toHaveBeenCalled();

  const [options, callback] = showActionSheet.mock.calls[0];
  expect(options.options[0]).toBe("Discard Changes");
  callback(0);

  expect(router.back).toHaveBeenCalledTimes(1);
});
