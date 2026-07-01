import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function App() {
  const [result, setResult] = useState("Loading...");

  useEffect(() => {
    // Define function inside useEffect to prevent infinite/recursive renders - eslint
    async function getHealth() {
      try {
        const response = await fetch(API_URL);
        const data = await response.json();

        setResult(JSON.stringify(data));
      } catch (error) {
        setResult(error.message);
      }
    }

    getHealth();
  }, []);
  return (
    <View style={styles.container}>
      <Text>{result}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
