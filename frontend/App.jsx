import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useEffect, useState } from "react";
import AuthenticationScreen from "./src/screens/AuthenticationScreen";
import SettingsScreen from "./src/screens/SettingsScreen";
import DailyCalendar from "./src/screens/DailyCalendar";
import { SafeAreaView } from "react-native-safe-area-context"; // Prevent app from using space reserved for the os
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LogBox } from "react-native";

// Prevent red console errors from showing up on frontend
// They still appear in the console
LogBox.ignoreAllLogs();

export default function App() {
  return (
    <>
      {/* Allow for gestures such as swiping*/}
      <GestureHandlerRootView style={{ flex: 1 }}>
        <PageRouter></PageRouter>
      </GestureHandlerRootView>
    </>
  );
}

function PageRouter() {
  // user is the logged in / out state
  const [user, setUser] = useState(null); // Currently no proper authentication except a variable

  // On load, check if a user session is saved -> if so restore it
  useEffect(() => {
    async function restoreSession() {
      const savedId = await AsyncStorage.getItem("floatcal.userId");
      if (savedId) {
        setUser(Number(savedId));
        setPage("DailyCalendar");
      }
    }
    restoreSession();
  }, []); // Only run on page load

  // Use state used for basic page routing between the auth screen, settings screen and daily calendar view
  const [page, setPage] = useState("");

  // Send user to authentication screen if they are not logged in
  if (!user) {
    return (
      // The safe area view prevents anything from colliding with edges / notch / dynamic island
      <SafeAreaView style={{ flex: 1 }}>
        <AuthenticationScreen
          onLogin={async (id) => {
            setPage("DailyCalendar");
            setUser(id);
            await AsyncStorage.setItem("floatcal.userId", String(id));
          }}
        ></AuthenticationScreen>
      </SafeAreaView>
    );
  } else {
    if (page === "Settings") {
      return (
        <>
          <SafeAreaView>
            <SettingsScreen
              userId={user}
              setUserId={setUser}
              setPage={setPage}
            ></SettingsScreen>
          </SafeAreaView>
        </>
      );
    } else if (page === "DailyCalendar") {
      return (
        <>
          <SafeAreaView style={{ flex: 1 }}>
            {/* Using inline css unless significantly more will be needed */}
            <DailyCalendar setPage={setPage} userId={user}></DailyCalendar>
          </SafeAreaView>
        </>
      );
    }
  }
}
