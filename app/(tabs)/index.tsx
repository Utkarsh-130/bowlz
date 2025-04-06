import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Button, ProgressBar, Card, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

interface MealEntry {
  type: 'breakfast' | 'lunch' | 'dinner' | 'snacks';
  calories: number;
}

export default function CalorieTracker() {
  const [dailyGoal, setDailyGoal] = useState('2000');
  const [meals, setMeals] = useState<MealEntry[]>([]);
  const [currentMeal, setCurrentMeal] = useState<MealEntry>({ type: 'breakfast', calories: 0 });

  const mealColors = {
    breakfast: '#FF9800',
    lunch: '#4CAF50',
    dinner: '#2196F3',
    snacks: '#9C27B0'
  };

  const addMeal = () => {
    if (currentMeal.calories > 0) {
      setMeals([...meals, currentMeal]);
      setCurrentMeal({ ...currentMeal, calories: 0 });
    }
  };

  const totalCalories = meals.reduce((sum, meal) => sum + meal.calories, 0);
  const progress = totalCalories / parseInt(dailyGoal);

  const getMealTotal = (type: MealEntry['type']) => {
    return meals
      .filter(meal => meal.type === type)
      .reduce((sum, meal) => sum + meal.calories, 0);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Card style={styles.card}>
          <Card.Title title="Daily Progress" />
          <Card.Content>
            <ProgressBar progress={progress} style={styles.progressBar} />
            <Text style={styles.progressText}>
              {totalCalories} / {dailyGoal} calories
            </Text>

            <View style={styles.mealSummary}>
              {(['breakfast', 'lunch', 'dinner', 'snacks'] as const).map(type => (
                <View key={type} style={styles.mealSummaryItem}>
                  <View style={[styles.colorIndicator, { backgroundColor: mealColors[type] }]} />
                  <Text style={{paddingRight:200}}>{type.charAt(0).toUpperCase() + type.slice(1)}</Text>
                  <Text>{getMealTotal(type)} cal</Text>
                </View>
              ))}
            </View>
          </Card.Content>
        </Card>
        <Card style={styles.card}>
          <Card.Title title="Daily Calorie Goal" />
          <Card.Content>
            <TextInput
              mode="outlined"
              label="Daily Goal (calories)"
              value={dailyGoal}
              onChangeText={setDailyGoal}
              keyboardType="numeric"
              style={styles.input}
            />
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Title title="Add Meal" />
          <Card.Content>
            <View style={styles.mealInputContainer}>
              <Button
                mode={currentMeal.type === 'breakfast' ? 'contained' : 'outlined'}
                onPress={() => setCurrentMeal({ ...currentMeal, type: 'breakfast' })}
                style={styles.mealButton}
              >
                Breakfast
              </Button>
              <Button
                mode={currentMeal.type === 'lunch' ? 'contained' : 'outlined'}
                onPress={() => setCurrentMeal({ ...currentMeal, type: 'lunch' })}
                style={styles.mealButton}
              >
                Lunch
              </Button>
              <Button
                mode={currentMeal.type === 'dinner' ? 'contained' : 'outlined'}
                onPress={() => setCurrentMeal({ ...currentMeal, type: 'dinner' })}
                style={styles.mealButton}
              >
                Dinner
              </Button>
              <Button
                mode={currentMeal.type === 'snacks' ? 'contained' : 'outlined'}
                onPress={() => setCurrentMeal({ ...currentMeal, type: 'snacks' })}
                style={styles.mealButton}
              >
                Snacks
              </Button>
            </View>

            <TextInput
              mode="outlined"
              label="Calories"
              value={currentMeal.calories.toString()}
              onChangeText={(text) => setCurrentMeal({ ...currentMeal, calories: parseInt(text) || 0 })}
              keyboardType="numeric"
              style={styles.input}
            />

            <Button mode="contained" onPress={addMeal} style={styles.addButton}>
              Add Meal
            </Button>
          </Card.Content>
        </Card>

        
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  scrollView: {
    padding: 16
  },
  card: {
    marginBottom: 16,
    borderRadius: 22,
    overflow: 'hidden'
  },
  input: {
    marginBottom: 8
  },
  mealInputContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16
  },
  mealButton: {
    width: '48%',
    marginBottom: 8
  },
  addButton: {
    marginTop: 8
  },
  progressBar: {
    height: 10,
    borderRadius: 5
  },
  progressText: {
    textAlign: 'center',
    marginTop: 8,
    fontSize: 16
  },
  mealSummary: {
    marginTop: 16
  },
  mealSummaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  colorIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8
  }
});