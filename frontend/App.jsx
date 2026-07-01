import { useState } from "react";
import { Pressable, Text } from "react-native";
import AuthenticationScreen from "./src/screens/AuthenticationScreen";
import { SafeAreaView } from "react-native-safe-area-context"; // Prevent app from using space reserved for the os

// const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function App() {
  const [user, setUser] = useState(null); // Currently no proper authentication except a variable

  if (!user) {
    return (
      <SafeAreaView>
        <AuthenticationScreen
          onLogin={() => setUser(true)}
        ></AuthenticationScreen>
      </SafeAreaView>
    );
  } else {
    return (
      <>
        <SafeAreaView>
          <Text>Login Successful</Text>
          {/* Temporary logout */}
          <Pressable onPress={() => setUser(false)}>
            <Text>Logout</Text>
          </Pressable>
        </SafeAreaView>
      </>
    );
  }
}
