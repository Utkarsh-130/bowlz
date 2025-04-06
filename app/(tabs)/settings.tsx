import React from 'react';
import { ScrollView, StyleSheet, Animated } from 'react-native';
import { List, Switch, useTheme, TextInput, Surface, IconButton } from 'react-native-paper';
import { ThemedView } from '@/components/ThemedView';
import { useThemePreference } from '@/hooks/useThemePreference';
import { IconSymbol } from '@/components/ui/IconSymbol';
import AsyncStorage from '@react-native-async-storage/async-storage';

const OPENROUTER_API_KEY = '@openrouter_api_key';

export default function SettingsScreen() {
  const theme = useTheme();
  const { theme: currentTheme, themePreference, setThemePreference } = useThemePreference();
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [emailUpdates, setEmailUpdates] = React.useState(false);
  const [apiKey, setApiKey] = React.useState('');
  const [isEditing, setIsEditing] = React.useState(false);
  const [pressedScale] = React.useState(new Animated.Value(1));

  React.useEffect(() => {
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

  const saveApiKey = async (newApiKey: string) => {
    try {
      await AsyncStorage.setItem(OPENROUTER_API_KEY, newApiKey);
      setApiKey(newApiKey);
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving API key:', error);
    }
  };

  const toggleDarkTheme = () => {
    setThemePreference(themePreference === 'system' ? (currentTheme === 'dark' ? 'light' : 'dark') : 'system');
  };

  const onPressIn = () => {
    Animated.spring(pressedScale, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const onPressOut = () => {
    Animated.spring(pressedScale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView>
        <Surface style={[styles.card, { backgroundColor: theme.colors.elevation.level2 }]}>
          <List.Section>
            <List.Subheader style={styles.sectionHeader}>Appearance</List.Subheader>
            <List.Item
              title="Dark Mode"
              left={props => <IconSymbol {...props} size={24} name="moon.fill" color={theme.colors.onSurface} />}
              right={() => (
                <Switch
                  value={currentTheme === 'dark'}
                  onValueChange={toggleDarkTheme}
                  color={theme.colors.primary}
                />
              )}
            />
          </List.Section>
        </Surface>

        <Surface style={[styles.card, { backgroundColor: theme.colors.elevation.level2 }]}>
          <List.Section>
            <List.Subheader style={styles.sectionHeader}>Notifications</List.Subheader>
            <List.Item
              title="Push Notifications"
              description="Receive alerts and reminders"
              left={props => <IconSymbol {...props} size={24} name="bell.fill" color={theme.colors.onSurface} />}
              right={() => (
                <Switch
                  value={notificationsEnabled}
                  onValueChange={setNotificationsEnabled}
                  color={theme.colors.primary}
                />
              )}
            />
            <List.Item
              title="Email Updates"
              description="Receive weekly summaries"
              left={props => <IconSymbol {...props} size={24} name="envelope.fill" color={theme.colors.onSurface} />}
              right={() => (
                <Switch
                  value={emailUpdates}
                  onValueChange={setEmailUpdates}
                  color={theme.colors.primary}
                />
              )}
            />
          </List.Section>
        </Surface>

        <Surface style={[styles.card, { backgroundColor: theme.colors.elevation.level2 }]}>
          <List.Section>
            <List.Subheader style={styles.sectionHeader}>API Configuration</List.Subheader>
            {isEditing ? (
              <List.Item
                title="OpenRouter API Key"
                description={
                  <TextInput
                    value={apiKey}
                    onChangeText={setApiKey}
                    secureTextEntry
                    mode="flat"
                    style={{ backgroundColor: 'transparent' }}
                    right={<TextInput.Icon icon="check" onPress={() => saveApiKey(apiKey)} />}
                  />
                }
                left={props => <IconSymbol {...props} size={24} name="key.fill" color={theme.colors.onSurface} />}
              />
            ) : (
              <List.Item
                title="OpenRouter API Key"
                description={apiKey ? '••••••••' + apiKey.slice(-4) : 'Not set'}
                left={props => <IconSymbol {...props} size={24} name="key.fill" color={theme.colors.onSurface} />}
                onPress={() => setIsEditing(true)}
                right={props => <IconButton {...props} icon="pencil" onPress={() => setIsEditing(true)} />}
              />
            )}
          </List.Section>
        </Surface>

        <Animated.View style={{ transform: [{ scale: pressedScale }] }}>
          <Surface style={[styles.card, { backgroundColor: theme.colors.elevation.level2 }]}>
            <List.Section>
              <List.Subheader style={styles.sectionHeader}>Account</List.Subheader>
              <List.Item
                title="Profile"
                description="Manage your account information"
                left={props => <IconSymbol {...props} size={24} name="person.fill" color={theme.colors.onSurface} />}
                right={props => <IconButton {...props} icon="chevron-right" />}
                onPress={() => {}}
                onPressIn={onPressIn}
                onPressOut={onPressOut}
              />
              <List.Item
                title="Privacy"
                description="Control your data and privacy settings"
                left={props => <IconSymbol {...props} size={24} name="lock.fill" color={theme.colors.onSurface} />}
                right={props => <IconButton {...props} icon="chevron-right" />}
                onPress={() => {}}
                onPressIn={onPressIn}
                onPressOut={onPressOut}
              />
              <List.Item
                title="Help & Support"
                description="Get assistance and view documentation"
                left={props => <IconSymbol {...props} size={24} name="questionmark.circle.fill" color={theme.colors.onSurface} />}
                right={props => <IconButton {...props} icon="chevron-right" />}
                onPress={() => {}}
                onPressIn={onPressIn}
                onPressOut={onPressOut}
              />
            </List.Section>
          </Surface>
        </Animated.View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    margin: 12,
    borderRadius: 12,
    elevation: 2,
    overflow: 'hidden',
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '600',
    color: theme => theme.colors.primary,
    paddingVertical: 8,
  },
});