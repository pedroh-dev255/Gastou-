import React, { useEffect, useState } from 'react';
import { StatusBar } from 'react-native';
import {
  NavigationContainer,
} from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import AuthGate from './src/security/authGate';

import {SafeAreaProvider, SafeAreaView, useSafeAreaInsets  } from 'react-native-safe-area-context';

import Feather from 'react-native-vector-icons/Feather';
import notifee, { AndroidImportance } from '@notifee/react-native';
import { Platform, Alert } from 'react-native';

import {
  BatteryOptEnabled,
  RequestDisableOptimization,
} from 'react-native-battery-optimization-check';

import { ThemeProvider, useTheme } from './src/components/ThemeContext';


// Screens
import HomeScreen from './src/screens/HomeScreen';
import LancamentosScreen from './src/screens/LancamentosScreen';
import ConfigsScreen from './src/screens/ConfigsScreen';
import DebugDatabaseScreen from './src/screens/configs/DebugDatabaseScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';

// Database
import { runMigrations } from './src/database/migrations/init';
import { getUser } from './src/database/domains/users/userRepository';


async function checkBatterySaver() {
  if (Platform.OS === 'android') {
    const isOptimized = await BatteryOptEnabled();
    if (isOptimized) {
      await Alert.alert(
        'Economia de bateria ativa',
        'Para notificações funcionarem corretamente, desative o modo de economia de bateria para este app.',
        [{ text: 'Desativar para este app',
          onPress: async () => {
            await RequestDisableOptimization();
          },
        }]
      );

      
    }
  }
}
const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();


export async function createDefaultChannel() {
  await notifee.createChannel({
    id: 'alert',
    name: 'Canal de Alerta',
    vibration: true,
    sound: 'alert',
    importance: AndroidImportance.HIGH,
  });
  
  await notifee.createChannel({
    id: 'default',
    name: 'Default Channel',
    vibration: true,
    sound: 'notification_sound',
    importance: AndroidImportance.HIGH,
  });
}


function TabRoutes() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarStyle: {
          height: 60,
          paddingBottom: insets.bottom,
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

function RootNavigation() {
  const { theme, darkMode } = useTheme();

  const [loading, setLoading] = useState(true);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);

  useEffect(() => {
    async function bootstrap() {
      const user = await getUser();
      setOnboardingCompleted(user?.onboarding_completed === 1);
      setLoading(false);
    }

    bootstrap();
  }, []);

  if (loading) return null;

  return (
    <SafeAreaView style={{ flex: 1, paddingTop: 0, backgroundColor: darkMode ? 'black' : 'white' }} edges={['top', 'bottom']}>
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
    </SafeAreaView>
  );
}

/**
 * App Root
 */
export default function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function init() {
      await runMigrations();
      await createDefaultChannel();
      await checkBatterySaver();
      setReady(true);
    }

    init();
  }, []);

  if (!ready) return null;

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthGate>
          <RootNavigation />
        </AuthGate>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

