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

function AuthenticationFields({ mode, fields, setFields }) {
  return (
    <>
      {mode === "Register" ? (
        <View>
          <Text>Name</Text>
          <View>
            <TextInput
              value={fields.name}
              onChangeText={(name) => setFields({ ...fields, name })}
            ></TextInput>
          </View>
        </View>
      ) : null}
      <View>
        <Text>Email</Text>
        <View>
          <TextInput
            value={fields.email}
            onChangeText={(email) => setFields({ ...fields, email })}
          ></TextInput>
        </View>
      </View>
      <View>
        <Text>Password</Text>
        <View>
          {/* Currently password is always visible */}
          <TextInput
            value={fields.password}
            onChangeText={(password) => setFields({ ...fields, password })}
          ></TextInput>
        </View>
      </View>
    </>
  );
}
export default function AuthenticationScreen({ onLogin }) {
  const [authenticationMode, setAuthenticationMode] = useState("Login");
  const [authenticationFields, setAuthenticationFields] = useState({
    name: "",
    email: "",
    password: "",
  });

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
        <AuthenticationFields
          mode={authenticationMode}
          fields={authenticationFields}
          setFields={setAuthenticationFields}
        ></AuthenticationFields>
        <View>
          <Pressable
            onPress={() => {
              if (authenticationMode === "Login") {
                handleLogin(onLogin, authenticationFields);
              } else {
                handleRegister(onLogin, authenticationFields);
              }
            }}
          >
            <Text>{authenticationMode === "Login" ? "Login" : "Register"}</Text>
          </Pressable>
        </View>
      </View>
    </>
  );
}

// Currently has the same functionality as handleLogin
// Will change once full implementation is used
function handleRegister(onLogin, fields) {
  console.log(fields); // Remove once logic is perfected
  onLogin();
}
function handleLogin(onLogin, fields) {
  console.log(fields); // Remove once logic is perfected
  onLogin();
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
