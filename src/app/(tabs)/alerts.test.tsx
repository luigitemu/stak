import { render, screen } from "@testing-library/react-native";

import AlertsScreen from "./alerts";

test("renders the empty alerts state", async () => {
  await render(<AlertsScreen />);
  expect(screen.getByText("Alerts")).toBeVisible();
  expect(
    screen.getByText(
      "No alerts yet. You'll see mentions and due-date reminders here."
    )
  ).toBeVisible();
});
