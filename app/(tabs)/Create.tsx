import { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const OPENROUTER_API_KEY = '@openrouter_api_key';
import { StyleSheet, ScrollView, Alert ,useColorScheme} from 'react-native';
import { Card, SegmentedButtons, Searchbar, Button, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { View } from 'react-native';

interface SaladPreferences {
  isVegetarian: boolean;
  isVegan: boolean;
  isGlutenFree: boolean;
  isNutFree: boolean;
  isLowCalorie: boolean;
}

export default function CreateScreen() {
  const theme = useTheme();
  const colorScheme = useColorScheme();
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
      const apiKey = await AsyncStorage.getItem(OPENROUTER_API_KEY);
      
      if (!apiKey) {
        Alert.alert(
          'API Key Required',
          'Please set your OpenRouter API key in Settings first.',
          [{ text: 'OK' }]
        );
        return;
      }

      const preferencesText = Object.entries(preferences)
        .filter(([_, value]) => value)
        .map(([key]) => key.replace('is', '').replace(/([A-Z])/g, ' $1').trim())
        .join(', ');

      const calorieText = calorieTarget ? `with approximately ${calorieTarget} calories` : '';
      
      const prompt = `Create a healthy salad recipe that is ${preferencesText || 'suitable for everyone'} ${calorieText}. 
                     Include ingredients with their quantities, preparation steps, and approximate calorie count per serving. Keep it creative and flavorful.`;

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-pro-preview-03-25",
          messages: [
            {
              role: "user",
              content: prompt
            }
          ]
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API Error: ${response.status} - ${errorText}`);
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      console.log('API Response:', JSON.stringify(data).substring(0, 200) + '...');
      
      // Extract content from the response - handle different possible response structures
      let messageContent = '';
      
      if (data.choices && Array.isArray(data.choices) && data.choices.length > 0) {
        // Standard OpenAI-compatible format
        messageContent = data.choices[0]?.message?.content || data.choices[0]?.content || '';
      } else if (data.content) {
        // Direct content field
        messageContent = data.content;
      } else if (data.response) {
        // Response field (some models return this)
        messageContent = data.response;
      } else if (typeof data === 'string') {
        // Direct string response
        messageContent = data;
      } else if (typeof data === 'object') {
        // If we got an object but none of the expected fields, stringify the whole object
        messageContent = JSON.stringify(data, null, 2);
      } else {
        // Last resort fallback
        messageContent = 'Internet Connection error . Please try again.';
      }
      
      if (!messageContent) {
        console.error('Could not extract content from response:', data);
        throw new Error('Could not extract content from API response');
      }
      
      try {
        // Try to parse the response as JSON first
        const parsedResponse = JSON.parse(messageContent);
        if (typeof parsedResponse === 'object' && parsedResponse !== null) {
          // If it's valid JSON, stringify it nicely
          setRecipe(JSON.stringify(parsedResponse, null, 2));
        } else {
          // If not a valid JSON object, use the raw content
          setRecipe(messageContent);
        }
      } catch (parseError) {
        // If not valid JSON, use the raw content
        setRecipe(messageContent);
      }
    } catch (error) {
      console.error('Error generating recipe:', error);
      Alert.alert(
        'Error', 
        `Error generating recipe: ${error.message}. Please try again.`,
        [
          { text: 'OK' },
          { 
            text: 'Show Debug Info', 
            onPress: () => Alert.alert('Debug Info', JSON.stringify(error, null, 2))
          }
        ]
      );
      setRecipe('');
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
          
          <Card style={[styles.card, { backgroundColor: theme.colors.surface }]} mode="outlined">
            <Card.Title 
              title="Dietary Preferences" 
              titleStyle={[styles.cardTitle, { color: theme.colors.onSurface }]} 
            />
            <Card.Content style={styles.cardContent}>
              {Object.entries(preferences).map(([key, value]) => (
                <View key={key} style={styles.preferenceRow}>
                  <ThemedText style={[styles.preferenceText, { color: theme.colors.onSurface }]}>
                    {key.replace('is', '').replace(/([A-Z])/g, ' $1').trim()}
                  </ThemedText>
                  <Button
                    mode={value ? 'contained' : 'outlined'}
                    onPress={() => togglePreference(key as keyof SaladPreferences)}
                    style={[styles.preferenceButton, value && { backgroundColor: theme.colors.primary }]}
                    labelStyle={[styles.preferenceButtonLabel, value && { color: theme.colors.onPrimary }]}
                  >
                    {value ? 'Yes' : 'No'}
                  </Button>
                </View>
              ))}
            </Card.Content>
          </Card>

          <Card style={[styles.card, { backgroundColor: theme.colors.surface }]} mode="outlined">
            <Card.Title 
              title="Calorie Target" 
              titleStyle={[styles.cardTitle, { color: theme.colors.onSurface }]} 
            />
            <Card.Content>
              <Searchbar
                placeholder="Enter calorie target"
                value={calorieTarget}
                onChangeText={setCalorieTarget}
                keyboardType="numeric"
                style={[styles.calorieInput, { backgroundColor: theme.colors.surfaceVariant }]}
                theme={theme}
                icon="calculator"
              />
            </Card.Content>
          </Card>

          {recipe ? (
            <Card style={[styles.card, { backgroundColor: theme.colors.surface }]} mode="outlined">
              <Card.Title 
                title="Your Custom Recipe" 
                titleStyle={[styles.cardTitle, { color: theme.colors.onSurface }]} 
              />
              <Card.Content>
                <ThemedText style={[styles.recipeText, { color: theme.colors.onSurface }]}>{recipe}</ThemedText>
              </Card.Content>
            </Card>
          ) : null}
        </ScrollView>

        <Button
          mode="outlined"
          onPress={generateRecipe}
          loading={loading}
          disabled={loading}
          style={[styles.generateButton, { borderColor: theme.colors.primary }]}
          labelStyle={[styles.generateButtonLabel, { color: theme.colors.primary }]}
          contentStyle={{ height: 48 }}
          rippleColor={theme.colors.primary}
          uppercase={false}
          borderRadius={24}
        >
          {loading ? 'Generating...' : 'Generate Recipe'}
        </Button>
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
    fontSize: 28,
    fontWeight: '700',
  },
  card: {
    marginHorizontal: 16,
    marginBottom: 20,
    borderRadius: 12,
    elevation: 2,
    shadowColor: theme => theme.colors.shadow,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme => theme.colors.outline,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    paddingHorizontal: 8,
    marginBottom: 4,
  },
  cardContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  preferenceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    width: '100%',
  },
  preferenceText: {
    fontSize: 16,
    flex: 1,
    marginRight: 16,
  },
  preferenceButton: {
    width: 100,
    borderRadius: 20,
    borderColor: theme => theme.colors.primary,
    opacity: 0.85,
    transform: [{ scale: 0.95 }],
    transition: 'all 0.6s ease',
  },
  preferenceButtonLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  calorieInput: {
    marginVertical: 8,
    backgroundColor: 'transparent',
  },
  generateButton: {
    margin: 16,
    paddingVertical: 8,
    borderRadius: 24,
    borderWidth: 2,
  },
  generateButtonLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  recipeText: {
    lineHeight: 24,
    fontSize: 15,
    paddingVertical: 8,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});