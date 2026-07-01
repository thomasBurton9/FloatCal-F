import { View, Text, TextInput, Pressable } from "react-native";

export default function AuthenticationScreen({ onLogin }) {
  return (
    <>
      <View>
        <View>
          <Text>Welcome to Float Cal</Text>
        </View>
        <View>
          <Text>Login</Text>
          <Text>Register</Text>
        </View>
        <View>
          <Text>Email</Text>
          <View>
            <TextInput></TextInput>
          </View>
        </View>
        <View>
          <Text>Password</Text>
          <View>
            {/* Currently password is always visible */}
            <TextInput></TextInput>
          </View>
        </View>
        <View>
          <Pressable onPress={onLogin}>
            <Text>Login</Text>
          </Pressable>
        </View>
      </View>
    </>
  );
}
