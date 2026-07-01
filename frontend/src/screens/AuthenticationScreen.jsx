import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";

function AuthenticationModeSwitcher() {
  return (
    <>
      <View style={styles.authenticationSwitcher}>
        <Pressable>
          <Text>Login</Text>
        </Pressable>
        <Pressable>
          <Text>Register</Text>
        </Pressable>
      </View>
    </>
  );
}

export default function AuthenticationScreen({ onLogin }) {
  return (
    <>
      <View style={styles.screen}>
        <View>
          <Text>Welcome to Float Cal</Text>
        </View>
        <AuthenticationModeSwitcher></AuthenticationModeSwitcher>
        <View>
          <Text>Email</Text>
          <View>
            <TextInput></TextInput>
          </View>
        </View>
        <View>
          <Text>Password</Text>
          <View>
            {/* Currently password is always visible */}
            <TextInput></TextInput>
          </View>
        </View>
        <View>
          <Pressable onPress={onLogin}>
            <Text>Login</Text>
          </Pressable>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  authenticationSwitcher: {
    flexDirection: "row",
  },
  screen: {
    justifyContent: "center", // Center content vertically
    alignItems: "center", // Center content horizontally
  },
});
