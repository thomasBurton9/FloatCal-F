import { Image, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import type { ImageSourcePropType } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { CalendarItem, ItemInfoModalProps } from "../types/calendarItems";
import { addMinutesToDateTime, extractTime } from "../helpers/dateHelpers";
import calendarIcon from "../../assets/calendar_icon64x64.png";
import clockIcon from "../../assets/clock_icon64x64.png";
import recurrenceIcon from "../../assets/recurrence_icon64x64.png";
import reminderIcon from "../../assets/reminder_bell_icon64x64.png";

export default function ItemInfoModal({
  isVisible,
  item,
  setCurrentModal,
}: ItemInfoModalProps) {
  function closeModal() {
    setCurrentModal(null);
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
            <Pressable style={styles.closeButton} onPress={closeModal}>
              <Text style={styles.closeButtonText}>X</Text>
            </Pressable>
            <Text style={styles.title}>Item Information</Text>
          </View>
          {item ? <ItemDetails item={item} /> : null}
        </View>
      </SafeAreaView>
    </Modal>
  );
}

function ItemDetails({ item }: { item: CalendarItem }) {
  const isTask = "duration_minutes" in item;
  const time = isTask
    ? `${formatTaskTime(item)} (${item.duration_minutes} minutes)`
    : `${item.start_time.slice(0, 5)}-${item.end_time.slice(0, 5)}`;

  return (
    <View style={styles.itemDetails}>
      <Text style={styles.itemName}>{item.name}</Text>
      <Text style={styles.itemType}>
        {isTask ? "Floating task" : "Fixed event"}
      </Text>
      <InfoRow
        icon={calendarIcon}
        label="Calendar"
        value={item.calendar_name}
      />
      <InfoRow icon={clockIcon} label="Time" value={time} />
      <InfoRow
        icon={recurrenceIcon}
        label="Recurrence"
        value={item.recurrence_rule || "Does not repeat"}
      />
      <InfoRow
        icon={reminderIcon}
        label="Reminder"
        value={item.reminder ? "on" : "off"}
      />
      {item.notes ? (
        <View style={styles.notesContainer}>
          <Text style={styles.infoLabel}>Notes</Text>
          <Text style={styles.notes}>{item.notes}</Text>
        </View>
      ) : null}
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
      <Image source={icon} style={styles.infoIcon} />
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
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
    top: "60%",
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
  itemDetails: {
    width: "100%",
    padding: 12,
    gap: 16,
  },
  itemName: {
    fontSize: 27,
    textAlign: "center",
  },
  itemType: {
    textAlign: "center",
    fontSize: 17,
  },
  infoRow: {
    minHeight: 40,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  infoIcon: {
    width: 28,
    height: 28,
  },
  infoLabel: {
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
});
