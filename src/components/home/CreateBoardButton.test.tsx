import { fireEvent, render, screen } from "@testing-library/react-native";
import { router } from "expo-router";

import { CreateBoardButton } from "@/components/home/CreateBoardButton";

test("renders the create-board label", async () => {
  await render(<CreateBoardButton />);
  expect(
    screen.getByRole("button", { name: "Create new board" })
  ).toBeVisible();
  expect(screen.getByText("Create New Board")).toBeVisible();
});

test("navigates to /board/create when pressed", async () => {
  await render(<CreateBoardButton />);
  await fireEvent.press(
    screen.getByRole("button", { name: "Create new board" })
  );
  expect(router.push).toHaveBeenCalledWith("/board/create");
});
