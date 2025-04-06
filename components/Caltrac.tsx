import React, { useState } from 'react';
import { View, Image, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
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

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      alert('Sorry, we need camera roll permissions to make this work!');
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

  const analyzeImage = async (base64Image: string) => {
    setLoading(true);
    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": "Bearer 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",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-pro-preview-03-25",
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: "Analyze this food image and tell me the approximate calories and list the food items you can identify. Return the response in JSON format with 'calories' (number) and 'foodItems' (string array) fields."
                },
                {
                  type: "image",
                  image_url: `data:image/jpeg;base64,${base64Image}`
                }
              ]
            }
          ]
        })
      });

      const data = await response.json();
      if (!data || !data.choices || !Array.isArray(data.choices) || data.choices.length === 0) {
        throw new Error('Invalid API response: Missing or empty choices array');
      }

      const messageContent = data.choices[0]?.message?.content;
      if (!messageContent) {
        throw new Error('Invalid API response: Missing message content');
      }

      try {
        const parsedResponse = JSON.parse(messageContent);
        
        // Validate response structure
        if (typeof parsedResponse !== 'object' || parsedResponse === null) {
          throw new Error('Invalid response: Not a valid JSON object');
        }
        
        if (typeof parsedResponse.calories !== 'number') {
          throw new Error('Invalid response: calories must be a number');
        }
        
        if (!Array.isArray(parsedResponse.foodItems)) {
          throw new Error('Invalid response: foodItems must be an array');
        }
        
        setResult(parsedResponse);
      } catch (parseError) {
        throw new Error(`Failed to parse API response: ${parseError}`);
      }
    } catch (error) {
      console.error('Error analyzing image:', error);
      alert('Error analyzing image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
     
  <Button  mode="outlined" 
    
  
onPress={pickImage}>
        <ThemedText style={styles.buttonText}>Select Food Image</ThemedText>
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
          {result.foodItems.map((item, index) => (
            <ThemedText key={index} style={styles.foodItem}>• {item}</ThemedText>
          ))}
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
  },
  uploadButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
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