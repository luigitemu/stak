import { fireEvent, render, screen } from "@testing-library/react-native";
import { router } from "expo-router";

import {
  BoardDetailHeader,
  BoardDetailToolbar,
} from "@/components/board/board-toolbar";
import { TEAM } from "@/lib/board-types";

describe("BoardDetailHeader", () => {
  test("renders the board title", async () => {
    await render(<BoardDetailHeader title="Product Launch" />);
    expect(screen.getByText("Product Launch")).toBeVisible();
  });

  test("back button calls router.back", async () => {
    await render(<BoardDetailHeader title="Product Launch" />);
    await fireEvent.press(
      screen.getByRole("button", { name: "Back to boards" })
    );
    expect(router.back).toHaveBeenCalledTimes(1);
  });
});

describe("BoardDetailToolbar", () => {
  test("fires onAddColumn when the add-column button is pressed", async () => {
    const onAddColumn = jest.fn();
    await render(<BoardDetailToolbar onAddColumn={onAddColumn} />);
    await fireEvent.press(screen.getByRole("button", { name: "Add column" }));
    expect(onAddColumn).toHaveBeenCalledTimes(1);
  });

  test("shows the first 2 TEAM avatars plus a '+N' overflow badge", async () => {
    await render(<BoardDetailToolbar onAddColumn={jest.fn()} />);
    expect(screen.getByText(`+${TEAM.length - 2}`)).toBeVisible();
  });
});
