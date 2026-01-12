import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Animated,
  Dimensions,
  Switch,
  Alert,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { updateUserOnboardingCompleted, getUser, updateUserName, updateUserNotificationsEnabled } from '../database/domains/users/userRepository';
import { useNavigation } from '@react-navigation/native';
import { Platform } from 'react-native';
import notifee from '@notifee/react-native';
import { useTheme } from '../components/ThemeContext';

import EditUserNameModal from '../components/EditUserNameModal';

const { width } = Dimensions.get('window');

export default function OnboardingScreen() {
  const navigation = useNavigation<any>();
  const [userName, setUserName] = useState('Usuário');
  const [modalVisible, setModalVisible] = useState(false);
  const { darkMode, toggleDarkMode } = useTheme();
  const [notifications, setNotifications] = useState(false);
  const [step, setStep] = useState(0);

  const translateX = useRef(new Animated.Value(0)).current;

  const styles = createStyles(darkMode);

  useEffect(() => {
    loadUser();
  }, []);

  async function loadUser() {
    const user = await getUser();
    if (user?.nome) setUserName(user.nome);
    if (user?.notifications_enabled !== undefined)
      setNotifications(user.notifications_enabled === 1);
  }

  async function finishOnboarding() {
    await updateUserOnboardingCompleted(1);
    navigation.reset({
      index: 0,
      routes: [{ name: 'Tabs' }],
    });
  }

  async function handleSaveName(name: string) {
    await updateUserName(name);
    setUserName(name);
    setModalVisible(false);
  }

  async function updateNotifications(value: boolean) {
    if (value) {
      if (Platform.OS === 'android' && Platform.Version >= 33) {
        await notifee.requestPermission();
        const settings = await notifee.getNotificationSettings();
        if (settings.authorizationStatus < 1) {
          Alert.alert(
            'Permissão negada',
            'As notificações estão desativadas. Ative nas configurações do sistema.'
          );
          value = false;
        }
      }
    }
    setNotifications(value);
    updateUserNotificationsEnabled(value);
  }

  function next() {
    Animated.timing(translateX, {
      toValue: -width,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setStep(step + 1);
      translateX.setValue(width);
      Animated.timing(translateX, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    });
  }

  function renderStep() {
    // Step 0: Boas-vindas
    if (step === 0) {
      return (
        <>
          <Image
            source={require('../assets/appIcon_512.png')}
            style={{ width: 200, height: 200, borderRadius: 100 }}
          />
          <Text style={styles.title}>Bem-vindo ao Gastou?</Text>
          <Text style={styles.subtitle}>Seu assistente financeiro pessoal.</Text>
        </>
      );
    }

    // Step 1: Configurações iniciais do usuário
    if (step === 1) {
      return (
        <>
          <Text style={styles.title}>Configurações iniciais</Text>
          <Text style={styles.subtitle}>Defina como você quer usar o app.</Text>

          <View style={styles.form}>
            <TouchableOpacity
              style={styles.item}
              onPress={() => setModalVisible(true)}
            >
              <Text style={styles.label}>Como gostaria de ser chamado?</Text>
              <Text style={styles.value}>{userName}</Text>
            </TouchableOpacity>

            <View style={styles.item}>
              <Text style={styles.label}>Tema escuro</Text>
              <Switch value={darkMode} onValueChange={toggleDarkMode} />
            </View>

            <View style={styles.item}>
              <Text style={styles.label}>Notificações</Text>
              <Switch value={notifications} onValueChange={updateNotifications} />
            </View>
          </View>

           <View style={styles.footer}>
              <TouchableOpacity style={styles.nextButton} onPress={next}>
                <Feather name="arrow-right" size={24} color={darkMode ? 'black' : 'white'} />
              </TouchableOpacity>
            </View>

          <EditUserNameModal
            visible={modalVisible}
            initialValue={userName}
            onClose={() => setModalVisible(false)}
            onSave={handleSaveName}
          />
        </>
      );
    }

    // Step 2: Configuração dos bancos
    if (step === 2) {
      return (
        <>
          <Text style={styles.title}>Configuração dos bancos</Text>
          <Text style={styles.subtitle}>Adicione suas contas bancárias para acompanhar seus gastos.</Text>

          <View style={styles.form}>
            <TouchableOpacity style={styles.item}>
              <Text style={styles.label}>Adicionar conta bancária</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.item}>
              <Text style={styles.label}>Ver contas cadastradas</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.finishButton}
            onPress={finishOnboarding}
          >
            <Text style={{ color: 'white' }}>Finalizar</Text>
          </TouchableOpacity>
        </>
      );
    }
  }

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.content,
          { transform: [{ translateX }] },
        ]}
      >
        {renderStep()}
      </Animated.View>

      {step === 0 && (
        <TouchableOpacity style={styles.nextButton} onPress={next}>
          <Feather name="arrow-right" size={24} color={darkMode ? 'white' : 'black'} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const createStyles = (darkMode: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: darkMode ? '#1c002c' : '#f7eadb',
    },
    content: {
      alignItems: 'center',
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      paddingTop: 40,
      color: darkMode ? 'white' : 'black',
      paddingBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: darkMode ? 'white' : '#333',
      marginBottom: 24,
    },
    footer: {
      width: '100%',
      padding: 20,
      justifyContent: 'flex-end',
      alignItems: 'flex-end',
    },
    nextButton: {
      backgroundColor: darkMode ? '#cacaca' : '#43165e',
      padding: 12,
      borderRadius: 40,
    },
    finishButton: {
      marginTop: 40,
      backgroundColor: '#315174',
      paddingVertical: 12,
      paddingHorizontal: 30,
      borderRadius: 8,
    },
    form: {
      marginTop: 24,
      width: '80%',
    },
    item: {
      backgroundColor: darkMode ? 'rgb(56, 56, 56)' : 'rgb(223, 221, 221)',
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      elevation: 1,
    },
    label: {
      fontSize: 16,
      color: darkMode ? 'white' : '#333',
    },
    value: {
      fontSize: 16,
      color: darkMode ? '#ab8abe' : '#5a707c',
    },
  });
