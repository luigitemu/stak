import { fireEvent, render, screen } from "@testing-library/react-native";
import { router, useLocalSearchParams } from "expo-router";

import { BoardProvider, useBoard } from "@/lib/board-context";
import { blankDraft } from "@/lib/board-fixtures";
import TaskEditSheet from "@/app/task/edit";

const mockUseLocalSearchParams = useLocalSearchParams as jest.Mock;

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
  const view = await render(
    <BoardProvider>
      <Probe onReady={(a) => (api = a)} />
      <TaskEditSheet />
    </BoardProvider>
  );
  return { view, getApi: () => api! };
}

test("a new task defaults to blankDraft for the given board/column", async () => {
  mockUseLocalSearchParams.mockReturnValue({ board: "b1", col: "c2" });
  await renderScreen();
  const draft = blankDraft("b1", "c2");
  expect(
    screen.getByPlaceholderText("What needs doing?").props.defaultValue
  ).toBe(draft.title);
  expect(
    screen.getByPlaceholderText("Design, Dev, Marketing").props.defaultValue
  ).toBe(draft.labels);
});

test("editing an existing task pre-fills the draft from that task", async () => {
  mockUseLocalSearchParams.mockReturnValue({ id: "t4", board: "b1" });
  await renderScreen();
  expect(
    screen.getByPlaceholderText("What needs doing?").props.defaultValue
  ).toBe("Implement payment gateway integration");
  expect(
    screen.getByPlaceholderText("Design, Dev, Marketing").props.defaultValue
  ).toBe("Dev");
});

test("Save calls saveTask and navigates back", async () => {
  mockUseLocalSearchParams.mockReturnValue({ board: "b1", col: "c1" });
  const { getApi } = await renderScreen();
  const before = getApi()
    .findBoard("b1")!
    .columns.find((c) => c.id === "c1")!.tasks.length;

  await fireEvent.press(screen.getByRole("button", { name: "Save task" }));

  const after = getApi()
    .findBoard("b1")!
    .columns.find((c) => c.id === "c1")!.tasks.length;
  expect(after).toBe(before + 1);
  expect(router.back).toHaveBeenCalledTimes(1);
});

test("Cancel navigates back without saving", async () => {
  mockUseLocalSearchParams.mockReturnValue({ board: "b1", col: "c1" });
  const { getApi } = await renderScreen();
  const before = getApi()
    .findBoard("b1")!
    .columns.find((c) => c.id === "c1")!.tasks.length;

  await fireEvent.press(screen.getByRole("button", { name: "Cancel" }));

  const after = getApi()
    .findBoard("b1")!
    .columns.find((c) => c.id === "c1")!.tasks.length;
  expect(after).toBe(before);
  expect(router.back).toHaveBeenCalledTimes(1);
});
