import { Pressable, Text, View } from "react-native";
import { style } from "./settingsStyles";

export default function EditSettingsActions({ onCancel, onSave }) {
  return (
    <View style={style.endEditSettings}>
      <Pressable
        style={[style.editSettingsEndButtons, style.cancelEditSettingsButton]}
        onPress={() => {
          onCancel();
        }}
      >
        <Text>Cancel</Text>
      </Pressable>
      <Pressable
        style={[style.editSettingsEndButtons, style.saveEditSettingsButton]}
        onPress={() => {
          onSave();
        }}
      >
        <Text>Save</Text>
      </Pressable>
    </View>
  );
}
