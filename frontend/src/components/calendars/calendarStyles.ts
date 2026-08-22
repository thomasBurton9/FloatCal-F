import { StyleSheet } from "react-native";
import {
  BLUE_COLOUR,
  GREEN_COLOUR,
  RED_WARNING_COLOUR,
  TEXT_ON_DARK,
} from "../../constants";
export const styles = StyleSheet.create({
  deleteButton: {
    backgroundColor: RED_WARNING_COLOUR,
    padding: 10,
    borderStyle: "solid",
    borderWidth: 1.5,
    borderRadius: 10,
  },
  calendarNameInput: {
    width: "80%",
    minHeight: 40,
    borderStyle: "solid",
    borderWidth: 2,
    borderRadius: 6,
    paddingHorizontal: 8,
  },
  colorPickerText: {
    fontSize: 18,
  },
  colorPicker: {
    width: "60%", // Required to show element properly
    maxHeight: 300,
  },
  colorPreview: {
    height: 30,
    marginVertical: 8,
  },
  createCalendarSubmit: {
    backgroundColor: BLUE_COLOUR,
    borderStyle: "solid",
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 25,
    alignItems: "center",
  },
  createCalendarSubmitText: {
    color: TEXT_ON_DARK,
    fontSize: 16,
  },
  manageCalendarsModal: {
    paddingBottom: 0,
    marginBottom: 0,
    flex: 1,
    paddingTop: 40,
    backgroundColor: "rgba(0, 0, 0, 0.12)",
  },
  manageCalendarsContainer: {
    width: "97%",
    // maxWidth: 600, TODO: May be needed for different views: i.e. Ipad
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
  // Somehow the styling actually worked
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
  title: {
    fontSize: 27,
    textAlign: "center",
  },
  calendarList: {
    width: "100%",
    paddingHorizontal: 6,
  },
  sectionTitle: {
    marginTop: 18,
    marginBottom: 8,
    fontSize: 24,
  },
  calendarButton: {
    minHeight: 56,
    marginBottom: 3,
    borderStyle: "solid",
    borderWidth: 2,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  calendarButtonText: {
    fontSize: 22,
  },
  secondaryButton: {
    minHeight: 54,
    marginBottom: 14,
    borderStyle: "solid",
    borderWidth: 2,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonText: {
    fontSize: 22,
  },
  placeholderView: {
    alignItems: "center",
    gap: 20,
    paddingTop: 20,
  },
  backButton: {
    alignSelf: "flex-start",
    padding: 8,
    borderStyle: "solid",
    borderWidth: 1,
    borderRadius: 6,
  },
  placeholderTitle: {
    fontSize: 24,
  },

  // INVITE SCREEN
  invitesTitle: {
    fontSize: 24,
    marginBottom: 10,
  },
  inviteList: {
    gap: 10,
  },
  inviteSection: {
    flexDirection: "column",
    padding: 10,
    borderStyle: "solid",
    borderWidth: 1.5,
    borderRadius: 10,
    gap: 5,
  },
  inviteCalendarName: {
    fontWeight: "bold",
    fontSize: 20,
  },
  inviteUserName: {},
  inviteAcceptButton: {
    padding: 10,
    borderRadius: 10,
    textAlign: "center",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 5,
  },
  inviteAcceptText: {
    color: TEXT_ON_DARK,
  },
  inviteDeclineButton: {
    backgroundColor: "white",
    padding: 10,
    borderRadius: 10,
    borderStyle: "solid",
    borderWidth: 1,
    textAlign: "center",
    justifyContent: "center",
    alignItems: "center",
  },
  inviteDeclineText: {},

  // Individual Member
  individualMember: {
    flexDirection: "row",
    padding: 10,
    borderStyle: "solid",
    borderWidth: 1.5,
    borderRadius: 10,
    // gap: 100,
    justifyContent: "space-between",
    width: "90%",
  },
  individualMemberInfo: {
    flexDirection: "column",
    gap: 5,
  },
  individualMemberName: {
    fontSize: 28,
  },
  individualMemberEmail: {
    fontSize: 20,
  },
  individualMemberButton: {
    backgroundColor: RED_WARNING_COLOUR,
    borderRadius: 10,
    borderStyle: "solid",
    borderWidth: 1.25,
    textAlign: "center",
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
    width: 100,
  },
  individualMemberButtonText: {
    fontSize: 20,
  },

  // DROPDOWN

  inviteMemberTitle: {
    fontSize: 24,
  },
  userDropDown: {
    minWidth: 260,
    borderStyle: "solid",
    borderWidth: 1.5,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    gap: 0,
  },
  dropDownItem: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    // minWidth: 260,
    // borderStyle: "solid",
    // borderRadius: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    // borderLeftWidth: 1.5,
    // borderRightWidth: 1.5,
    // minHeight: 48,
  },
  dropDownName: {
    fontWeight: "bold",
  },
  dropDownEmail: {
    fontSize: 13,
  },

  // DROPDOWN SUBMIT BUTTON

  sendInviteButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: BLUE_COLOUR,
    borderRadius: 10,
    borderWidth: 1.5,
    borderStyle: "solid",
  },
  sendInviteText: {
    fontSize: 16,
  },
  detailColourText: {
    fontSize: 20,
  },

  // Update calendar
  secondRowCalendars: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 5,
  },
  editButton: {
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
  },
  cancelButton: {
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
  },
  saveButton: {
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    backgroundColor: GREEN_COLOUR,
  },
  editNameRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },
  editNameInput: {
    borderRadius: 5,
    borderWidth: 1.5,
    padding: 5,
    minWidth: 150,
  },
  editTitle: {
    fontSize: 24,
  },
  updateCalendarBaseText: {
    fontSize: 20,
  },
});

export const calendarTheme = {
  colors: {
    primary: BLUE_COLOUR,
    onPrimary: TEXT_ON_DARK,
  },
};
