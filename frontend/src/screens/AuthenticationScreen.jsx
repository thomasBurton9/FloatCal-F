import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Image,
  ScrollView,
  KeyboardAvoidingView,
} from "react-native";
import { useState } from "react";
import { API_URL, BLUE_COLOUR, RED_WARNING_COLOUR } from "../constants.js";

export default function AuthenticationScreen({ onLogin }) {
  const [authenticationMode, setAuthenticationMode] = useState("Login");
  const [authenticationFields, setAuthenticationFields] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errorMessage, setErrorMessage] = useState("");

  return (
    <>
      <View style={styles.screen}>
        <View>
          <Text style={styles.title}>Welcome to {"\n"} Float Cal</Text>
        </View>
        <AuthenticationModeSwitcher
          mode={authenticationMode}
          setMode={setAuthenticationMode}
        ></AuthenticationModeSwitcher>
        <KeyboardAvoidingView style={styles.keyboardAvoid} behavior="padding">
          <ScrollView
            style={styles.authScrollView}
            contentContainerStyle={styles.authContainerScroll}
            showsVerticalScrollIndicator={false}
          >
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
            <Pressable
              style={styles.submitButton}
              onPress={() => {
                if (authenticationMode === "Login") {
                  handleLogin(onLogin, authenticationFields, setErrorMessage);
                } else {
                  handleRegister(
                    onLogin,
                    authenticationFields,
                    setErrorMessage,
                  );
                }
              }}
            >
              <Text style={styles.submitButtonText}>
                {authenticationMode === "Login" ? "Login" : "Register"}
              </Text>
            </Pressable>
            {/* Quick button to bypass logic to test application logic quicker*/}
            {/* TODO: Remove once done with button*/}
            {/* <Pressable
              onPress={() => {
                onLogin(5);
              }}
            >
              <Text>Admin</Text>
            </Pressable>*/}
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </>
  );
}

function AuthenticationModeSwitcher({ mode, setMode }) {
  return (
    <>
      <View style={styles.authenticationSwitcher}>
        <Pressable
          /* Use blue colouring when selected, white otherwise */
          style={[
            mode === "Login" ? styles.currentMode : styles.nonCurrentMode,
            styles.authenticationMode,
            styles.loginMode,
          ]}
          onPress={() => setMode("Login")}
        >
          <Text style={styles.authenticationModeText}>Login</Text>
        </Pressable>
        <Pressable
          /* Use blue colouring when selected, white otherwise */
          style={[
            mode === "Register" ? styles.currentMode : styles.nonCurrentMode,
            styles.authenticationMode,
            styles.registerMode,
          ]}
          onPress={() => setMode("Register")}
        >
          <Text style={styles.authenticationModeText}>Register</Text>
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
        <View style={styles.inputSection}>
          <Text style={styles.inputFieldSubtitle}>Name</Text>
          <View style={styles.inputIconRow}>
            <TextInput
              value={fields.name}
              onChangeText={(name) => setFields({ ...fields, name })}
              autoComplete="name"
              maxLength={24}
              style={[styles.inputField, styles.nameInputField]}
              placeholder="John Calendar"
            ></TextInput>
          </View>
        </View>
      ) : null}
      <View style={styles.inputSection}>
        <Text style={styles.inputFieldSubtitle}>Email</Text>
        <View style={styles.inputIconRow}>
          <TextInput
            value={fields.email}
            onChangeText={(email) => setFields({ ...fields, email })}
            autoComplete="email"
            inputMode="email"
            maxLength={126}
            placeholder="email@email.com"
            style={styles.inputField}
          ></TextInput>
          <Image
            style={styles.inputIcon}
            source={require("../../assets/email_icon64x64.png")}
          ></Image>
        </View>
      </View>
      <View style={styles.inputSection}>
        <Text style={styles.inputFieldSubtitle}>Password</Text>
        <View style={styles.inputIconRow}>
          {/* Password visibility is toggled with the password visibility icon */}
          <TextInput
            value={fields.password}
            onChangeText={(password) => setFields({ ...fields, password })}
            autoComplete={
              mode === "Register" ? "new-password" : "current-password"
            }
            autoCorrect={false}
            maxLength={120}
            secureTextEntry={passwordHidden}
            style={styles.inputField}
            placeholder="*****************"
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
      {mode === "Register" ? (
        <View style={styles.inputSection}>
          <Text style={styles.inputFieldSubtitle}>Confirm Password</Text>
          <View style={styles.inputIconRow}>
            {/* Password visibility is toggled with the password visibility icon */}
            <TextInput
              value={fields.confirmPassword}
              onChangeText={(confirmPassword) =>
                setFields({ ...fields, confirmPassword })
              }
              autoComplete={"new-password"}
              autoCorrect={false}
              maxLength={120}
              secureTextEntry={passwordHidden}
              style={styles.inputField}
              placeholder="*****************"
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
      ) : null}
    </>
  );
}

// Validate input on the frontend to align with backend pydantic validation
function validateCreateUser(fields) {
  // Use regular expressions to check if an email is valid -> Currently not perfect logic, however good enough for current scope
  // [a-zA-z0-9._%+-] -> Match any characters from A-Z (any case), from 0-9 or one of [. _ % + -]
  // + <- match the preceding token atleast once
  // @ -> match the symbol @
  // \. -> match the symbol "."
  // .+ -> match any characters at least once
  fields.email = fields.email.trim();
  fields.name = fields.name.trim();

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
  if (fields.password !== fields.confirmPassword) {
    return "Passwords do not match";
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
    let data;
    try {
      const registerUrl = API_URL + "/authentication/create_user";
      const response = await fetch(registerUrl, {
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
      data = await response.json(); // the created users id
      if (!response.ok) {
        setErrorMessage(getAuthenticationErrorMessage(data));
        return false;
      }
    } catch (error) {
      setErrorMessage("An unkown error occured");
      console.error("Error: ", error);
      return false;
    }
    return data;
  }
  const result = await registerAccount();
  if (result) {
    setErrorMessage("");
    onLogin(result);
  }
}

function validateLoginUser(fields) {
  // Prevent incorrect login messages when user accidentally adds whitespace
  fields.email = fields.email.trim();

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
    let data;
    try {
      const authenticateUrl = API_URL + "/authentication/login";
      const response = await fetch(authenticateUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: fields.email,
          password: fields.password,
        }),
      });
      data = await response.json();
      if (!response.ok) {
        setErrorMessage(getAuthenticationErrorMessage(data, "Authenticate"));
        return false;
      }
    } catch (error) {
      setErrorMessage("An unkown error occured");
      console.error("Error: ", error);
      return false;
    }
    return data;
  }
  const result = await authenticateAccount();
  if (result) {
    setErrorMessage("");
    onLogin(result);
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
  title: {
    textAlign: "center",
    fontSize: 26,
    paddingBottom: 20,
  },
  authenticationSwitcher: {
    width: "70%",
    flexDirection: "row",
    borderStyle: "solid",
    borderRadius: 10,
    borderWidth: 2,
    height: 65,
  },
  screen: {
    alignItems: "center", // Center content horizontally
    justifyContent: "center", // Center content vertically
    gap: 15,
    flex: 1,
  },
  keyboardAvoid: {
    width: "100%",
    flex: 1,
  },
  authScrollView: {
    width: "100%",
  },
  authContainerScroll: {
    alignItems: "center",
    gap: 15,
    justifyContent: "center",
  },
  currentMode: {
    backgroundColor: BLUE_COLOUR, // In the future move this too a dedicated theme file with chosen themed colours -> And all other colours
  },
  nonCurrentMode: {
    backgroundColor: "white",
  },

  authenticationMode: {
    padding: 10,
    flex: 1, // Make both modes the exact same size
    alignItems: "center", // Center text horizontally,
    justifyContent: "center", // Center text vertically
  },
  authenticationModeText: {
    fontSize: 24,
  },
  loginMode: {
    borderTopLeftRadius: 7, // Should be exactly authenticationSwitcher.borderRadius - authenticationSwitcher.borderWidth
    borderBottomLeftRadius: 7,
  },
  registerMode: {
    borderTopRightRadius: 7,
    borderBottomRightRadius: 7,
  },
  errorMessage: {
    color: RED_WARNING_COLOUR,
  },

  inputIconRow: {
    width: "75%",
    flexDirection: "row",
    alignItems: "center",
    borderStyle: "solid",
    borderWidth: 2,
    borderRadius: 5,
  },

  inputIcon: {
    width: 32,
    height: 32,
    margin: 5,
    marginRight: 10,
  },

  inputField: {
    marginLeft: 10,
    minWidth: 0,
    flex: 1,
    paddingVertical: 15,
    fontSize: 18,
  },
  inputFieldSubtitle: {
    fontSize: 22,
  },
  nameInputField: {
    minHeight: 34,
  },
  inputSection: {
    flexDirection: "column",
    alignItems: "center",
    gap: 5,
  },

  submitButton: {
    margin: 5, // Outside the button
    backgroundColor: BLUE_COLOUR,
    borderStyle: "solid",
    borderRadius: 10,
    borderWidth: 1,
    paddingVertical: 15, // Inside the button
    paddingHorizontal: 50,
  },
  submitButtonText: {
    fontSize: 24,
  },
});
