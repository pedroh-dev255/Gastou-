import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../components/ThemeContext';
import { useTheme as useNavTheme } from '@react-navigation/native';

export default function HomeScreen() {
  const { darkMode, toggleDarkMode } = useTheme();
  const { colors } = useNavTheme();
  const styles = createStyles(colors, darkMode);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Casa</Text>
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
