import { useState } from "react";
import AuthenticationScreen from "./src/screens/AuthenticationScreen";
import SettingsScreen from "./src/screens/SettingsScreen";
import DailyCalendar from "./src/screens/DailyCalendar";
import { SafeAreaView } from "react-native-safe-area-context"; // Prevent app from using space reserved for the os
// import { API_URL } from "./src/constants.js"

export default function App() {
  const [user, setUser] = useState(null); // Currently no proper authentication except a variable
  const [page, setPage] = useState("");
  if (!user) {
    return (
      <SafeAreaView>
        <AuthenticationScreen
          onLogin={(id) => {
            setPage("Settings");
            setUser(id);
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
          <SafeAreaView>
            <DailyCalendar></DailyCalendar>
          </SafeAreaView>
        </>
      );
    }
  }
}
