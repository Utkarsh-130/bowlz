import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, useColorScheme, StatusBar, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const OPENROUTER_API_KEY = '@openrouter_api_key';

interface SaladPreferences {
  isVegetarian: boolean;
  isVegan: boolean;
  isGlutenFree: boolean;
  isNutFree: boolean;
  isLowCalorie: boolean;
}

export default function CreateScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

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

  const togglePreference = (key: keyof SaladPreferences) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

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
          model: "google/gemini-2.0-pro-exp-02-05:free",
          messages: [{ role: "user", content: prompt }]
        })
      });

      if (!response.ok) throw new Error(`API error: ${response.status}`);

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || 'No recipe generated.';
      setRecipe(content);

    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className={`flex-1 ${isDark ? 'bg-zinc-950' : 'bg-[#f4f5f9]'}`} edges={['top']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 110 }}>
        
        <View className="px-5 pt-8 pb-4">
           <Text className={`text-base font-medium ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>AI Kitchen</Text>
           <Text className={`text-3xl font-black mt-1 tracking-tight ${isDark ? 'text-white' : 'text-zinc-900'}`}>Create Your Salad</Text>
        </View>

        <View className="px-5 mt-4">
           <View className={`w-full rounded-[30px] p-6 border ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-100'}`}>
              <Text className={`text-[17px] font-bold mb-4 ${isDark ? 'text-white' : 'text-zinc-900'}`}>Dietary Preferences</Text>
              
              <View className="flex-row flex-wrap gap-2">
                 {Object.entries(preferences).map(([key, value]) => (
                    <TouchableOpacity
                       key={key}
                       onPress={() => togglePreference(key as keyof SaladPreferences)}
                       className={`px-4 py-2.5 rounded-full border ${value ? 'border-transparent bg-[#ff6b6b]' : isDark ? 'border-zinc-700 bg-transparent' : 'border-zinc-200 bg-transparent'}`}
                    >
                       <Text className={`text-sm font-semibold capitalize ${value ? 'text-white' : isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                          {key.replace('is', '').replace(/([A-Z])/g, ' $1').trim()}
                       </Text>
                    </TouchableOpacity>
                 ))}
              </View>

              <View className="mt-8">
                 <Text className={`text-[17px] font-bold mb-3 ${isDark ? 'text-white' : 'text-zinc-900'}`}>Calorie Target</Text>
                 <View className={`flex-row items-center h-14 rounded-2xl px-4 border ${isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-[#f4f5f9] border-zinc-200'}`}>
                    <Ionicons name="flame-outline" size={20} color={isDark ? '#71717a' : '#a1a1aa'} />
                    <TextInput
                       className={`flex-1 ml-3 font-semibold text-base ${isDark ? 'text-white' : 'text-zinc-900'}`}
                       placeholder="e.g. 500"
                       placeholderTextColor={isDark ? '#71717a' : '#a1a1aa'}
                       value={calorieTarget}
                       onChangeText={setCalorieTarget}
                       keyboardType="numeric"
                    />
                    <Text className={`font-semibold ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>kcal</Text>
                 </View>
              </View>
           </View>
        </View>

        <View className="px-5 mt-6">
           <TouchableOpacity 
              onPress={generateRecipe}
              disabled={loading}
              className={`w-full h-16 rounded-[20px] items-center justify-center flex-row shadow-lg ${loading ? 'bg-zinc-800' : isDark ? 'bg-white' : 'bg-zinc-900'}`}
           >
              {loading ? (
                 <ActivityIndicator color={isDark ? '#e4e4e7' : '#fff'} />
              ) : (
                 <>
                    <MaterialCommunityIcons name="magic-staff" size={24} color={isDark ? '#09090b' : '#fff'} className="mr-2" />
                    <Text className={`font-black text-lg ml-2 ${isDark ? 'text-zinc-950' : 'text-white'}`}>Generate Recipe</Text>
                 </>
              )}
           </TouchableOpacity>
        </View>

        {recipe ? (
           <View className="px-5 mt-10">
              <View className={`w-full rounded-[30px] p-6 border ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-100'}`}>
                 <View className="flex-row items-center mb-4 border-b border-zinc-800 pb-4">
                    <Ionicons name="restaurant-outline" size={24} color="#ff6b6b" />
                    <Text className={`ml-3 text-[19px] font-black ${isDark ? 'text-white' : 'text-zinc-900'}`}>Custom Salad Recipe</Text>
                 </View>
                 <Text className={`text-[15px] leading-6 ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
                    {recipe}
                 </Text>
                 
                 <TouchableOpacity className="mt-8 flex-row items-center justify-center py-4 rounded-2xl bg-zinc-800/10 border border-zinc-800/20">
                    <Feather name="share-2" size={20} color={isDark ? '#71717a' : '#52525b'} />
                    <Text className={`ml-2 font-bold ${isDark ? 'text-zinc-400' : 'text-zinc-700'}`}>Share Recipe</Text>
                 </TouchableOpacity>
              </View>
           </View>
        ) : (
           <View className="px-10 mt-16 items-center opacity-40">
              <Ionicons name="sparkles-outline" size={60} color={isDark ? '#27272a' : '#d4d4d8'} />
              <Text className={`text-center mt-4 font-medium ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                 Toggle your preferences and get a personalized healthy salad recipe powered by AI.
              </Text>
           </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}