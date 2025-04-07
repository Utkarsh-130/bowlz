import React, { useState } from 'react';
import { View, Image, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { Button } from 'react-native-paper';

interface CalorieResponse {
  calories: number;
  foodItems: string[];
}

export default function Caltrac() {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CalorieResponse | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>('');

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Sorry, we need camera roll permissions to make this work!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
      base64: true,
    });

    if (!result.canceled && result.assets[0]?.base64) {
      setImage(result.assets[0].uri);
      analyzeImage(result.assets[0].base64);
    }
  };

  // Helper function to extract JSON from text that might contain markdown or other formatting
  const extractJsonFromText = (text: string): any => {
    try {
      // First try: direct JSON parse
      return JSON.parse(text);
    } catch (e) {
      try {
        // Second try: Look for JSON object pattern
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch (e2) {
        // Third try: Look for code blocks
        try {
          const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
          if (codeBlockMatch && codeBlockMatch[1]) {
            return JSON.parse(codeBlockMatch[1]);
          }
        } catch (e3) {
          // Fourth try: Try to create a simple object from the text
          if (text.includes("calories") && (text.includes("food") || text.includes("items"))) {
            // Very basic extraction
            const caloriesMatch = text.match(/calories[:\s]+(\d+)/i);
            const foodItemsText = text.split("food items")[1] || 
                                 text.split("foods")[1] || 
                                 text.split("items")[1] || "";
            
            const calories = caloriesMatch ? parseInt(caloriesMatch[1]) : 0;
            const foodItems = foodItemsText
              .replace(/[^\w\s,]/g, '')
              .split(',')
              .map(item => item.trim())
              .filter(item => item.length > 0);
              
            return { calories, foodItems };
          }
        }
      }
    }
    throw new Error("Could not extract JSON from response");
  };

  const analyzeImage = async (base64Image: string) => {
    setLoading(true);
    setDebugInfo('');
    
    try {
      // Simplified prompt that explicitly asks for JSON
      const prompt = "Analyze this food image. Return ONLY a JSON object with these fields: calories (number) and foodItems (array of strings). Example: {\"calories\": 500, \"foodItems\": [\"apple\", \"banana\"]}";
      
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": "Bearer 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",
          "Content-Type": "application/json",
          "HTTP-Referer": "https://your-app-domain.com", // Add your app domain
          "X-Title": "CalTrack App" // Add your app name
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-pro-preview-03-25",
          messages: [
            {
              role: "system",
              content: "You are a helpful assistant that analyzes food images and returns ONLY valid JSON with calories and food items."
            },
            {
              role: "user",
              content: [
                { type: "text", text: prompt },
                { type: "image", image_url: `data:image/jpeg;base64,${base64Image}` }
              ]
            }
          ],
          response_format: { type: "json_object" }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        setDebugInfo(`API Error: ${response.status} - ${errorText}`);
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      setDebugInfo(`API Response: ${JSON.stringify(data).substring(0, 200)}...`);
      
      // Extract content from the response
      let content = '';
      
      // Handle different possible response structures from OpenRouter API
      if (data.choices && Array.isArray(data.choices) && data.choices.length > 0) {
        // Standard OpenAI-compatible format
        content = data.choices[0]?.message?.content || '';
      } else if (data.content) {
        // Direct content field
        content = data.content;
      } else if (data.response) {
        // Response field (some models return this)
        content = data.response;
      } else if (typeof data === 'object' && (data.calories !== undefined || data.foodItems !== undefined)) {
        // The API might have directly returned the JSON object we need
        return setResult({
          calories: typeof data.calories === 'number' ? data.calories : parseInt(data.calories) || 0,
          foodItems: Array.isArray(data.foodItems) ? data.foodItems : 
                    (typeof data.foodItems === 'string' ? data.foodItems.split(',').map(item => item.trim()) : [])
        });
      } else {
        // Log the full response for debugging
        setDebugInfo(`Unexpected response structure: ${JSON.stringify(data)}`);
        throw new Error('Unexpected API response structure');
      }
      
      // If content is empty but we got this far, try to use the whole response as content
      if (!content && typeof data === 'object') {
        content = JSON.stringify(data);
      }
      
      // Try to parse the content as JSON or extract JSON from it
      let parsedData;
      try {
        parsedData = extractJsonFromText(content);
      } catch (parseError) {
        setDebugInfo(`Parse error: ${parseError.message}\nContent: ${content.substring(0, 200)}...`);
        throw new Error('Failed to parse response as JSON');
      }
      
      // Create a normalized response
      const normalizedResponse: CalorieResponse = {
        calories: typeof parsedData.calories === 'number' ? 
                 parsedData.calories : 
                 parseInt(parsedData.calories) || 0,
        foodItems: Array.isArray(parsedData.foodItems) ? 
                  parsedData.foodItems : 
                  (typeof parsedData.foodItems === 'string' ? 
                   parsedData.foodItems.split(',').map(item => item.trim()) : 
                   [])
      };
      
      setResult(normalizedResponse);
    } catch (error) {
      console.error('Error analyzing image:', error);
      Alert.alert(
        'Error', 
        `Error analyzing image: ${error.message}. Please try again.`,
        [
          { text: 'OK' },
          { 
            text: 'Show Debug Info', 
            onPress: () => Alert.alert('Debug Info', debugInfo || 'No debug info available')
          }
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <Button 
        mode="contained" 
        onPress={pickImage}
        style={styles.uploadButton}
      >
        Select Food Image
      </Button>

      {image && (
        <Image source={{ uri: image }} style={styles.image} />
      )}

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
          <ThemedText>Analyzing image...</ThemedText>
        </View>
      )}

      {result && (
        <View style={styles.resultContainer}>
          <ThemedText style={styles.calorieText}>
            Estimated Calories: {result.calories}
          </ThemedText>
          <ThemedText style={styles.foodItemsTitle}>Identified Foods:</ThemedText>
          {result.foodItems.length > 0 ? (
            result.foodItems.map((item, index) => (
              <ThemedText key={index} style={styles.foodItem}>• {item}</ThemedText>
            ))
          ) : (
            <ThemedText style={styles.foodItem}>No food items identified</ThemedText>
          )}
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
  },
  uploadButton: {
    padding: 10,
    borderRadius: 10,
    marginBottom: 20,
    width: '80%',
  },
  image: {
    width: 300,
    height: 300,
    borderRadius: 10,
    marginBottom: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  resultContainer: {
    width: '100%',
    padding: 15,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 10,
  },
  calorieText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  foodItemsTitle: {
    fontSize: 18,
    marginBottom: 5,
  },
  foodItem: {
    fontSize: 16,
    marginLeft: 10,
  }
});