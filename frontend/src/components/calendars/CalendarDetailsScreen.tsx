import { Alert, Pressable, Text, View } from "react-native";
import type {
  CalendarDetailsScreenProps,
  currentView,
} from "../../types/calendars";
import { handleRemoveCalendar } from "../ManageCalendars";
import { styles } from "./calendarStyles";
import { removeCalendarMember } from "../../api/calendarApi";
import { useEffect, useMemo, useState } from "react";
import { SharedMemberProps, UserInfo } from "../../types/userInfo";
import { fetchCalendarMemberEntryInfo } from "../../api/memberApi";
import { Dropdown } from "react-native-element-dropdown";
import { listUsers } from "../../api/userApi";
import { inviteUser } from "../../api/inviteApi";
import { RED_WARNING_COLOUR } from "../../constants";

// Button to return to main manage calendar screen
export function BackButton({
  setCurrentView,
}: Pick<CalendarDetailsScreenProps, "setCurrentView">) {
  return (
    <Pressable style={styles.backButton} onPress={() => setCurrentView("list")}>
      <Text>Back</Text>
    </Pressable>
  );
}

export function CalendarDetailsScreen({
  selectedCalendar,
  setCurrentView,
  userId,
  setCalendars,
  reloadCalendars,
  setReloadCalendars,
}: CalendarDetailsScreenProps) {
  // What happens if selectedCalendar is null (it shouldn't but what if?)
  const ownCalendar = userId === selectedCalendar?.created_by_user_id;
  const [members, setMembers] = useState<UserInfo[]>([]);
  const [reloadMembers, setReloadMembers] = useState(false);
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [currentUser, setCurrentUser] = useState<number | null>(null);

  useEffect(() => {
    async function loadMembers() {
      const inviteData = await fetchCalendarMemberEntryInfo(
        selectedCalendar.calendar_id,
      );
      if (inviteData.success) {
        setMembers(inviteData.result);
      } else {
        if (inviteData.error) {
          Alert.alert(inviteData.error);
        } else {
          Alert.alert("Error checking members");
        }
      }
    }
    if (userId && selectedCalendar) {
      loadMembers();
    }
  }, [userId, selectedCalendar, reloadMembers]);

  useEffect(() => {
    async function loadUsers() {
      const userData = await listUsers();
      if (userData.success) {
        setUsers(userData.result);
      } else {
        if (userData.error) {
          Alert.alert(userData.error);
        } else {
          Alert.alert("Error finding users");
        }
      }
    }

    if (userId) {
      loadUsers();
    }
  }, [userId, reloadMembers]);

  // Backend rejects duplicate invites -> Validation not needed to frontend layer
  const filteredUsers = useMemo(
    () =>
      users.filter(
        (user) => !members.some((member) => user.user_id === member.user_id),
      ),
    [users, members],
  );

  return (
    <View style={styles.placeholderView}>
      <BackButton setCurrentView={setCurrentView}></BackButton>
      <Text style={styles.placeholderTitle}>
        {"Name: "} {/* Using curly brace syntax to keep the space after name */}
        {/* Fall back to calendar details if a calendar is not loaded */}
        {selectedCalendar ? selectedCalendar.name : "Calendar Details"}
      </Text>
      <View
        style={{
          flexDirection: "row",
        }}
      >
        <Text>Colour: </Text>
        <View
          style={{
            width: 100,
            height: 20,
            backgroundColor: selectedCalendar.colour,
          }}
        ></View>
      </View>
      <Text style={{ fontSize: 24 }}>Members</Text>
      {members.map((member) => (
        <IndividualMember
          key={member.user_id}
          member={member}
          isEditable={ownCalendar}
          isOwner={selectedCalendar.created_by_user_id === member.user_id}
          calendarId={selectedCalendar.calendar_id}
          reloadMembers={reloadMembers}
          setReloadMembers={setReloadMembers}
        ></IndividualMember>
      ))}
      {/* TODO: Add confirmation for deletion in the future*/}
      {/* Display delete dialog only for user created calendars */}
      {/* TODO: Add 'leave calendar' dialog instead */}
      {ownCalendar ? (
        <>
          <Text style={styles.inviteMemberTitle}>Invite Member</Text>
          <Dropdown
            containerStyle={{ marginTop: -2 }}
            style={styles.userDropDown}
            data={filteredUsers}
            labelField="display_name"
            valueField="user_id"
            value={currentUser}
            placeholder="Select user to invite"
            renderItem={(user) => (
              <View style={styles.dropDownItem}>
                <Text style={styles.dropDownName}>{user.display_name}</Text>
                <Text style={styles.dropDownEmail}>{user.email}</Text>
              </View>
            )}
            onChange={(user) => {
              setCurrentUser(user.user_id);
            }}
          ></Dropdown>
          <Pressable
            onPress={async () => {
              if (currentUser) {
                const result = await inviteUser(
                  userId,
                  currentUser,
                  selectedCalendar.calendar_id,
                );
                if (!result.success) {
                  if (result.error) {
                    Alert.alert(result.error);
                  } else {
                    Alert.alert("Error inviting user");
                  }
                } else {
                  Alert.alert("Successfully invited user");
                  setReloadMembers(!reloadMembers);
                }
              } else {
                Alert.alert("You need to select a user to invite them");
              }
            }}
            style={styles.sendInviteButton}
          >
            <Text style={styles.sendInviteText}>Send Invite</Text>
          </Pressable>
          <Pressable
            style={styles.deleteButton}
            onPress={() =>
              handleRemoveCalendar(
                userId,
                selectedCalendar.calendar_id,
                setCalendars,
                setCurrentView,
              )
            }
          >
            <Text>Delete Calendar</Text>
          </Pressable>
        </>
      ) : (
        <Pressable
          style={styles.deleteButton}
          onPress={() => {
            handleLeaveCalendar(
              userId,
              selectedCalendar.calendar_id,
              setCurrentView,
              reloadCalendars,
              setReloadCalendars,
            );
          }}
        >
          <Text>Leave Calendar</Text>
        </Pressable>
      )}
    </View>
  );
}

function IndividualMember({
  member,
  isEditable,
  isOwner,
  calendarId,
  reloadMembers,
  setReloadMembers,
}: SharedMemberProps) {
  let buttonText;
  let backgroundColour;
  let onPress;

  if (isOwner) {
    buttonText = "Owner";
    backgroundColour = "white";
    onPress = () => null;
  } else if (isEditable) {
    buttonText = "Remove";
    backgroundColour = RED_WARNING_COLOUR;
    onPress = async () => {
      const result = await removeCalendarMember(calendarId, member.user_id);

      if (!result.success) {
        if (result.error) {
          Alert.alert(result.error);
        } else {
          Alert.alert("Error removing user from calendar");
        }
      } else {
        Alert.alert("Member removed successfully");
        setReloadMembers(!reloadMembers);
      }
    };
  } else {
    buttonText = "Member";
    backgroundColour = "white";
    onPress = () => null;
  }
  // TODO: Long emails / names
  return (
    <>
      <View style={styles.individualMember}>
        <View style={styles.individualMemberInfo}>
          <Text style={styles.individualMemberName}>{member.display_name}</Text>
          <Text style={styles.individualMemberEmail}>{member.email}</Text>
        </View>
        <Pressable
          onPress={onPress}
          style={[
            styles.individualMemberButton,
            { backgroundColor: backgroundColour },
          ]}
          disabled={!isEditable || isOwner}
        >
          <Text style={styles.individualMemberButtonText}>{buttonText}</Text>
        </Pressable>
      </View>
    </>
  );
}
async function handleLeaveCalendar(
  userId: number,
  calendarId: number,
  setCurrentView: (view: currentView) => void,
  reloadCalendars: boolean,
  setReloadCalendars: (value: boolean) => void,
) {
  const result = await removeCalendarMember(calendarId, userId);

  if (!result.success) {
    if (result.error) {
      Alert.alert(result.error);
    } else {
      Alert.alert("Error leaving calendar");
    }
  } else {
    Alert.alert("Successfully left calendar");
    setReloadCalendars(!reloadCalendars);
    setCurrentView("list");
  }
}
