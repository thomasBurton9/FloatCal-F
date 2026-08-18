import { Alert, Pressable, Text, View } from "react-native";
import type {
  Invite,
  InviteProps,
  InvitesScreenProps,
} from "../../types/calendars";
import { BackButton } from "./CalendarDetailsScreen";
import { styles } from "./calendarStyles";
import { useEffect, useMemo, useState } from "react";
import { checkInvitesToUser, respondToInvite } from "../../api/inviteApi";

// Currently non functional screen to list invites from others -> TODO: May need new backend db table
export function InvitesScreen({
  setCurrentView,
  userId,
  currentView,
}: InvitesScreenProps) {
  const [invites, setInvites] = useState<Invite[]>([]);

  const [reloadInvites, setReloadInvites] = useState(false);

  useEffect(() => {
    async function loadInvites() {
      const inviteData = await checkInvitesToUser(userId);
      if (inviteData.success) {
        setInvites(inviteData.result);
      } else {
        if (inviteData.error) {
          Alert.alert(inviteData.error);
        } else {
          Alert.alert("Error checking invites");
        }
      }
    }
    if (userId && currentView === "invites") {
      loadInvites();
    }
  }, [userId, currentView, reloadInvites]);

  // Filter invites for only those with an appropriate status
  const invitesFiltered = useMemo(() => {
    return invites.filter((invite) => invite.status === "open");
  }, [invites]);

  return (
    <>
      <View style={styles.placeholderView}>
        <BackButton setCurrentView={setCurrentView}></BackButton>
        <Text style={styles.placeholderTitle}>Invites</Text>
      </View>
      <View>
        {invitesFiltered.map((invite) => (
          <InviteSection
            key={invite.invite_id}
            invite={invite}
            reload={reloadInvites}
            setReload={setReloadInvites}
          ></InviteSection>
        ))}
      </View>
    </>
  );
}

function InviteSection({ invite, reload, setReload }: InviteProps) {
  return (
    <>
      <View>
        <Text>Calendar Name</Text>
        <Text>Invited by Name</Text>
        <Pressable
          onPress={() => {
            handleResponse(
              invite.invite_to_user_id,
              invite.invite_id,
              true,
              reload,
              setReload,
            );
          }}
        >
          <Text>Accept</Text>
        </Pressable>
        <Pressable
          onPress={() => {
            handleResponse(
              invite.invite_to_user_id,
              invite.invite_id,
              false,
              reload,
              setReload,
            );
          }}
        >
          <Text>Decline</Text>
        </Pressable>
      </View>
    </>
  );
}

async function handleResponse(
  userId: number,
  inviteId: number,
  accepted: boolean,
  reload: boolean,
  setReload: (reload: boolean) => void,
) {
  const result = await respondToInvite(userId, inviteId, accepted);

  if (!result.success) {
    if (result.error) {
      Alert.alert(result.error);
    } else {
      Alert.alert("Failed responding to invite", "Please try again");
    }
  } else {
    Alert.alert("Successfully responded to invite");
    setReload(!reload);
    return;
  }
}
