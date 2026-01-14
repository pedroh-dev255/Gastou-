import React, { useEffect, useState } from 'react';
import { StatusBar } from 'react-native';
import {
  NavigationContainer,
} from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import notifee, { AndroidImportance } from '@notifee/react-native';
import { Platform, Alert, Linking } from 'react-native';

import {
  BatteryOptEnabled,
  OpenOptimizationSettings,
  RequestDisableOptimization,
} from 'react-native-battery-optimization-check';

import { ThemeProvider, useTheme } from './src/components/ThemeContext';
import { useTheme as useNavTheme } from '@react-navigation/native';

// Screens
import HomeScreen from './src/screens/HomeScreen';
import LancamentosScreen from './src/screens/LancamentosScreen';
import ConfigsScreen from './src/screens/ConfigsScreen';
import DebugDatabaseScreen from './src/screens/configs/DebugDatabaseScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';

// Database
import { runMigrations } from './src/database/migrations/init';
import { getUser } from './src/database/domains/users/userRepository';
import DeviceInfo from 'react-native-device-info';


async function checkBatterySaver() {
  if (Platform.OS === 'android') {
    const isOptimized = await BatteryOptEnabled();
    if (isOptimized) {
      await Alert.alert(
        'Economia de bateria ativa',
        'Para notificações funcionarem corretamente, desative o modo de economia de bateria para este app.'
      );

      await RequestDisableOptimization();
    }
  }
}
const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();


export async function createDefaultChannel() {
  await notifee.createChannel({
    id: 'default',
    name: 'Default Channel',
    vibration: true,
    sound: 'notification_sound',
    importance: AndroidImportance.HIGH,
  });
}

function TabRoutes() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          height: 60,
          marginBottom: 55,
        },
        tabBarLabelStyle: {
          fontSize: 12,
        },
        tabBarActiveTintColor: '#315174',
        tabBarInactiveTintColor: '#999',
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Feather name="home" size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="Lançamentos"
        component={LancamentosScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Feather name="list" size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="Configurações"
        component={ConfigsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Feather name="settings" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

/**
 * Root Navigation
 */
function RootNavigation() {
  const { theme, darkMode } = useTheme();

  const [loading, setLoading] = useState(true);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);




  useEffect(() => {
    async function bootstrap() {
      runMigrations();
      createDefaultChannel();

      checkBatterySaver();

      const user = await getUser();
      setOnboardingCompleted(user?.onboarding_completed === 1);

      setLoading(false);
    }

    bootstrap();
  }, []);

  if (loading) return null;

  return (
    <NavigationContainer theme={theme}>
      <StatusBar barStyle={darkMode ? 'light-content' : 'dark-content'} />

      <Stack.Navigator
        screenOptions={{ headerShown: false }}
        initialRouteName={onboardingCompleted ? 'Tabs' : 'Onboarding'}
      >
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Tabs" component={TabRoutes} />
        <Stack.Screen
          name="DebugDatabase"
          component={DebugDatabaseScreen}
          options={{ presentation: 'modal' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

/**
 * App Root
 */
export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <RootNavigation />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
