// Manual mock for @expo/ui.
//
// @expo/ui renders real SwiftUI/Jetpack Compose views via native bridges.
// There is no JS-testable behavior to preserve — these are simple
// passthrough components (built on core React Native primitives) so that
// screens using @expo/ui can still smoke-render and be queried by RNTL.
const React = require("react");
const {
  Switch: RNSwitch,
  Text: RNText,
  TextInput: RNTextInput,
  View,
} = require("react-native");

function Host({ style, children }) {
  return React.createElement(View, { style }, children);
}

function Icon({ name, size, color }) {
  return React.createElement(
    RNText,
    { accessibilityLabel: name, style: { fontSize: size, color } },
    name
  );
}

function Switch({ value, onValueChange, disabled }) {
  return React.createElement(RNSwitch, { value, onValueChange, disabled });
}

function Row({ children }) {
  return React.createElement(
    View,
    { style: { flexDirection: "row" } },
    children
  );
}

function Spacer() {
  return null;
}

function TextInput({
  defaultValue,
  onChangeText,
  placeholder,
  multiline,
  numberOfLines,
  autoFocus,
  returnKeyType,
  onSubmitEditing,
}) {
  return React.createElement(RNTextInput, {
    defaultValue,
    onChangeText,
    placeholder,
    multiline,
    numberOfLines,
    autoFocus,
    returnKeyType,
    onSubmitEditing,
  });
}

function Text({ children }) {
  return React.createElement(RNText, null, children);
}

function Picker({ children }) {
  return React.createElement(View, null, children);
}
function PickerItem() {
  return null;
}
Picker.Item = PickerItem;

function FieldGroup({ children }) {
  return React.createElement(View, null, children);
}
function FieldGroupSection({ title, children }) {
  return React.createElement(
    View,
    null,
    title ? React.createElement(RNText, null, title) : null,
    children
  );
}
FieldGroup.Section = FieldGroupSection;

function FieldGroupSectionFooter({ children }) {
  return React.createElement(RNText, null, children);
}
FieldGroup.SectionFooter = FieldGroupSectionFooter;

function FieldGroupSectionHeader({ children }) {
  return React.createElement(RNText, null, children);
}
FieldGroup.SectionHeader = FieldGroupSectionHeader;

module.exports = {
  Host,
  Icon,
  Switch,
  Row,
  Spacer,
  TextInput,
  Text,
  Picker,
  FieldGroup,
};
