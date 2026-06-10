import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

const API_URL = 'http://192.168.68.108:8000/api/health'

export default function App() {
  const [result, setResult] = useState("Loading...")

  async function getHealth() {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();

      setResult(JSON.stringify(data));
    } catch (error) {
      setResult(error.message);
    }
  }

  useEffect(() => {
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
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
