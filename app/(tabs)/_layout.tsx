import React from 'react';
import { View, StyleSheet, useColorScheme } from 'react-native';

import { CommonActions } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, BottomNavigation, useTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
  import Index from'./index';
import SettingsScreen from'./settings'
import Create from'./Create';
import CalTracScreen from './caltrac';
const Tab = createBottomTabNavigator();

export default function TabLayout() {
  const theme = useTheme();
  const colorScheme = useColorScheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
      }}
      tabBar={({ navigation, state, descriptors, insets }) => (
        <BottomNavigation.Bar
          navigationState={state}
          safeAreaInsets={insets}
          style={{
            backgroundColor: colorScheme === 'dark' ? '#1a1a1a' : '#ffffff'
          }}
          onTabPress={({ route, preventDefault }) => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (event.defaultPrevented) {
              preventDefault();
            } else {
              navigation.dispatch({
                ...CommonActions.navigate(route.name, route.params),
                target: state.key,
              });
            }
          }}
          renderIcon={({ route, focused, color }) => {
            const { options } = descriptors[route.key];
            if (options.tabBarIcon) {
              return options.tabBarIcon({ focused, color, size: 24 });
            }
            return null;
          }}
          getLabelText={({ route }) => {
            const { options } = descriptors[route.key];
            const label =
              options.tabBarLabel !== undefined
                ? options.tabBarLabel.toString()
                : options.title !== undefined
                ? options.title
                : route.name;

            return label;
          }}
        />
      )}
    >


    
      <Tab.Screen
        name="Home"
        component={Index}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => {
            return <Icon name="home" size={size} color={color} />;
          },
        }}
      />
       <Tab.Screen
        name="Create"
        component={Create}
        options={{
          tabBarLabel: 'Create',
          tabBarIcon: ({ color, size }) => {
            return <Icon name="plus-circle" size={size} color={color} />;
          },
        }}
      />
       <Tab.Screen
        name="Caltrac"
        component={CalTracScreen}
        options={{
          tabBarLabel: 'Caltrac',
          tabBarIcon: ({ color, size }) => {
            return <Icon name="calculator" size={size} color={color} />;
          },
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color, size }) => {
            return <Icon name="cog" size={size} color={color} />;
          },
        }}
      />
    </Tab.Navigator>
  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});