import { render } from "@testing-library/react-native";

import TabLayout from "./_layout";

test("renders the native tab layout without crashing", async () => {
  const view = await render(<TabLayout />);
  expect(view.toJSON()).not.toBeNull();
});
