'use client';
import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native-web';
import { StyleSheet } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

import { Dimensions } from 'react-native';

interface FoodEntry {
  food: string;
  calories: number;
  timestamp: Date;
}

export default function Homepage() {
  const [entries, setEntries] = useState<FoodEntry[]>([]);
  const [food, setFood] = useState('');
  const [calories, setCalories] = useState('');

  const handleSubmit = () => {
    const newEntry: FoodEntry = {
      food,
      calories: parseInt(calories),
      timestamp: new Date(),
    };
    setEntries([...entries, newEntry]);
    setFood('');
    setCalories('');
  };

  const chartData = {
    labels: entries.length > 0 ? entries.map(entry => entry.timestamp.toLocaleTimeString()) : [''],
    datasets: [{
      data: entries.length > 0 ? entries.map(entry => entry.calories) : [0]
    }]
  };

  const totalCalories = entries.reduce((sum, entry) => sum + entry.calories, 0);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
      <View style={styles.content}>
        <Text style={styles.title}>Calorie Tracker</Text>
        
        {/* Input Form */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={food}
            onChangeText={setFood}
            placeholder="Food item"
          />
          <TextInput
            style={styles.calorieInput}
            value={calories}
            onChangeText={setCalories}
            placeholder="Calories"
            keyboardType="numeric"
          />
          <TouchableOpacity
            style={styles.button}
            onClick={handleSubmit}
          >
            <Text style={styles.buttonText}>Add</Text>
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.cardTitle}>Today's Summary</Text>
            <Text style={styles.calorieCount}>{totalCalories} kcal</Text>
          </View>
          
          {entries.length > 0 ? (
            <View style={styles.chartCard}>
              <Text style={styles.cardTitle}>Calorie Trend</Text>
              <LineChart
                data={chartData}
                width={Dimensions.get('window').width - 40}
                height={200}
                chartConfig={{
                  backgroundColor: '#ffffff',
                  backgroundGradientFrom: '#ffffff',
                  backgroundGradientTo: '#ffffff',
                  decimalPlaces: 0,
                  color: (opacity = 1) => `rgba(75, 192, 192, ${opacity})`,
                }}
                bezier
                style={styles.chart}
              />
            </View>
          ) : (
            <View style={styles.chartCard}>
              <Text style={styles.cardTitle}>No data available yet</Text>
            </View>
          )}
        </View>

        {/* Recent Entries */}
        <View style={styles.entriesCard}>
          <Text style={styles.cardTitle}>Recent Entries</Text>
          {entries.map((entry, index) => (
            <View key={index} style={styles.entryRow}>
              <Text style={styles.foodName}>{entry.food}</Text>
              <Text style={styles.calorieText}>{entry.calories} kcal</Text>
            </View>
          ))}
      </View>
      </View>
    </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#1f2937',
    textAlign: 'center',
  },
  inputContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 4,
    padding: 8,
  },
  calorieInput: {
    width: 100,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 4,
    padding: 8,
  },
  button: {
    backgroundColor: '#3b82f6',
    padding: 10,
    borderRadius: 4,
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
  },
  statsContainer: {
    gap: 16,
    marginBottom: 24,
  },
  statCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
  },
  chartCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  calorieCount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 8,
  },
  entriesCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
  },
  entryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  foodName: {
    fontWeight: '500',
  },
  calorieText: {
    color: '#4b5563',
  },
});
