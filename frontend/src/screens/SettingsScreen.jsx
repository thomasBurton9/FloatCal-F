import { useEffect, useState, useMemo } from "react";
import {
  Text,
  View,
  Pressable,
  Switch,
  PanResponder,
  ScrollView,
} from "react-native";
import { fetchSettings, updateSettings } from "../api/settingsApi";
import BufferEditor from "../components/settings/BufferEditor";
import SchedulingWindowsEditor from "../components/settings/SchedulingWindowsEditor";
import SleepWindowEditor from "../components/settings/SleepWindowEditor";
import { style } from "../components/settings/settingsStyles";
import { handleDeleteAccount } from "../components/settings/deleteAccount";
import { GREEN_COLOUR } from "../constants";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function SettingsScreen({ userId, setUserId, setPage }) {
  const [settings, setSettings] = useState(null);
  const [editingKey, setEditingKey] = useState(null); // Which setting is the user currently editing

  const [sleepStart, setSleepStart] = useState(null);
  const [sleepEnd, setSleepEnd] = useState(null);
  const [bufferMinutes, setBufferMinutes] = useState(null);
  const [schedulingWindows, setSchedulingWindows] = useState([]);

  // Allow for swipe right gesture to change screens.
  // Using useMemo instead of useRef as in docs due to linter errors
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        // Only initialise when gesture is large enough and in the right direction
        onMoveShouldSetPanResponder: (_, gesture) =>
          gesture.dx > 12 && Math.abs(gesture.dx) > Math.abs(gesture.dy),

        // If gesture is completed and is large enough -> change screen
        onPanResponderRelease: (_, gesture) => {
          if (gesture.dx > 40 && Math.abs(gesture.dx) > Math.abs(gesture.dy)) {
            // TODO: Configure gesture strength based on testing, add button to change page.
            setPage("DailyCalendar");
          }
        },
      }),
    [setPage],
  ); // Prevent re rendering page every time state changes

  useEffect(() => {
    // Defining function inside useEffect to prevent cascading renders??
    // Dictated by linter

    async function loadSettings() {
      const settingsData = await fetchSettings(userId);
      if (settingsData) {
        console.log("Settings", settingsData);
        setSettings(settingsData);
      }
    }
    loadSettings();
  }, [userId]); // Only run when userId changes and not when
  // settings changes to prevent cascading renders
  return (
    <>
      <ScrollView>
        <View {...panResponder.panHandlers} style={style.screen}>
          <Pressable
            style={style.backButton}
            onPress={() => setPage("DailyCalendar")}
          >
            <Text style={style.backButtonText}>{"<"}</Text>
          </Pressable>
          <View>
            <Text style={style.title}>Settings</Text>
          </View>
          <View style={style.settingsSection}>
            <Text style={style.subTitle}>Scheduler</Text>
            <SleepWindowEditor
              userId={userId}
              settings={settings}
              setSettings={setSettings}
              editingKey={editingKey}
              setEditingKey={setEditingKey}
              sleepStart={sleepStart}
              setSleepStart={setSleepStart}
              sleepEnd={sleepEnd}
              setSleepEnd={setSleepEnd}
            />
            <BufferEditor
              userId={userId}
              settings={settings}
              setSettings={setSettings}
              editingKey={editingKey}
              setEditingKey={setEditingKey}
              bufferMinutes={bufferMinutes}
              setBufferMinutes={setBufferMinutes}
            />
            <SchedulingWindowsEditor
              userId={userId}
              settings={settings}
              setSettings={setSettings}
              editingKey={editingKey}
              setEditingKey={setEditingKey}
              schedulingWindows={schedulingWindows}
              setSchedulingWindows={setSchedulingWindows}
            />
          </View>
          <View style={style.settingsSection}>
            <Text style={style.subTitle}>Notifications</Text>
            {/* Use react native - Switch for this - Done */}
            <View style={style.individualSetting}>
              <View style={style.individualSettingRow}>
                <Text style={style.individualSettingInfo}>Notifications: </Text>
                <View style={style.editSettingsButton}>
                  <Switch
                    trackColor={{ true: GREEN_COLOUR }}
                    value={
                      settings
                        ? Boolean(settings["notifications_enabled"])
                        : false // When settings has not been loaded, this defaults to false, however
                      // The switch will be disabled if settings is not loaded
                    }
                    /* Lag may be noticable -> possibly switch to updating local state then calling the api */
                    onValueChange={async (value) =>
                      await updateSettings(
                        userId,
                        { notifications_enabled: value },
                        setSettings,
                      )
                    }
                    disabled={settings ? false : true}
                  ></Switch>
                </View>
              </View>
            </View>
            {/*
              <View style={style.individualSetting}>
                <View style={style.individualSettingRow}>
                  <Text style={style.individualSettingInfo}>
                    Sound:{" "}
                    {settings ? settings["notification_sound"] : "Loading..."}
                  </Text>
                   This won't be implemented currently, given expo go does not support custom notifications
              if a workaround is found, this buttons functionality will start working
                 TODO: Remove this setting from rendering
                  <Pressable style={style.editSettingsButton}>
                    <Text>{">"}</Text>
                  </Pressable>
                </View>
              </View> */}
          </View>
          <View style={[style.settingsSection, style.accountSection]}>
            <Text style={style.subTitle}>Account</Text>
            <Pressable
              style={style.logoutButton}
              onPress={async () => {
                setUserId(false);
                await AsyncStorage.removeItem("floatcal.userId");
              }}
            >
              <Text>Logout</Text>
            </Pressable>
            <Pressable
              style={style.deleteAccountButton}
              onPress={() => handleDeleteAccount(userId, setUserId)}
            >
              <Text>Delete Account</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </>
  );
}
