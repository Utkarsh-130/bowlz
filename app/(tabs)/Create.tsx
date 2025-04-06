import { useState } from 'react';
import { StyleSheet, Switch, ScrollView, TextInput } from 'react-native';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GEMINI_API_KEY } from '@/constants/Config';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { SafeAreaView } from 'react-native-safe-area-context';

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

interface SaladPreferences {
  isVegetarian: boolean;
  isVegan: boolean;
  isGlutenFree: boolean;
  isNutFree: boolean;
  isLowCalorie: boolean;
}

export default function CreateScreen() {
  const [preferences, setPreferences] = useState<SaladPreferences>({
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false,
    isNutFree: false,
    isLowCalorie: false,
  });
  const [calorieTarget, setCalorieTarget] = useState<string>('');
  const [recipe, setRecipe] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const generateRecipe = async () => {
    try {
      setLoading(true);
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });

      const preferencesText = Object.entries(preferences)
        .filter(([_, value]) => value)
        .map(([key]) => key.replace('is', '').replace(/([A-Z])/g, ' $1').trim())
        .join(', ');

      const calorieText = calorieTarget ? `with approximately ${calorieTarget} calories` : '';
      
      const prompt = `Create a healthy salad recipe that is ${preferencesText || 'suitable for everyone'} ${calorieText}. 
                     Include ingredients with their quantities, preparation steps, and approximate calorie count per serving. Keep it creative and flavorful.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      setRecipe(response.text());
    } catch (error) {
      console.error('Error generating recipe:', error);
      setRecipe('Sorry, there was an error generating your recipe. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const togglePreference = (key: keyof SaladPreferences) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <ThemedText type="title" style={styles.title}>Create Your Salad</ThemedText>
        
        <ThemedView style={styles.preferencesContainer}>
          <ThemedText type="subtitle">Dietary Preferences</ThemedText>
          
          {Object.entries(preferences).map(([key, value]) => (
            <ThemedView key={key} style={styles.preferenceRow}>
              <ThemedText>{key.replace('is', '').replace(/([A-Z])/g, ' $1').trim()}</ThemedText>
              <Switch
                value={value}
                onValueChange={() => togglePreference(key as keyof SaladPreferences)}
              />
            </ThemedView>
          ))}

          <ThemedView style={styles.calorieInputContainer}>
            <ThemedText>Target Calories</ThemedText>
            <TextInput
              style={styles.calorieInput}
              value={calorieTarget}
              onChangeText={setCalorieTarget}
              placeholder="Enter calorie target"
              keyboardType="numeric"
              placeholderTextColor="#687076"
            />
          </ThemedView>

          <ThemedView style={styles.buttonContainer}>
            <ThemedView
              style={[styles.button, loading && styles.buttonDisabled]}
              lightColor="#0a7ea4"
              darkColor="#1D3D47">
              <ThemedText
                style={styles.buttonText}
                onPress={generateRecipe}
                disabled={loading}>
                {loading ? 'Generating...' : 'Generate Recipe'}
              </ThemedText>
            </ThemedView>
          </ThemedView>

          {recipe ? (
            <ThemedView style={styles.recipeContainer}>
              <ThemedText type="subtitle">Your Custom Recipe</ThemedText>
              <ThemedText style={styles.recipeText}>{recipe}</ThemedText>
            </ThemedView>
          ) : null}
        </ThemedView>
      </ScrollView>
    </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  title: {
    textAlign: 'center',
    marginVertical: 20,
  },
  preferencesContainer: {
    padding: 20,
    gap: 20,
  },
  preferenceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  calorieInputContainer: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  calorieInput: {
    borderWidth: 1,
    borderColor: '#687076',
    borderRadius: 8,
    padding: 8,
    width: 120,
    color: '#11181C',
  },
  buttonContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  button: {
    padding: 15,
    borderRadius: 8,
    minWidth: 200,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  recipeContainer: {
    marginTop: 20,
    padding: 15,
    borderRadius: 8,
    gap: 10,
  },
  recipeText: {
    lineHeight: 24,
  },
});