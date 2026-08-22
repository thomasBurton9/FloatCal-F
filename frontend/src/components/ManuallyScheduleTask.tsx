import { ManuallyScheduleTaskProps } from "../types/manuallyScheduleTasks";
import { Modal, View, StyleSheet, Text, Pressable, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { formatDateUser, formatTime } from "../helpers/dateHelpers";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useEffect, useState } from "react";
import { updateItem } from "../api/itemsApi";
import { updatesType } from "../types/calendarItems";
import { BLUE_COLOUR } from "../constants";

export default function ManuallyScheduleTask({
  task,
  isVisible,
  setCurrentModal,
  onItemAdded,
}: ManuallyScheduleTaskProps) {
  const [scheduledTime, setScheduledTime] = useState(new Date());

  useEffect(() => {
    if (isVisible) {
      setScheduledTime(new Date());
    }
  }, [isVisible, task.taskId]); // Make sure that the scheduled time is not saved from the last entry
  return (
    <Modal
      transparent
      animationType="slide"
      allowSwipeDismissal={true}
      onRequestClose={() => setCurrentModal(null)}
      visible={isVisible}
    >
      <SafeAreaView
        style={styles.manuallyScheduleModal}
        edges={["top", "bottom"]}
      >
        <View style={styles.manuallyScheduleContainer}>
          <View style={styles.topBar}>
            <Pressable
              style={styles.closeButton}
              onPress={() => setCurrentModal(null)}
            >
              <Text style={styles.closeButtonText}>X</Text>
            </Pressable>
          </View>
          <View style={styles.content}>
            <Text style={styles.title}>Manually Schedule Task</Text>
            <View style={styles.infoBox}>
              <Text style={styles.taskName}>{task.name}</Text>
              <Text>Date: {formatDateUser(task.date)}</Text>
              <Text>Duration: {task.durationMinutes} minutes</Text>
            </View>
            <Text style={styles.pickStartText}>Pick start time for task:</Text>
            <DateTimePicker
              value={scheduledTime}
              mode="time"
              is24Hour={true}
              onChange={(_, scheduledTime) => {
                if (!scheduledTime) {
                  return;
                }
                setScheduledTime(scheduledTime);
              }}
            ></DateTimePicker>
            <Pressable
              style={styles.manuallyScheduleButton}
              onPress={async () => {
                const updates: updatesType = {
                  manually_scheduled: true,
                  scheduled_start: formatTime(scheduledTime),
                };
                const result = await updateItem(
                  task.calendarId,
                  task.taskId,
                  "task",
                  updates,
                );

                if (!result.success) {
                  if (result.error) {
                    Alert.alert(result.error);
                  } else {
                    Alert.alert("Error setting start time for task");
                  }
                } else {
                  Alert.alert("Task manually scheduled successfully");
                  setCurrentModal(null);
                  onItemAdded();
                }
              }}
            >
              <Text>Manually Schedule</Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  manuallyScheduleModal: {
    flex: 1,
    padding: 16, // Make the modal appear smaller than the others, more of a gap around it
    backgroundColor: "rgba(0, 0, 0, 0.12)",
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 200,
    paddingTop: 70,
  },

  manuallyScheduleContainer: {
    width: "100%",
    // maxWidth: 600, TODO: May be needed for different views: i.e. Ipad
    // maxHeight: "100%",
    gap: 8,
    flex: 1,
    alignSelf: "center",
    alignItems: "center",
    backgroundColor: "white",
    borderStyle: "solid",
    borderWidth: 2,
    borderRadius: 40,
    padding: 12,
    paddingTop: 0,
  },
  topBar: {
    width: "100%",
    alignSelf: "center",
    position: "relative",
    height: 32, // Adjust the position of the X button using this
    justifyContent: "center",
  },
  closeButton: {
    top: "60%", // Currently aligned using trial and error TODO: Make permament / responsive

    width: 34, // This is not responsive either
    height: 34,

    // Make Button circular
    borderStyle: "solid",
    borderWidth: 2,
    borderRadius: 100,

    // Center child text in the middle
    alignItems: "center",
    justifyContent: "center",

    zIndex: 1, // Make this element go to the top -> It becomes non functional when removed
  },

  closeButtonText: {
    textAlign: "center",
    fontSize: 22,
    lineHeight: 30,
  },
  content: {
    width: "100%",
    alignItems: "center", // Horizontally center content inside
    gap: 15, // space everything out
  },
  title: {
    fontSize: 24,
    textAlign: "center",
  },
  infoBox: {
    flexDirection: "column",
    gap: 5,
    alignItems: "center",
    borderStyle: "solid",
    borderWidth: 2,
    paddingVertical: 20,
    paddingHorizontal: 40,
    backgroundColor: "lightblue",
  },
  taskName: {
    fontSize: 20,
  },
  pickStartText: {
    fontSize: 18,
  },
  manuallyScheduleButton: {
    backgroundColor: BLUE_COLOUR,
    padding: 15,
    borderRadius: 10,
    borderStyle: "solid",
    borderWidth: 2,
  },
});
