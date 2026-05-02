import React from 'react';
import { View, Text, TouchableOpacity, useColorScheme } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import '../../global.css';

import { MealProvider } from '../context/MealContext';

function CustomTabBar({ state, descriptors, navigation }: any) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View className="absolute bottom-6 left-5 right-5 h-[76px] bg-[#1a1a1c] rounded-[38px] flex-row items-center justify-evenly px-2 shadow-2xl" style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 10 }}>
      {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
              ? options.title
              : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        if (route.name === 'create') {
          return (
            <View key={route.key} className="flex-1 items-center justify-center relative bottom-6">
              <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
                <View className={`w-[72px] h-[72px] rounded-full bg-[#1a1a1c] items-center justify-center border-[6px] ${isDark ? 'border-zinc-950' : 'border-[#f4f5f9]'}`}>
                  <View className="w-full h-full rounded-full items-center justify-center overflow-hidden" style={{ backgroundColor: '#ff6b6b' }}>
                    <View className="w-[150%] h-[150%] absolute rounded-full bg-[#ff8787] opacity-60" style={{ transform: [{ translateY: -15 }] }} />
                    <View className="w-[100%] h-[100%] absolute rounded-full bg-[#fa5252] opacity-80" style={{ transform: [{ translateX: -10 }] }} />
                    <Ionicons name="add" size={32} color="white" />
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          );
        }

        let iconName = 'home-outline';
        if (route.name === 'index') iconName = isFocused ? 'home' : 'home-outline';
        if (route.name === 'caltrac') iconName = isFocused ? 'pie-chart' : 'pie-chart-outline';

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            className="items-center justify-center flex-1"
          >
            <Ionicons name={iconName as any} size={24} color={isFocused ? 'white' : '#a1a1aa'} />
            <Text className={`text-[10px] mt-1 ${isFocused ? 'text-white font-semibold' : 'text-[#a1a1aa] font-medium'}`}>
              {label}
            </Text>
            {isFocused && <View className="w-[5px] h-[5px] bg-white rounded-full mt-[3px]" />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <MealProvider>
      <View style={{ flex: 1, backgroundColor: isDark ? '#09090b' : '#f4f5f9' }}>
        <Tabs
          tabBar={(props) => <CustomTabBar {...props} />}
          screenOptions={{ headerShown: false }}
        >
          <Tabs.Screen name="index" options={{ title: 'Home' }} />
          <Tabs.Screen name="create" />
          <Tabs.Screen name="caltrac" options={{ title: 'Caltrac' }} />
          <Tabs.Screen name="settings" options={{ href: null }} />
        </Tabs>
      </View>
    </MealProvider>
  );
}