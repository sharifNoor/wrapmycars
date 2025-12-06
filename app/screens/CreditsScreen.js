// app/screens/CreditsScreen.js
import React, { useContext, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AuthContext } from '../contexts/AuthContext';
import Button from '../components/Button';

export default function CreditsScreen({ navigation }) {
  const { credits, updateCredits } = useContext(AuthContext);

  useEffect(() => {
    updateCredits();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Credits</Text>

      <Text style={styles.credits}>{credits ?? 0}</Text>

      <Button title="Buy More Credits" onPress={() => navigation.navigate('Billing')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 16 },
  credits: { fontSize: 60, fontWeight: '800', marginVertical: 30, textAlign: 'center' },
});
