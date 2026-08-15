import { render } from "@testing-library/react-native";

import RootLayout from "@/app/_layout";

// Our expo-router mock's <Stack> doesn't implement real file-based route
// resolution (Stack.Screen only carries `name`/`options`, no matched route
// content) — that's out of scope for a manual mock. This is a pure smoke
// test that the provider/font-gating wiring in the root layout doesn't
// throw once fonts report as loaded.
test("renders without crashing once fonts report as loaded", async () => {
  const view = await render(<RootLayout />);
  expect(view.toJSON()).not.toBeNull();
});
