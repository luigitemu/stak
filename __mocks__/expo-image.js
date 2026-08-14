// Manual mock for expo-image. Renders RN's core Image so screens can
// smoke-render and be queried by accessibility label without needing the
// native expo-image view.
const React = require("react");
const { Image: RNImage } = require("react-native");

function Image({
  source,
  style,
  accessibilityLabel,
  accessibilityIgnoresInvertColors,
  ...rest
}) {
  return React.createElement(RNImage, {
    source,
    style,
    accessibilityLabel,
    ...rest,
  });
}

module.exports = { Image };
