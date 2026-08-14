// Manual mock for @expo/ui/community/datetime-picker.
// Native SwiftUI/Compose date picker with no JS-testable behavior — render
// as an inert placeholder so screens using it can still smoke-render.
const React = require("react");
const { View } = require("react-native");

function DateTimePicker({ style }) {
  return React.createElement(View, {
    style,
    accessibilityLabel: "Due date picker",
  });
}

module.exports = { DateTimePicker };
