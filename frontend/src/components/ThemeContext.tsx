import React, { createContext, useContext, useEffect, useState } from 'react';
import { DarkTheme, DefaultTheme, Theme } from '@react-navigation/native';
import { getUser, updateUserDarkMode } from '../database/domains/users/userRepository';

type ThemeContextType = {
  darkMode: boolean;
  theme: Theme;
  toggleDarkMode: (value: boolean) => Promise<void>;
};

const ThemeContext = createContext<ThemeContextType>({} as ThemeContextType);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    async function loadTheme() {
      const user = await getUser();
      setDarkMode(user?.dark_mode === 1);
    }

    loadTheme();
  }, []);

  async function toggleDarkMode(value: boolean) {
    setDarkMode(value); // UI muda na hora
    await updateUserDarkMode(value ? true : false); // persiste
  }

  return (
    <ThemeContext.Provider
      value={{
        darkMode,
        theme: darkMode ? DarkTheme : DefaultTheme,
        toggleDarkMode,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
