import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, useColorScheme, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import CircularProgress from 'react-native-circular-progress-indicator';
import Slider from '@react-native-community/slider';
import { useMeals, MealType } from '../context/MealContext';

interface MealEntry {
   type: 'breakfast' | 'lunch' | 'dinner' | 'snacks';
   calories: number;
}

export default function Home() {
   const colorScheme = useColorScheme();
   const isDark = colorScheme === 'dark';

   const navigation = useNavigation<any>();

   const { meals, dailyGoal, setDailyGoal, addMeal } = useMeals();

   const getAutoMealType = (): MealType => {
     const hour = new Date().getHours();
     const minutes = new Date().getMinutes();
     const time = hour + minutes / 60;

     if (time >= 7 && time <= 9.5) return 'breakfast';
     if (time >= 13 && time <= 16) return 'lunch';
     if (time >= 19 && time <= 21) return 'dinner';
     return 'snacks';
   };

   const [currentMeal, setCurrentMeal] = useState<{ type: MealType; calories: number }>({ type: getAutoMealType(), calories: 0 });
   const mealColors = {
      breakfast: '#3b82f6', // blue
      lunch: '#10b981',     // green
      dinner: '#6366f1',    // indigo
      snacks: '#f59e0b',    // amber
   };

   const handleAddMeal = () => {
      if (currentMeal.calories > 0) {
         addMeal({
            item: 'Quick Add',
            calories: currentMeal.calories,
            type: currentMeal.type,
         });
         setCurrentMeal({ type: getAutoMealType(), calories: 0 });
      }
   };

   const totalCalories = meals.reduce((sum, meal) => sum + meal.calories, 0);
   const progress = dailyGoal && parseInt(dailyGoal) > 0 ? totalCalories / parseInt(dailyGoal) : 0;
   const clampedProgress = Math.min(progress, 1);

   const getMealTotal = (type: MealType) => {
      return meals
         .filter(meal => meal.type === type)
         .reduce((sum, meal) => sum + meal.calories, 0);
   };

   return (
      <SafeAreaView className={`flex-1 ${isDark ? 'bg-zinc-950' : 'bg-[#f4f5f9]'}`} edges={['top']}>
         <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
         <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 110 }}>

            <View className="px-5 pt-6 pb-4 flex-row justify-between items-center">
                <View className="flex-row items-center">
                   <View className={`w-12 h-12 rounded-2xl items-center justify-center overflow-hidden mr-3 ${isDark ? 'bg-zinc-900 border border-zinc-800' : 'bg-white border border-zinc-200'}`}>
                      <Image 
                         source={require('../../assets/images/icon.png')} 
                         style={{ width: 48, height: 48 }}
                         resizeMode="contain"
                      />
                   </View>
                   <View>
                      <Text className={`text-xs font-bold uppercase tracking-widest ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>Daily Tracker</Text>
                      <Text className={`text-2xl font-black ${isDark ? 'text-white' : 'text-zinc-900'}`}>Bowlz</Text>
                   </View>
                </View>
               <TouchableOpacity 
                  onPress={() => navigation.navigate('Settings')}
                  className={`w-12 h-12 rounded-full items-center justify-center border ${isDark ? 'border-zinc-800 bg-zinc-900' : 'border-zinc-200 bg-white'}`}
               >
                  <Ionicons name="settings-outline" size={24} color={isDark ? '#e4e4e7' : '#18181b'} />
               </TouchableOpacity>
            </View>

            <View className="px-5 mt-4">
               <View className={`w-full rounded-[36px] p-6 shadow-xl ${isDark ? 'bg-zinc-900' : 'bg-white'}`} style={{ shadowColor: isDark ? '#000' : '#d4d4d8', shadowOpacity: 0.2, shadowRadius: 15, elevation: 5 }}>
                  <View className="flex-row justify-between items-center mb-6">
                     <View className="flex-1">
                        <Text className={`text-sm font-semibold mb-1 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Calories Consumed</Text>
                        <Text className={`text-4xl font-black ${isDark ? 'text-white' : 'text-zinc-900'}`}>{totalCalories}</Text>
                        
                        <View className="flex-row items-center mt-2">
                           <Ionicons name="flag" size={14} color={isDark ? '#a1a1aa' : '#71717a'} />
                           <TextInput
                              value={dailyGoal}
                              onChangeText={setDailyGoal}
                              keyboardType="numeric"
                              className={`ml-1 text-sm font-bold ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}
                              placeholderTextColor={isDark ? '#71717a' : '#a1a1aa'}
                           />
                           <Text className={`text-sm font-medium ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}> kcal goal</Text>
                        </View>
                     </View>

                     <View className="items-center justify-center">
                        <CircularProgress
                           value={progress > 1 ? 100 : progress * 100}
                           radius={50}
                           duration={1000}
                           progressValueColor={isDark ? '#e4e4e7' : '#18181b'}
                           maxValue={100}
                           title={'%'}
                           titleColor={isDark ? '#a1a1aa' : '#71717a'}
                           titleStyle={{fontWeight: 'bold'}}
                           activeStrokeColor={progress > 1 ? '#ef4444' : '#10b981'}
                           inActiveStrokeColor={isDark ? '#27272a' : '#f4f4f5'}
                           activeStrokeWidth={12}
                           inActiveStrokeWidth={12}
                        />
                     </View>
                  </View>

                  {progress > 1 && (
                     <View className="bg-red-500/10 rounded-xl p-3 mb-4 flex-row items-center justify-center">
                        <Ionicons name="warning" size={16} color="#ef4444" className="mr-2" />
                        <Text className="text-red-500 text-sm font-bold ml-1">Daily goal exceeded!</Text>
                     </View>
                  )}

                  <View className="mt-4 gap-3">
                     {(['breakfast', 'lunch', 'dinner', 'snacks'] as const).map((type) => (
                        <View key={type} className="flex-row justify-between items-center">
                           <View className="flex-row items-center">
                              <View className="w-3 h-3 rounded-full mr-3" style={{ backgroundColor: mealColors[type] }} />
                              <Text className={`text-base font-medium capitalize ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>{type}</Text>
                           </View>
                           <Text className={`text-base font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>{getMealTotal(type)} <Text className="text-sm font-normal text-zinc-500">cal</Text></Text>
                        </View>
                     ))}
                  </View>
               </View>
            </View>

            <View className="px-5 mt-8 mb-4 flex-row justify-between items-center">
               <Text className={`text-[19px] font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>Set Daily Goal</Text>
            </View>
            <View className="px-5 mb-8">
               <View className={`w-full rounded-[30px] p-6 justify-center border ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'} shadow-sm`}>
                  
                  <View className="flex-row justify-between items-baseline mb-4 px-2">
                     <Text className={`text-sm font-semibold ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Target</Text>
                     <View className="flex-row items-baseline">
                        <Text className={`text-3xl font-black ${isDark ? 'text-white' : 'text-zinc-900'}`}>{dailyGoal}</Text>
                        <Text className={`text-sm font-semibold ml-1 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>kcal</Text>
                     </View>
                  </View>

                  <Slider
                     style={{width: '100%', height: 40}}
                     minimumValue={0}
                     maximumValue={7000}
                     step={250}
                     value={parseInt(dailyGoal) || 2000}
                     onValueChange={(val) => setDailyGoal(val.toString())}
                     minimumTrackTintColor="#ff6b6b"
                     maximumTrackTintColor={isDark ? '#27272a' : '#f4f4f5'}
                     thumbTintColor="#ff6b6b"
                  />
                  
                  <View className="flex-row justify-between px-2 mt-1">
                     <Text className={`text-xs ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>0</Text>
                     <Text className={`text-xs ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>7000</Text>
                  </View>
                  
               </View>
            </View>

            <View className="px-5 flex-row justify-between items-center mb-4">
               <Text className={`text-[19px] font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>Quick Add Meal</Text>
            </View>
            <View className="px-5 mb-6">
               <View className={`w-full rounded-[24px] p-5 border ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'}`}>

                  <View className="flex-row flex-wrap gap-2 mb-6">
                     {(['breakfast', 'lunch', 'dinner', 'snacks'] as const).map((type) => {
                        const isSelected = currentMeal.type === type;
                        return (
                           <TouchableOpacity
                              key={type}
                              onPress={() => setCurrentMeal({ ...currentMeal, type })}
                              className={`px-4 py-2 rounded-full border ${isSelected ? 'border-transparent' : isDark ? 'border-zinc-700 bg-transparent' : 'border-zinc-200 bg-transparent'}`}
                              style={{ backgroundColor: isSelected ? mealColors[type] : undefined }}
                           >
                              <Text className={`capitalize text-sm font-semibold ${isSelected ? 'text-white' : isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>{type}</Text>
                           </TouchableOpacity>
                        );
                     })}
                  </View>

                  <View className="flex-row gap-3">
                     <View className={`flex-1 h-14 rounded-[16px] px-4 flex-row items-center border ${isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-[#f4f5f9] border-zinc-200'}`}>
                        <TextInput
                           placeholder="Calories"
                           placeholderTextColor={isDark ? '#71717a' : '#a1a1aa'}
                           className={`flex-1 text-base font-semibold ${isDark ? 'text-white' : 'text-zinc-900'}`}
                           value={currentMeal.calories ? currentMeal.calories.toString() : ''}
                           onChangeText={(text) => setCurrentMeal({ ...currentMeal, calories: parseInt(text) || 0 })}
                           keyboardType="numeric"
                        />
                        <Text className={`font-semibold ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>cal</Text>
                     </View>
                     <TouchableOpacity
                        className={`h-14 px-6 rounded-[16px] items-center justify-center ${currentMeal.calories > 0 ? 'bg-zinc-900 dark:bg-white' : 'bg-zinc-200 dark:bg-zinc-800'}`}
                        disabled={!currentMeal.calories || currentMeal.calories <= 0}
                        onPress={handleAddMeal}
                     >
                        <Text className={`font-bold text-base ${currentMeal.calories > 0 ? 'text-white dark:text-zinc-900' : 'text-zinc-400 dark:text-zinc-500'}`}>Add</Text>
                     </TouchableOpacity>
                  </View>

               </View>
            </View>

         </ScrollView>
      </SafeAreaView>
   );
}