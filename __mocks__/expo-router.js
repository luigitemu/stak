// Manual mock for expo-router.
//
// `router` is a single shared object with jest.fn() methods so tests can
// assert on navigation calls (`expect(router.push).toHaveBeenCalledWith(...)`).
// `useLocalSearchParams` is a jest.fn() defaulting to `{}` — override per test
// with `useLocalSearchParams.mockReturnValue({...})` before rendering.
const React = require("react");

const router = {
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
  canGoBack: jest.fn(() => true),
  setParams: jest.fn(),
};

const useLocalSearchParams = jest.fn(() => ({}));
const useSegments = jest.fn(() => []);
const useRouter = jest.fn(() => router);

function Stack({ children }) {
  return React.createElement(React.Fragment, null, children);
}
// Stack.Screen carries navigation config (title/headerShown/etc). Most of it
// is not JS-testable app behavior, but `headerLeft`/`headerRight` render
// props often contain real interactive buttons (Cancel/Save) — render those
// so screens that put actions in the header stay testable via RNTL queries.
Stack.Screen = function StackScreen({ options }) {
  const headerLeft =
    typeof options?.headerLeft === "function" ? options.headerLeft() : null;
  const headerRight =
    typeof options?.headerRight === "function" ? options.headerRight() : null;
  if (!headerLeft && !headerRight) return null;
  return React.createElement(React.Fragment, null, headerLeft, headerRight);
};

function Link({ children }) {
  return children;
}

function Redirect({ href }) {
  return React.createElement(
    require("react-native").View,
    { accessibilityLabel: `redirect-${href}` },
    null
  );
}

module.exports = {
  router,
  useLocalSearchParams,
  useSegments,
  useRouter,
  Stack,
  Link,
  Redirect,
};
