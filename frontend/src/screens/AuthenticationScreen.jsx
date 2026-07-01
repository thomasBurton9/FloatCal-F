import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";
import { useState } from "react";

function AuthenticationModeSwitcher({ mode, setMode }) {
  return (
    <>
      <View style={styles.authenticationSwitcher}>
        <Pressable
          /* Use blue colouring when selected, white otherwise */
          style={[
            mode === "Login" ? styles.currentMode : styles.nonCurrentMode,
            styles.authenticationMode,
          ]}
          onPress={() => setMode("Login")}
        >
          <Text>Login</Text>
        </Pressable>
        <Pressable
          /* Use blue colouring when selected, white otherwise */
          style={[
            mode === "Register" ? styles.currentMode : styles.nonCurrentMode,
            styles.authenticationMode,
          ]}
          onPress={() => setMode("Register")}
        >
          <Text>Register</Text>
        </Pressable>
      </View>
    </>
  );
}

export default function AuthenticationScreen({ onLogin }) {
  const [authenticationMode, setAuthenticationMode] = useState("Login");
  return (
    <>
      <View style={styles.screen}>
        <View>
          <Text>Welcome to Float Cal</Text>
        </View>
        <AuthenticationModeSwitcher
          mode={authenticationMode}
          setMode={setAuthenticationMode}
        ></AuthenticationModeSwitcher>
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
  currentMode: {
    backgroundColor: "blue", // In the future move this too a dedicated theme file with chosen themed colours
  },
  nonCurrentMode: {
    backgroundColor: "white",
  },

  authenticationMode: {
    padding: 10,
  },
});
