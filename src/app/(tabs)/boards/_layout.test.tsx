import { render } from "@testing-library/react-native";

import BoardsStackLayout from "./_layout";

test("renders the boards stack layout without crashing", async () => {
  const view = await render(<BoardsStackLayout />);
  expect(view.toJSON()).toBeDefined();
});
