import { render, screen } from "@testing-library/react-native";

import TabIndexRedirect from "@/app/(tabs)/index";

test("redirects to /boards", async () => {
  await render(<TabIndexRedirect />);
  expect(screen.getByLabelText("redirect-/boards")).toBeTruthy();
});
