import { SafeAreaView } from "react-native-safe-area-context";
import { SchedulingErrorProps } from "../types/manageTasks";
import {
  Modal,
  StyleSheet,
  View,
  Pressable,
  Text,
  Image,
  Alert,
} from "react-native";
import { deleteTask } from "../api/itemApi";

export default function SchedulingError({
  isVisible,
  setCurrentModal,
  setPage,
  task,
}: SchedulingErrorProps) {
  return (
    <Modal
      transparent
      animationType="slide"
      allowSwipeDismissal={true}
      onRequestClose={() => setCurrentModal(null)}
      visible={isVisible}
    >
      <SafeAreaView
        style={styles.schedulingErrorModal}
        edges={["top", "bottom"]}
      >
        <View style={styles.schedulingErrorContainer}>
          <View style={styles.topBar}>
            <Pressable
              style={styles.closeButton}
              onPress={() => setCurrentModal(null)}
            >
              <Text style={styles.closeButtonText}>X</Text>
            </Pressable>
            <View style={styles.content}>
              <Image
                source={require("../../assets/warning_icon128x128.png")}
                style={styles.warningIcon}
              ></Image>
              <Text>Unable to Schedule Task</Text>
              <View style={styles.messageBox}>
                <Text style={styles.message}>
                  No available time slot found for task:{" "}
                </Text>
                <Text style={styles.taskSummary}>
                  {task
                    ? `${task["name"]} ${task["durationMinutes"]} min`
                    : "Error: No task provided"}
                </Text>
              </View>
              <View style={styles.actionGrid2x2}>
                <Pressable
                  onPress={() => handleChangeSettings(setPage, setCurrentModal)}
                >
                  <Text>Change Settings</Text>
                </Pressable>
                <Pressable onPress={() => handleManuallySchedule()}>
                  <Text>Manually Schedule Task</Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    if (task) {
                      handleDeleteTask(
                        task.taskId,
                        task.calendarId,
                        setCurrentModal,
                      );
                    } else {
                      Alert.alert("Error: Task not found");
                    }
                  }}
                >
                  <View style={styles.deleteTaskContent}>
                    <Text>Delete Task</Text>
                    <Image
                      source={require("../../assets/trash_icon64x64.png")}
                    ></Image>
                  </View>
                </Pressable>
                <Pressable
                  onPress={() => handleLeaveUnscheduled(setCurrentModal)}
                >
                  <Text>Leave Unscheduled</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

function handleChangeSettings(
  setPage: (pageName: string) => void,
  setCurrentModal: (currentModal: string | null) => void,
): void {
  setCurrentModal(null);
  setPage("Settings");
}

function handleManuallySchedule(): void {
  Alert.alert("Not implemented");
}

async function handleDeleteTask(
  taskId: number,
  calendarId: number,
  setCurrentModal: (currentModal: string | null) => void,
): Promise<void> {
  const result = await deleteTask(calendarId, taskId);

  if (result.success) {
    setCurrentModal(null);
  } else {
    Alert.alert("Unable to delete task", "Please try again");
  }
}

function handleLeaveUnscheduled(
  setCurrentModal: (currentModal: string | null) => void,
): void {
  setCurrentModal(null);
}

const styles = StyleSheet.create({
  schedulingErrorModal: {
    paddingBottom: 0,
    marginBottom: 0,
    flex: 1,
    paddingTop: 40,
    backgroundColor: "rgba(0, 0, 0, 0.12)",
  },
  schedulingErrorContainer: {
    width: "97%",
    // maxWidth: 600, TODO: May be needed for different views: i.e. Ipad
    maxHeight: "100%",
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
    height: 55,
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
  content: {},
  warningIcon: {},
  messageBox: {},
  message: {},
  taskSummary: {},
  actionGrid2x2: {},
  deleteTaskContent: {},
});
