// Manual mock for expo-router/unstable-native-tabs.
// Renders a native (UITabBarController / BottomNavigationView) tab bar with
// no JS-testable behavior — passthrough View/Text so layouts using it can
// still smoke-render.
const React = require("react");
const { Text, View } = require("react-native");

function NativeTabs({ children }) {
  return React.createElement(
    View,
    { accessibilityLabel: "native-tabs" },
    children
  );
}

function Trigger({ children }) {
  return React.createElement(View, null, children);
}
function Label({ children }) {
  return React.createElement(Text, null, children);
}
function Icon() {
  return null;
}
Trigger.Label = Label;
Trigger.Icon = Icon;
NativeTabs.Trigger = Trigger;

module.exports = { NativeTabs };
