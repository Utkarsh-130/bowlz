import React from 'react';
import { ScrollView } from 'react-native';
import { List, Switch, useTheme, Divider } from 'react-native-paper';
import { ThemedView } from '@/components/ThemedView';
import { useThemePreference } from '@/hooks/useThemePreference';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function SettingsScreen() {
  const theme = useTheme();
  const { theme: currentTheme, themePreference, setThemePreference } = useThemePreference();
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [emailUpdates, setEmailUpdates] = React.useState(false);

  const toggleDarkTheme = () => {
    setThemePreference(themePreference === 'system' ? (currentTheme === 'dark' ? 'light' : 'dark') : 'system');
  };

  return (
    <ThemedView style={{ flex: 1 }}>
      <ScrollView>
        <List.Section>
          <List.Subheader>Appearance</List.Subheader>
          <List.Item
            title="Dark Mode"
            left={() => <IconSymbol size={24} name="moon.fill" color={theme.colors.onSurface} />}
            right={() => (
              <Switch
                value={currentTheme === 'dark'}
                onValueChange={toggleDarkTheme}
              />
            )}
          />
        </List.Section>

        <Divider />

        <List.Section>
          <List.Subheader>Notifications</List.Subheader>
          <List.Item
            title="Push Notifications"
            description="Receive alerts and reminders"
            left={() => <IconSymbol size={24} name="bell.fill" color={theme.colors.onSurface} />}
            right={() => (
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
              />
            )}
          />
          <List.Item
            title="Email Updates"
            description="Receive weekly summaries"
            left={() => <IconSymbol size={24} name="envelope.fill" color={theme.colors.onSurface} />}
            right={() => (
              <Switch
                value={emailUpdates}
                onValueChange={setEmailUpdates}
              />
            )}
          />
        </List.Section>

        <Divider />

        <List.Section>
          <List.Subheader>Account</List.Subheader>
          <List.Item
            title="Profile"
            description="Manage your account information"
            left={() => <IconSymbol size={24} name="person.fill" color={theme.colors.onSurface} />}
            onPress={() => {}}
          />
          <List.Item
            title="Privacy"
            description="Control your data and privacy settings"
            left={() => <IconSymbol size={24} name="lock.fill" color={theme.colors.onSurface} />}
            onPress={() => {}}
          />
          <List.Item
            title="Help & Support"
            description="Get assistance and view documentation"
            left={() => <IconSymbol size={24} name="questionmark.circle.fill" color={theme.colors.onSurface} />}
            onPress={() => {}}
          />
        </List.Section>
      </ScrollView>
    </ThemedView>
  );
}