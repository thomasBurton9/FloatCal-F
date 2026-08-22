import { Alert } from "react-native";
import { deleteUser } from "../../api/authenticateApi";

export function handleDeleteAccount(
  userId: number,
  setUserId: (userId: number | boolean | null) => void,
) {
  Alert.alert(
    "Delete Account?",
    "This action is permanent. All data including calendars, tasks, events, completion history and more will be deleted and unrecoverable",
    [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete account and data",
        onPress: async () => {
          Alert.prompt(
            "Delete account",
            `Enter email and password for your account to continue`,
            [
              { text: "Cancel", style: "cancel" },
              {
                text: "Delete",
                style: "destructive",
                onPress: async (value?: {
                  login: string;
                  password: string;
                }) => {
                  // Have to use login, cannot use 'email' as field due to limitations in prompt alert
                  if (!value) {
                    Alert.alert("Email and password need to be valid strings");
                    return;
                  }
                  const result = await deleteUser(
                    userId,
                    value.login,
                    value.password,
                  );

                  if (!result.success) {
                    if (result.error) {
                      // Differentiate between pydantic validation errors and invalid passwords / value Errors
                      const message = Array.isArray(result.error)
                        ? result.error[0].msg
                        : result.error;
                      Alert.alert(message);
                    } else {
                      Alert.alert("Error deleting account");
                    }
                  } else {
                    Alert.alert("Account and data deleted successfully");
                    setUserId(null);
                  }
                },
              },
            ],
            "login-password",
          );
        },
      },
    ],
  );
}
