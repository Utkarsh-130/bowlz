import { Tabs } from 'expo-router';
import React from 'react';
import { BottomNavigation, useTheme } from 'react-native-paper';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const theme = useTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopWidth: 0,
          elevation: 4,
        },
        tabBar: ({ navigation, state, descriptors }) => (
          <BottomNavigation.Bar
            navigationState={state}
            onTabPress={({ route }) => navigation.navigate(route.name)}
            renderIcon={({ route, focused, color }) => {
              const { options } = descriptors[route.key];
              return options.tabBarIcon?.({ color, focused });
            }}
            activeColor={Colors[colorScheme ?? 'light'].tint}
            inactiveColor={theme.colors.onSurfaceVariant}
            style={{
              elevation: 4,
            }}
          />
        ),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="caltrac"
        options={{
          title: 'Calories',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="camera.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="gear" color={color} />,
        }}
      />
    </Tabs>
  );
}