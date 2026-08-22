import { StyleSheet } from "react-native";
import { BLUE_COLOUR, GREEN_COLOUR, RED_WARNING_COLOUR } from "../../constants";

export const style = StyleSheet.create({
  screen: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  settingsSection: {
    width: "100%", // Prevent preferred times window from expanding
    flexDirection: "column",
    alignItems: "center",
  },
  backButton: {
    borderStyle: "solid",
    borderWidth: 1.5,
    borderRadius: 18,
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    // position-absolute allows for individual manipulation
    position: "absolute",
    // top and left indicate the absolute distance from the top and left sides of the screen
    // Currently not responsive at all.
    top: 0,
    left: 16,
  },
  backButtonText: {
    textAlign: "center",
    fontSize: 20,
  },
  individualSettingInfo: {
    paddingLeft: 10,
  },
  individualSetting: {
    width: "75%",
    flexDirection: "column",
    borderStyle: "solid",
    borderWidth: 2,
    borderRadius: 5,
    marginVertical: 10,
  },
  individualSettingRow: {
    justifyContent: "space-between", // Push button/arrow to the far right
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },
  editSettingsButton: {
    padding: 10,
  },
  editSleepSettings: {
    flexDirection: "row",
    gap: 20,
    justifyContent: "center",
  },
  sleepTimePicker: {
    alignItems: "center",
    textAlign: "center",
    width: 110,
  },
  endEditSettings: {
    flexDirection: "row",
    gap: 60, // Use gap instead of margin in the children to standardize the gap.
    justifyContent: "center",
  },
  editSettingsEndButtons: {
    padding: 10,
    borderStyle: "solid",
    borderWidth: 3,
    borderRadius: 25,
    minWidth: 70, // Make the buttons the same size
    alignItems: "center", // Make sure text is in the centre
  },
  saveEditSettingsButton: {
    borderColor: GREEN_COLOUR,
    backgroundColor: GREEN_COLOUR + "B3", // 70% Opacity
  },
  cancelEditSettingsButton: {
    borderColor: RED_WARNING_COLOUR,
    backgroundColor: RED_WARNING_COLOUR + "99", // 60% opacity
  },
  editSettingsDialog: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    gap: 14,
    alignItems: "center", // Help align cancel/save buttons and the inputs
  },
  bufferInputRow: {
    flexDirection: "row",
    gap: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  bufferMinutesInput: {
    borderWidth: 1,
    borderRadius: 5,
    padding: 5,
    width: 50, // Make it look like a proper input
    textAlign: "center",
  },
  sleepDateTimeInput: {
    alignSelf: "center",
    width: 100,
  },
  sleepDateTimeLabel: {
    // width: "70%",
    alignSelf: "center",
  },
  schedulingWindowRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-evenly", // Keep gap between items the same size
    paddingVertical: 10, // Room between items.
  },
  schedulingWindowNameInput: {
    borderWidth: 1,
    borderRadius: 5,
    padding: 5,
    width: 110, // May need to change to be more responsive
    textAlign: "center",
    // flexShrink: 1, // Shrink name input for phones
  },
  schedulingWindowColumn: {
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  // TODO: Add style for delete and add window buttons in scheduling windows
  // TODO: Align the items in the 2 columns, Somehow
  title: {
    fontSize: 28,
    paddingBottom: 10,
  },
  subTitle: {
    fontSize: 20,
    paddingBottom: 5,
  },
  logoutButton: {
    backgroundColor: BLUE_COLOUR,
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 10,
    borderStyle: "solid",
    borderWidth: 1,
    minWidth: 120,
    textAlign: "center",
    justifyContent: "center",
    alignItems: "center",
  },
  deleteAccountButton: {
    backgroundColor: RED_WARNING_COLOUR,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderStyle: "solid",
    borderWidth: 1,
    minWidth: 120,
    textAlign: "center",
    justifyContent: "center",
    alignItems: "center",
  },
  accountSection: {
    gap: 10,
  },
});
