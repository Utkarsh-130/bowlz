import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, TextInput, useColorScheme, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import useMeals from '../context/MealContext';
import { supabase } from '../../lib/supabase';
import { Alert } from 'react-native';

const OPENROUTER_API_KEY = '@openrouter_api_key';

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const { isGuest, setIsGuest } = useMeals();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      setIsGuest(true);
      Alert.alert('Logged Out', 'You are now in guest mode.');
    }
  };

  const handleLogin = async () => {
    
    Alert.alert('Cloud Sync', 'Please log in via the web app to enable cloud sync, or provide credentials here if implemented.');
  };

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    loadApiKey();
  }, []);

  const loadApiKey = async () => {
    try {
      const savedApiKey = await AsyncStorage.getItem(OPENROUTER_API_KEY);
      if (savedApiKey) {
        setApiKey(savedApiKey);
      }
    } catch (error) {
      console.error('Error loading API key:', error);
    }
  };

  const saveApiKey = async () => {
    try {
      await AsyncStorage.setItem(OPENROUTER_API_KEY, apiKey);
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving API key:', error);
    }
  };

  const SettingItem = ({ icon, title, subtitle, right, last }: any) => (
    <View className={`flex-row items-center justify-between p-4 ${!last ? 'border-b' : ''} ${isDark ? 'border-zinc-800' : 'border-zinc-100'}`}>
      <View className="flex-row items-center flex-1">
        <View className={`w-10 h-10 rounded-full items-center justify-center ${isDark ? 'bg-zinc-800' : 'bg-zinc-50'}`}>
          <Ionicons name={icon} size={20} color={isDark ? '#e4e4e7' : '#18181b'} />
        </View>
        <View className="ml-4 flex-1">
          <Text className={`text-[15px] font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>{title}</Text>
          {subtitle && <Text className={`text-[12px] mt-0.5 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>{subtitle}</Text>}
        </View>
      </View>
      {right}
    </View>
  );

  return (
    <SafeAreaView className={`flex-1 ${isDark ? 'bg-zinc-950' : 'bg-[#f4f5f9]'}`} edges={['top']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 110 }}>
        
        <View className="px-5 pt-10 pb-6 items-center">
          <Text className={`text-3xl font-black tracking-tight ${isDark ? 'text-white' : 'text-zinc-900'}`}>Settings</Text>
          <Text className={`text-[14px] mt-2 font-medium ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Personalize your experience</Text>
        </View>

        <View className="px-5 mt-4">
          <Text className={`text-[17px] font-bold mb-3 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Appearance</Text>
          <View className={`rounded-[24px] overflow-hidden border ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-100'}`}>
            <SettingItem 
              icon="moon-outline" 
              title="Dark Mode" 
              subtitle="Always on dark aesthetic"
              right={<Switch value={true} disabled trackColor={{ false: '#71717a', true: '#10b981' }} />}
              last
            />
          </View>
        </View>

        <View className="px-5 mt-8">
          <Text className={`text-[17px] font-bold mb-3 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Notifications</Text>
          <View className={`rounded-[24px] overflow-hidden border ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-100'}`}>
            <SettingItem 
              icon="notifications-outline" 
              title="Push Notifications" 
              subtitle="Receive alerts and reminders"
              right={<Switch value={notificationsEnabled} onValueChange={setNotificationsEnabled} trackColor={{ false: '#71717a', true: '#10b981' }} />}
            />
            <SettingItem 
              icon="mail-outline" 
              title="Email Updates" 
              subtitle="Weekly summaries and news"
              right={<Switch value={emailUpdates} onValueChange={setEmailUpdates} trackColor={{ false: '#71717a', true: '#10b981' }} />}
              last
            />
          </View>
        </View>

        <View className="px-5 mt-8">
          <Text className={`text-[17px] font-bold mb-3 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>API Configuration</Text>
          <View className={`rounded-[24px] overflow-hidden border ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-100'}`}>
            <View className="p-4">
              <View className="flex-row items-center mb-3">
                 <View className={`w-10 h-10 rounded-full items-center justify-center ${isDark ? 'bg-zinc-800' : 'bg-zinc-50'}`}>
                    <Ionicons name="key-outline" size={20} color={isDark ? '#e4e4e7' : '#18181b'} />
                 </View>
                 <Text className={`ml-4 text-[15px] font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>OpenRouter API Key</Text>
              </View>
              
              {isEditing ? (
                <View className="flex-row gap-3">
                  <View className={`flex-1 h-12 rounded-xl px-4 flex-row items-center border ${isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-zinc-50 border-zinc-100'}`}>
                     <TextInput 
                        className={`flex-1 text-[14px] ${isDark ? 'text-white' : 'text-zinc-900'}`}
                        value={apiKey}
                        onChangeText={setApiKey}
                        placeholder="Enter API Key"
                        placeholderTextColor={isDark ? '#71717a' : '#a1a1aa'}
                        secureTextEntry
                     />
                  </View>
                  <TouchableOpacity onPress={saveApiKey} className="h-12 px-5 bg-zinc-900 dark:bg-white rounded-xl items-center justify-center">
                    <Text className="font-bold text-white dark:text-zinc-900">Save</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View className="flex-row items-center justify-between">
                  <Text className={`text-[13px] ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                    {apiKey ? '••••••••' + apiKey.slice(-4) : 'Not configured'}
                  </Text>
                  <TouchableOpacity onPress={() => setIsEditing(true)} className={`h-10 px-4 rounded-xl items-center justify-center border ${isDark ? 'border-zinc-800' : 'border-zinc-200'}`}>
                    <Text className={`text-[13px] font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>Edit</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </View>

        <View className="px-5 mt-8">
          <Text className={`text-[17px] font-bold mb-3 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Cloud Sync</Text>
          <View className={`rounded-[24px] overflow-hidden border ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-100'}`}>
            <SettingItem 
              icon="cloud-upload-outline" 
              title={isGuest ? "Guest Mode" : "Cloud Synced"} 
              subtitle={isGuest ? "Data is saved locally on this device" : "Your data is backed up to Bowlz Cloud"}
              right={
                <TouchableOpacity 
                  onPress={() => isGuest ? handleLogin() : handleLogout()}
                  className={`px-4 py-2 rounded-xl ${isGuest ? 'bg-zinc-900 dark:bg-white' : 'bg-red-500'}`}
                >
                  <Text className={`text-[13px] font-bold ${isGuest ? 'text-white dark:text-zinc-900' : 'text-white'}`}>
                    {isGuest ? "Sign In" : "Sign Out"}
                  </Text>
                </TouchableOpacity>
              }
              last={!isGuest}
            />
            {isGuest && (
              <SettingItem 
                icon="sync-outline" 
                title="Sync Local Data" 
                subtitle="Push guest data to cloud after login"
                right={<Ionicons name="chevron-forward" size={18} color="#71717a" />}
                last
              />
            )}
          </View>
        </View>

        <View className="px-5 mt-8">
          <Text className={`text-[17px] font-bold mb-3 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Account</Text>
          <View className={`rounded-[24px] overflow-hidden border ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-100'}`}>
            <SettingItem icon="person-outline" title="Profile" subtitle="Account details & more" right={<Ionicons name="chevron-forward" size={18} color="#71717a" />} />
            <SettingItem icon="shield-checkmark-outline" title="Privacy" subtitle="Data & security levels" right={<Ionicons name="chevron-forward" size={18} color="#71717a" />} />
            <SettingItem icon="help-circle-outline" title="Support" subtitle="Documentation & FAQs" right={<Ionicons name="chevron-forward" size={18} color="#71717a" />} last />
          </View>
        </View>

        <View className="px-5 mt-12 mb-10 items-center">
          <Text className="text-zinc-500 text-[11px] font-medium tracking-widest uppercase">Bowlz v1.0.0</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
