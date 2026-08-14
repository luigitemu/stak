import { fireEvent, render, screen } from "@testing-library/react-native";

import SettingsScreen from "./settings";

test("renders account and support rows", async () => {
  await render(<SettingsScreen />);
  expect(screen.getByText("Personal Information")).toBeVisible();
  expect(screen.getByText("Security & Password")).toBeVisible();
  expect(screen.getByText("Help Center")).toBeVisible();
  expect(screen.getByText("About Kanban")).toBeVisible();
});

test("the notifications switch toggles local state", async () => {
  await render(<SettingsScreen />);
  expect(screen.getByRole("switch").props.value).toBe(true);
  await fireEvent(screen.getByRole("switch"), "valueChange", false);
  expect(screen.getByRole("switch").props.value).toBe(false);
});
