// Manual mock for @expo/ui/swift-ui.
//
// Renders real SwiftUI views via native bridges. There is no JS-testable
// behavior to preserve — this is a passthrough Text so screens using it can
// still smoke-render and be queried by RNTL.
const React = require("react");
const { Text: RNText } = require("react-native");

function Text({ children }) {
  return React.createElement(RNText, null, children);
}

module.exports = { Text };
