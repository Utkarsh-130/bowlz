import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, useColorScheme, StatusBar, KeyboardAvoidingView, Platform, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, Ionicons } from '@expo/vector-icons';
import foodDatabase from '../../assets/foods.json';
import useMeals, { MealType } from '../context/MealContext';

export default function CalTrac() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [searchQuery, setSearchQuery] = useState('');
  const [weight, setWeight] = useState('');
  const [selectedFood, setSelectedFood] = useState<typeof foodDatabase[0] | null>(null);

  const { meals, addMeal } = useMeals();

  const getAutoMealType = (): MealType => {
    const hour = new Date().getHours();
    const minutes = new Date().getMinutes();
    const time = hour + minutes / 60;

    if (time >= 7 && time <= 9.5) return 'breakfast';
    if (time >= 13 && time <= 16) return 'lunch';
    if (time >= 19 && time <= 21) return 'dinner';
    return 'snacks';
  };

  const filteredFoods = useMemo(() => {
    if (!searchQuery) return;
    return foodDatabase.filter(food => food.item.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 5);
  }, [searchQuery]);

  const handleAddFood = () => {
    if (selectedFood && weight) {
      const grams = parseFloat(weight);
      if (!isNaN(grams)) {
        const consumedCalories = (selectedFood.calories_per_gram * grams).toFixed(1);
        
        addMeal({
           item: selectedFood.item,
           calories: parseFloat(consumedCalories),
           type: getAutoMealType(),
           weight: grams,
        });

        setSearchQuery('');
        setWeight('');
        setSelectedFood(null);
      }
    }
  };

  const totalCalories = useMemo(() => {
    return meals.reduce((acc, curr) => acc + curr.calories, 0).toFixed(0);
  }, [meals]);

  return (
    <SafeAreaView className={`flex-1 ${isDark ? 'bg-zinc-950' : 'bg-[#f4f5f9]'}`} edges={['top']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
          <View className="px-5 pt-8 pb-4">
            <Text className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>Calorie Tracker</Text>
            <Text className={`text-base mt-2 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Log your meals today</Text>
          </View>

          <View className="px-5 mt-4 mb-8">
             <View className={`w-full rounded-[30px] p-8 items-center justify-center shadow-lg ${isDark ? 'bg-zinc-900' : 'bg-white'}`} style={{ shadowColor: isDark ? '#000' : '#d4d4d8', shadowOpacity: 0.2, shadowRadius: 15, elevation: 5 }}>
                <Text className={`text-sm font-medium ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Total Calories Today</Text>
                <View className="flex-row items-baseline mt-2">
                   <Text className={`text-5xl font-black ${isDark ? 'text-white' : 'text-zinc-900'}`}>{totalCalories}</Text>
                   <Text className={`text-lg ml-2 font-medium ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>kcal</Text>
                </View>
             </View>
          </View>

          <View className="px-5 gap-4">
            <View>
              <Text className={`text-[15px] font-bold mb-3 ${isDark ? 'text-white' : 'text-zinc-900'}`}>Add a Meal</Text>
              <View className={`h-14 rounded-[20px] px-4 flex-row items-center border ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'}`}>
                <Feather name="search" size={20} color={isDark ? '#a1a1aa' : '#71717a'} />
                <TextInput
                  placeholder="Search food (e.g., Paneer Butter Masala)"
                  placeholderTextColor={isDark ? '#a1a1aa' : '#71717a'}
                  className={`flex-1 ml-3 text-base ${isDark ? 'text-white' : 'text-zinc-900'}`}
                  value={searchQuery}
                  onChangeText={(text) => {
                    setSearchQuery(text);
                    setSelectedFood(null);
                  }}
                />
                {searchQuery.length > 0 && (
                   <TouchableOpacity onPress={() => { setSearchQuery(''); setSelectedFood(null); setWeight(''); }}>
                      <Ionicons name="close-circle" size={20} color={isDark ? '#a1a1aa' : '#71717a'} />
                   </TouchableOpacity>
                )}
              </View>

              {searchQuery.length > 0 && !selectedFood && filteredFoods && filteredFoods.length > 0 && (
                <View className={`mt-2 rounded-[20px] overflow-hidden border ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'}`}>
                   {filteredFoods.map((food, index) => (
                      <TouchableOpacity 
                         key={index}
                         className={`p-4 border-b ${isDark ? 'border-zinc-800' : 'border-zinc-100'}`}
                         onPress={() => {
                            setSelectedFood(food);
                            setSearchQuery(food.item);
                         }}
                      >
                         <Text className={`text-base font-medium ${isDark ? 'text-white' : 'text-zinc-900'}`}>{food.item}</Text>
                         <Text className={`text-xs mt-1 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>{food.region} • {food.calories_per_gram} kcal/g</Text>
                      </TouchableOpacity>
                   ))}
                </View>
              )}
            </View>

            {selectedFood && (
               <View className={`rounded-[24px] p-5 mt-2 border ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'}`}>
                  <Text className={`text-lg font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>{selectedFood.item}</Text>
                  <Text className={`text-sm mb-4 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>{selectedFood.calories_per_gram} kcal per gram</Text>
                  
                  <View className="flex-row gap-3">
                     <View className={`flex-1 h-14 rounded-[16px] px-4 flex-row items-center border ${isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-[#f4f5f9] border-zinc-200'}`}>
                        <TextInput
                           placeholder="Weight in grams"
                           placeholderTextColor={isDark ? '#71717a' : '#a1a1aa'}
                           className={`flex-1 text-base ${isDark ? 'text-white' : 'text-zinc-900'}`}
                           value={weight}
                           onChangeText={setWeight}
                           keyboardType="numeric"
                        />
                        <Text className={`font-semibold ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>g</Text>
                     </View>
                     <TouchableOpacity 
                        className={`h-14 px-6 rounded-[16px] items-center justify-center ${weight && parseFloat(weight) > 0 ? 'bg-[#ff6b6b]' : 'bg-zinc-300 dark:bg-zinc-800'}`}
                        disabled={!weight || parseFloat(weight) <= 0}
                        onPress={handleAddFood}
                     >
                        <Text className={`font-bold text-base ${weight && parseFloat(weight) > 0 ? 'text-white' : 'text-zinc-500 dark:text-zinc-500'}`}>Add</Text>
                     </TouchableOpacity>
                  </View>
               </View>
            )}
          </View>

          {meals.length > 0 && (
             <View className="px-5 mt-10">
                <Text className={`text-[17px] font-bold mb-4 ${isDark ? 'text-white' : 'text-zinc-900'}`}>Consumed Today</Text>
                <View className="gap-3">
                   {meals.map(item => (
                      <View key={item.id} className={`flex-row items-center justify-between p-4 rounded-[20px] border ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-100'}`}>
                         <View className="flex-row items-center gap-4">
                            <View className={`w-12 h-12 rounded-full items-center justify-center ${isDark ? 'bg-zinc-800' : 'bg-zinc-100'}`}>
                               <Ionicons name="fast-food-outline" size={24} color={isDark ? '#e4e4e7' : '#18181b'} />
                            </View>
                            <View>
                               <Text className={`text-[15px] font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>{item.item}</Text>
                               <Text className={`text-[12px] mt-1 ${isDark ? 'text-zinc-400' : 'text-zinc-500'} capitalize`}>
                                 {item.weight ? `${item.weight}g • ` : ''}{item.type}
                               </Text>
                            </View>
                         </View>
                         <View className="items-end">
                            <Text className={`text-[16px] font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>{item.calories}</Text>
                            <Text className={`text-[10px] ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>kcal</Text>
                         </View>
                      </View>
                   ))}
                </View>
             </View>
          )}

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}