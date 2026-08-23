import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useEffect, useState } from "react";
import AuthenticationScreen from "./src/screens/AuthenticationScreen";
import SettingsScreen from "./src/screens/SettingsScreen";
import DailyCalendar from "./src/screens/DailyCalendar";
import { SafeAreaView } from "react-native-safe-area-context"; // Prevent app from using space reserved for the os
import AsyncStorage from "@react-native-async-storage/async-storage";
// import { API_URL } from "./src/constants.js"

export default function App() {
  return (
    <>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <PageRouter></PageRouter>
      </GestureHandlerRootView>
    </>
  );
}

function PageRouter() {
  const [user, setUser] = useState(null); // Currently no proper authentication except a variable

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

  const [page, setPage] = useState("");
  if (!user) {
    return (
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
