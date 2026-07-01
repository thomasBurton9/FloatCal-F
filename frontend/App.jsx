import { useState } from "react";
import { Text } from "react-native";
import AuthenticationScreen from "./src/screens/AuthenticationScreen";

// const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function App() {
  const [user, setUser] = useState(null); // Currently no proper authentication except a variable

  if (!user) {
    return (
      <AuthenticationScreen
        onLogin={() => setUser(true)}
      ></AuthenticationScreen>
    );
  } else {
    return (
      <>
        <Text>Login Successful</Text>
      </>
    );
  }
}
