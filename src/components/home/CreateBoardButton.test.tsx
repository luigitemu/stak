import { render, screen } from "@testing-library/react-native";

import { CreateBoardButton } from "@/components/home/CreateBoardButton";

test("renders the create-board label", async () => {
  await render(<CreateBoardButton />);
  expect(
    screen.getByRole("button", { name: "Create new board" })
  ).toBeVisible();
  expect(screen.getByText("Create New Board")).toBeVisible();
});
