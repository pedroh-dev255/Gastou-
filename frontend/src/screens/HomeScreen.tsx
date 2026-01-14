import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../components/ThemeContext';
import { useTheme as useNavTheme } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import { updateUserOnboardingCompleted } from '../database/domains/users/userRepository';

export default function HomeScreen() {
  const { darkMode, toggleDarkMode } = useTheme();
  const { colors } = useNavTheme();
  const styles = createStyles(colors, darkMode);
  const navigation = useNavigation<any>();

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Casa</Text>

      <TouchableOpacity
        onPress={async () => {
          await updateUserOnboardingCompleted(0);
          navigation.reset({
            index: 0,
            routes: [{ name: 'Onboarding' }],
          });
        }}
      >
        <Text style={{ color: colors.primary }}>
          Entrar no onboarding(debug)
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const createStyles = (colors: any, darkMode: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',

  },
  text: {
    fontSize: 22,
    color: colors.text,
    fontWeight: 'bold',
  },
});
