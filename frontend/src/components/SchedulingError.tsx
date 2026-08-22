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
import { deleteItem } from "../api/itemApi";

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
          </View>
          <View style={styles.content}>
            <Image
              source={require("../../assets/warning_icon128x128.png")}
              style={styles.warningIcon}
            ></Image>
            <Text style={styles.title}>Unable to Schedule Task</Text>
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
                style={styles.actionButton}
                onPress={() => handleChangeSettings(setPage, setCurrentModal)}
              >
                <Text style={styles.actionButtonText}>Change Settings</Text>
              </Pressable>
              <Pressable
                style={[styles.actionButton, styles.recommendedOption]}
                onPress={() => handleManuallySchedule(setCurrentModal)}
              >
                <Text style={styles.actionButtonText}>
                  Manually Schedule Task
                </Text>
              </Pressable>
              <Pressable
                style={styles.actionButton}
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
                  <Text style={styles.actionButtonText}>Delete Task</Text>
                  <Image
                    style={styles.deleteIcon}
                    source={require("../../assets/trash_icon64x64.png")}
                  ></Image>
                </View>
              </Pressable>
              <Pressable
                style={styles.actionButton}
                onPress={() => handleLeaveUnscheduled(setCurrentModal)}
              >
                <Text style={styles.actionButtonText}>Leave Unscheduled</Text>
              </Pressable>
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

function handleManuallySchedule(
  setCurrentModal: (currentModal: string | null) => void,
): void {
  setCurrentModal("manuallySchedule");
}

async function handleDeleteTask(
  taskId: number,
  calendarId: number,
  setCurrentModal: (currentModal: string | null) => void,
): Promise<void> {
  const result = await deleteItem(calendarId, taskId, "task");

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
    flex: 1,
    padding: 16, // Make the modal appear smaller than the others, more of a gap around it
    backgroundColor: "rgba(0, 0, 0, 0.12)",
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 200,
    paddingTop: 70,
  },
  schedulingErrorContainer: {
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
  warningIcon: {
    width: 96,
    height: 96, // Adjust these for responsive design
  },
  messageBox: {
    width: "87%", // Inline with design tools
    justifyContent: "center",
    alignItems: "center",
    padding: 15,
    backgroundColor: "lightblue", // Potentially change to be responsive based on the calendar id of the task
    borderStyle: "solid",
    borderWidth: 2,
    minHeight: 100,
  },
  message: {
    fontSize: 20,
    textAlign: "center",
    lineHeight: 26, // Separate this + taskSummary from each other
  },
  taskSummary: {
    fontSize: 17, // Same size as 'message'
    textAlign: "center",
    lineHeight: 26,
  },
  actionGrid2x2: {
    width: "95%",
    // Create a 2x2 grid
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    justifyContent: "center",
  },
  deleteTaskContent: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center", // Vertically align
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    textAlign: "center",
  },
  actionButton: {
    width: "48%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
    borderStyle: "solid",
    borderRadius: 10,
    borderWidth: 2,
    padding: 6,
  },
  recommendedOption: {
    backgroundColor: "grey",
  },
  actionButtonText: {
    textAlign: "center",
  },
  deleteIcon: {
    width: 24,
    height: 24,
  },
});
