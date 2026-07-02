import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Image,
} from "react-native";
import { useState } from "react";
import { API_URL } from "../constants.js";

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
  const [passwordHidden, setPasswordHidden] = useState(true);
  return (
    <>
      {mode === "Register" ? (
        <View>
          <Text>Name</Text>
          <View>
            <TextInput
              value={fields.name}
              onChangeText={(name) => setFields({ ...fields, name })}
              autoComplete="name"
              maxLength={24}
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
            autoComplete="email"
            inputMode="email"
            maxLength={126}
            placeholder="email@email.com"
          ></TextInput>
        </View>
      </View>
      <View>
        <Text>Password</Text>
        <View style={styles.inputIconRow}>
          {/* Currently password is never visible given there is no password toggle */}
          <TextInput
            value={fields.password}
            onChangeText={(password) => setFields({ ...fields, password })}
            autoComplete={
              mode === "Register" ? "new-password" : "current-password"
            }
            autoCorrect={false}
            maxLength={120}
            secureTextEntry={passwordHidden}
            style={styles.passwordInput}
          ></TextInput>
          {/*Eye Password See View SVG by Gokce Curt, licensed under CC BY 4.0,
            Source: https://www.svgrepo.com/svg/390427/eye-password-see-view, Changes made: converted to png*/}
          {/* Toggle password visibility via icon */}
          <Pressable
            onPress={() =>
              passwordHidden
                ? setPasswordHidden(false)
                : setPasswordHidden(true)
            }
          >
            <Image
              source={require("../../assets/password_visibility_icon64x64.png")}
              style={styles.inputIcon}
            ></Image>
          </Pressable>
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

  const [errorMessage, setErrorMessage] = useState("");

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
        {errorMessage !== "" ? (
          <View>
            <Text style={styles.errorMessage}>{errorMessage}</Text>
          </View>
        ) : null}
        <View>
          <Pressable
            onPress={() => {
              if (authenticationMode === "Login") {
                handleLogin(onLogin, authenticationFields, setErrorMessage);
              } else {
                handleRegister(onLogin, authenticationFields, setErrorMessage);
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

// Validate input on the frontend to align with backend pydantic validation
// Maybe move to zod or other pydantic equivalent in the future
function validateCreateUser(fields) {
  // Use regular expressions to check if an email is valid -> Currently not perfect logic, however good enough for current scope
  // [a-zA-z0-9._%+-] -> Match any characters from A-Z (any case), from 0-9 or one of [. _ % + -]
  // + <- match the preceding token atleast once
  // @ -> match the symbol @
  // \. -> match the symbol "."
  // .+ -> match any characters at least once

  const simple_email_regex = /[a-zA-z0-9._%+-]+@[a-zA-z0-9._%+-]+\..+/;

  if (fields.email.length < 4) {
    return "Email must be at least 4 characters";
  }
  if (fields.email.length > 126) {
    return "Email must be at most 126 characters";
  }
  // Check the email against the basic regular expression
  if (!simple_email_regex.test(fields.email)) {
    return "Email must be a valid email";
  }
  if (fields.password.length < 4) {
    return "Password must be at least 4 characters";
  }

  if (fields.password.length > 120) {
    return "Password must be at most 120 characters";
  }

  if (fields.name.length < 3) {
    return "Name must be at least 3 characters";
  }
  if (fields.name.length > 24) {
    return "Name must be at most 24 characters";
  }

  return "";
}
// Currently has the same functionality as handleLogin
// Will change once full implementation is used
async function handleRegister(onLogin, fields, setErrorMessage) {
  const validation_result = validateCreateUser(fields);

  if (validation_result) {
    setErrorMessage(validation_result);
    return;
  }
  async function registerAccount() {
    try {
      const register_url = API_URL + "/authentication/create_user";
      const response = await fetch(register_url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: fields.email,
          password: fields.password,
          display_name: fields.name,
        }),
      });
      const data = await response.json(); // the created users id
      if (!response.ok) {
        setErrorMessage(getAuthenticationErrorMessage(data));
        return false;
      }
    } catch (error) {
      setErrorMessage("An unkown error occured");
      console.error("Error: ", error);
      return false;
    }
    return true;
  }
  const result = await registerAccount();
  if (result) {
    setErrorMessage("");
    onLogin();
  }
}

function validateLoginUser(fields) {
  if (fields.email.length < 4) {
    return "Email must be at least 4 characters";
  }
  if (fields.email.length > 126) {
    return "Email must be at most 126 characters";
  }
  return "";
}

async function handleLogin(onLogin, fields, setErrorMessage) {
  const validation_result = validateLoginUser(fields);

  if (validation_result) {
    setErrorMessage(validation_result);
    return;
  }

  async function authenticateAccount() {
    try {
      const authenticate_url = API_URL + "/authentication/login";
      const response = await fetch(authenticate_url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: fields.email,
          password: fields.password,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setErrorMessage(getAuthenticationErrorMessage(data, "Authenticate"));
        return false;
      }
    } catch (error) {
      setErrorMessage("An unkown error occured");
      console.error("Error: ", error);
      return false;
    }
    return true;
  }
  const result = await authenticateAccount();
  if (result) {
    setErrorMessage("");
    onLogin();
  }
}

// Used given error messages from api can have 2 different shapes
function getAuthenticationErrorMessage(data, type = "Register") {
  const detail = data["detail"];

  // For custom HTTPExceptions explicitly raised in backend
  if (typeof detail === "string") {
    return detail;
  } else {
    const error = detail[0];
    const field = error["loc"][1];
    // For pydantic raised exceptions
    // Ideally, this should not happen given the frontend validation should take care of these errors and prevent submission
    if (field === "email") {
      return "Email must be at least 4 characters";
    }
    if (type === "Register") {
      // These messages only appear during registring and not during login, so they are skipped for loggin
      if (field === "password") {
        return "Password must be at least 4 characters";
      }
      if (field === "display_name") {
        return "Name must be at least 3 characters";
      }
    }
    return error.msg ? error.msg : "Invalid input";
  }
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

  errorMessage: {
    color: "red",
  },

  inputIconRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  inputIcon: {
    width: 24,
    height: 24,
  },

  passwordInput: {
    minWidth: 180,
    flex: 1,
  },
});
