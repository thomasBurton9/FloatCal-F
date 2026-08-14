import {
  Alert,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { ImageSourcePropType } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type {
  CalendarItem,
  itemEditDraft,
  ItemInfoModalProps,
  updatesType,
} from "../types/calendarItems";
import { addMinutesToDateTime, extractTime } from "../helpers/dateHelpers";
import calendarIcon from "../../assets/calendar_icon64x64.png";
import clockIcon from "../../assets/clock_icon64x64.png";
import recurrenceIcon from "../../assets/recurrence_icon64x64.png";
import reminderIcon from "../../assets/reminder_bell_icon64x64.png";
import { deleteItem } from "../api/itemApi";
import { useEffect, useState } from "react";
import ItemEditForm from "./ItemEditForm";
import { updateItem } from "../api/itemsApi";
import { SecondTopBarProps } from "../types/itemInfo";

// TODO: Make it align perfectly with design tools
export default function ItemInfoModal({
  isVisible,
  item,
  setCurrentModal,
  returnModal,
  setReturnModal,
  onChangedData,
}: ItemInfoModalProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<itemEditDraft | null>(null);

  function beginEditing() {
    if (!item) {
      return;
    }

    setDraft(calendarItemToDraft(item));
    setEditing(true);
  }

  function cancelEditing() {
    setDraft(null);
    setEditing(false);
  }

  async function saveChanges() {
    if (!item || !draft) {
      console.error("No item available");
      return;
    }
    const isTask = "duration_minutes" in item;

    let payload: updatesType = {
      name: draft.name,
      date: draft.date,
      notes: draft.notes,
      recurrence_rule: draft.recurrence_rule,
      reminder: draft.reminder,
    };

    if ("duration_minutes" in draft) {
      // Not using isTask given, typying worries about values being null
      payload.duration_minutes = draft.duration_minutes;
      payload.preferred_window = draft.preferred_window;
      payload.scheduled_start = draft.scheduled_start;
      payload.manually_scheduled = draft.manually_scheduled;
    } else {
      payload.start_time = draft.start_time;
      payload.end_time = draft.end_time;
    }

    const itemId = isTask ? item.task_id : item.event_id;
    const itemType = isTask ? "task" : "event";

    const result = await updateItem(
      item.calendar_id,
      itemId,
      itemType,
      payload,
    );

    if (!result.success) {
      Alert.alert("Error updating item");
      return;
    } else {
      onChangedData();
      // Maybe somehow slow stuff down here -> Given the data does not reload in time
      Alert.alert("Editing Item success");
      cancelEditing();
      return;
    }
  }
  useEffect(() => {
    setEditing(false); // Un needed?
    setDraft(item ? calendarItemToDraft(item) : null);
  }, [item, isVisible]); // Reset the draft if a new item is opened

  function closeModal() {
    setCurrentModal(returnModal);
    setReturnModal(null);
  }

  return (
    <Modal
      transparent
      animationType="slide"
      allowSwipeDismissal={true}
      onRequestClose={closeModal}
      visible={isVisible}
    >
      <SafeAreaView style={styles.itemInfoModal} edges={["top", "bottom"]}>
        <View style={styles.itemInfoContainer}>
          <View style={styles.topBar}>
            {editing ? (
              <>
                <Pressable style={styles.editButton} onPress={cancelEditing}>
                  <Text style={styles.editButtonText}>Cancel</Text>
                </Pressable>
                <Pressable style={styles.editButton} onPress={saveChanges}>
                  <Text style={styles.editButtonText}>Save</Text>
                </Pressable>
              </>
            ) : (
              <>
                <Pressable style={styles.closeButton} onPress={closeModal}>
                  <Text style={styles.closeButtonText}>X</Text>
                </Pressable>
                <Pressable style={styles.editButton} onPress={beginEditing}>
                  <Text style={styles.editButtonText}>Edit</Text>
                </Pressable>
              </>
            )}
          </View>
          {item ? (
            editing && draft ? (
              <ItemEditForm
                item={item}
                draft={draft}
                setDraft={setDraft}
              ></ItemEditForm>
            ) : (
              <ItemDetails
                item={item}
                onClose={closeModal}
                onChangedData={onChangedData}
              />
            )
          ) : null}
        </View>
      </SafeAreaView>
    </Modal>
  );
}

export function SecondTopBar({ isTask, itemName }: SecondTopBarProps) {

  return <>
    <View style={styles.secondTopBar}>
      <Text style={styles.itemName}>{itemName}</Text>
      <Text style={styles.itemType}>{isTask ? "Floating" : "Fixed"}</Text>
    </View>
  </>
}

function ItemDetails({
  item,
  onClose,
  onChangedData,
}: {
  item: CalendarItem;
  onClose: () => void;
  onChangedData: () => void;
}) {
  const isTask = "duration_minutes" in item; // Checks if the key duration_minutes is in the item object
  const time = isTask
    ? `${formatTaskTime(item)} (${formatDuration(item.duration_minutes)})`
    : `${item.start_time.slice(0, 5)}-${item.end_time.slice(0, 5)} (${formatDuration(getDuration(item.start_time, item.end_time))})`;

  return (
    <View style={styles.itemDetails}>
      <SecondTopBar
        isTask={isTask}
        itemName={item.name}>
      </SecondTopBar>
      <View style={styles.itemDetailsContent}>
        <View style={styles.infoRow}>
          <Text style={styles.dateLabel}>{formatDate(item.date)}</Text>
        </View>
        <InfoRow icon={clockIcon} label="Time:" value={time} />
        <InfoRow
          icon={reminderIcon}
          label="Reminder:"
          value={item.reminder ? "on" : "off"}
        />
        <InfoRow
          icon={recurrenceIcon}
          label="Recurrence:"
          value={item.recurrence_rule || "Does not repeat"}
        />
        <InfoRow
          icon={calendarIcon}
          label="Calendar:"
          value={item.calendar_name}
        />
        {item.notes ? (
          <View style={styles.notesContainer}>
            <Text style={styles.notesLabel}>Notes: </Text>
            <Text style={styles.notes}>{item.notes}</Text>
          </View>
        ) : null}
        <View style={styles.deleteButtonRow}>
          <Pressable
            style={styles.deleteButton}
            onPress={async () => {
              const itemType = isTask ? "task" : "event";
              const itemId = isTask ? item.task_id : item.event_id;
              const result = await deleteItem(
                item.calendar_id,
                itemId,
                itemType,
              );
              if (result.success) {
                onChangedData();
                onClose();
                Alert.alert("Item deleted successfully");
              } else {
                Alert.alert("Error deleting item", "Please try again");
              }
            }}
          >
            <Text style={styles.deleteButtonText}>
              Delete {isTask ? "Task" : "Event"}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: ImageSourcePropType;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoSubRow}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Image source={icon} style={styles.infoIcon} />
      </View>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function calendarItemToDraft(item: CalendarItem): CalendarItem {
  return item; // QUICK TODO:
}
// Takes in a duration and formats it as HH:MM
function formatDuration(duration: number): string {
  const hours = Math.floor(duration / 60);
  const minutes = String(duration % 60).padStart(2, "0");

  return `${hours}:${minutes}`;
}
// Takes in start time and end time from a fixed tasks and returns a duration
function getDuration(start_time: string, end_time: string): number {
  const startHours = parseInt(start_time.slice(0, 2));
  const startMinutes = parseInt(start_time.slice(3, 5));
  const endHours = parseInt(end_time.slice(0, 2));
  const endMinutes = parseInt(end_time.slice(3, 5));

  const duration = (endHours - startHours) * 60 + (endMinutes - startMinutes);

  return duration;
}

// Inputs YYYY-MM-DD , outputs Day, Mon DD, YYYY
function formatDate(date: string): string {
  const [year, month, day] = date.split("-").map(Number);
  const parsedDate = new Date(year, month - 1, day);
  const weekday = parsedDate.toLocaleDateString("en-US", { weekday: "long" });
  const monthName = parsedDate.toLocaleDateString("en-US", { month: "short" }); // i.e. Jan instead of January

  return `${weekday}, ${monthName} ${String(day).padStart(2, "0")}, ${year}`;
}

function formatTaskTime(
  task: Extract<CalendarItem, { duration_minutes: number }>,
) {
  if (!task.scheduled_start) {
    return "Not scheduled";
  }

  const endDateTime = addMinutesToDateTime(
    task.date,
    task.scheduled_start,
    task.duration_minutes,
  );
  return `${task.scheduled_start.slice(0, 5)}-${extractTime(endDateTime)}`;
}

const styles = StyleSheet.create({
  itemInfoModal: {
    paddingBottom: 0,
    marginBottom: 0,
    flex: 1,
    paddingTop: 40,
    backgroundColor: "rgba(0, 0, 0, 0.12)",
  },
  itemInfoContainer: {
    width: "97%",
    maxHeight: "100%",
    flex: 1,
    alignSelf: "center",
    backgroundColor: "white",
    borderStyle: "solid",
    borderWidth: 2,
    borderRadius: 40,
    // padding: 12,
    paddingTop: 0,
  },
  topBar: {
    width: "100%",
    alignSelf: "center",
    position: "relative",
    height: 55,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingTop: 20,
  },
  closeButton: {
    // top: "60%",
    width: 34,
    height: 34,
    borderStyle: "solid",
    borderWidth: 2,
    borderRadius: 100,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  closeButtonText: {
    textAlign: "center",
    fontSize: 22,
    lineHeight: 30,
  },
  title: {
    fontSize: 27,
    textAlign: "center",
  },
  editButton: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 5,
    borderStyle: "solid",
    borderWidth: 2,
    borderRadius: 10,
  },
  editButtonText: {
    fontSize: 20,
    textAlign: "center",
  },
  itemDetails: {
    width: "100%",
    paddingVertical: 12,
    gap: 16,
  },
  itemDetailsContent: {
    padding: 12,
    paddingTop: 0,
    gap: 5,
  },
  secondTopBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#4E95D9",
    padding: 10,
    gap: 10,
    width: "100%",
  },
  itemName: {
    fontSize: 20,
    textAlign: "center",
  },
  itemType: {
    textAlign: "center",
    fontSize: 17,
    paddingHorizontal: 20,
    backgroundColor: "#156082",
    borderStyle: "solid",
    borderWidth: 2,
  },
  infoRow: {
    minHeight: 40,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  infoSubRow: {
    minHeight: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 20,
    borderWidth: 2,
    borderRadius: 10,
    padding: 5,
    minWidth: 160,
  },
  infoIcon: {
    width: 28,
    height: 28,
  },
  infoLabel: {
    fontSize: 18,
    borderStyle: "solid",
  },
  notesLabel: {
    fontSize: 18,
    borderStyle: "solid",
    borderWidth: 2,
    padding: 8,
    borderRadius: 10,
    alignSelf: "flex-start",
  },
  dateLabel: {
    fontSize: 18,
  },
  infoValue: {
    flex: 1,
    fontSize: 18,
    textAlign: "right",
  },
  notesContainer: {
    gap: 6,
  },
  notes: {
    fontSize: 17,
  },
  deleteButtonRow: {
    alignItems: "center",
    justifyContent: "center",
  },
  deleteButton: {
    backgroundColor: "red",
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderStyle: "solid",
    borderWidth: 2,
    borderRadius: 5,
  },
  deleteButtonText: {
    fontSize: 17,
    textAlign: "center",
  },
});
