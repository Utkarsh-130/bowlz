import React from 'react';
import { StyleSheet } from 'react-native';
import Caltrac from '@/components/Caltrac';
import { ThemedSafeAreaView } from '@/components/ThemedSafeAreaView';
import { ThemedText } from '@/components/ThemedText';

export default function CalTracScreen() {
  return (
    <ThemedSafeAreaView style={styles.container}>
      <ThemedText style={styles.title}>Calorie Tracker</ThemedText>
      <Caltrac />
    </ThemedSafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
  },
});