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
import { updateUserOnboardingCompleted } from '../database/domains/users/userRepository';
import { useNavigation } from '@react-navigation/native';
import { Platform } from 'react-native';
import notifee from '@notifee/react-native';
import { useTheme } from '../components/ThemeContext';


import EditUserNameModal from '../components/EditUserNameModal';
import { getUser, updateUserName, updateUserDarkMode, updateUserNotificationsEnabled } from '../database/domains/users/userRepository';

const { width } = Dimensions.get('window');

export default function OnboardingScreen() {
  const navigation = useNavigation<any>();

  const [userName, setUserName] = useState('Usuário');
  const [modalVisible, setModalVisible] = useState(false);

  const { darkMode, toggleDarkMode } = useTheme();
  const [notifications, setNotifications] = useState(false);

  const translateX = useRef(new Animated.Value(0)).current;
  const [step, setStep] = useState(0);

  useEffect(() => {
    loadUser();
  }, []);

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
            'As notificações estão desativadas nas configurações do sistema. Por favor, ative-as para receber notificações.'
          );
          value = false;
        }
      }
    }
    setNotifications(value);
    updateUserNotificationsEnabled(value);
  }

  async function loadUser() {
    const user = await getUser();

    if (user?.nome) setUserName(user.nome);
    if (user?.notifications_enabled !== undefined) setNotifications(user.notifications_enabled === 1);
  }

  function next() {
    Animated.timing(translateX, {
      toValue: -width,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      // troca o conteúdo
      setStep(step + 1);

      // reposiciona fora da tela à direita
      translateX.setValue(width);

      // anima entrada
      Animated.timing(translateX, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    });
  }



  function renderStep() {
    if (step === 0) {
      return (
        <>
          <Image
            source={require('../assets/appIcon_512.png')}
            style={{ width: 200, height: 200, borderRadius: 100 }}
          />

          <Text style={styles.title}>Bem-vindo ao Gastou?</Text>
          <Text>Seu assistente financeiro pessoal.</Text>
        </>
      );
    }

    if (step === 1) {
      return (
        <>
          <Text style={styles.title}>Configurações iniciais</Text>
          <Text>Defina como você quer usar o app.</Text>

          <View style={styles.form}>
            <TouchableOpacity
              style={styles.item}
              onPress={() => setModalVisible(true)}
            >
              <Text style={styles.label}>Como gostaria de ser chamado?</Text>
              
              <Text style={[styles.value, {paddingLeft: 10 }]}>{userName}</Text>
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

          <TouchableOpacity
            style={styles.finishButton}
            onPress={finishOnboarding}
          >
            <Text style={{ color: 'white' }}>Finalizar</Text>
          </TouchableOpacity>

          <EditUserNameModal
            visible={modalVisible}
            initialValue={userName}
            onClose={() => setModalVisible(false)}
            onSave={handleSaveName}
          />
        </>
      );
    }
  }

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.content,
          {
            transform: [{ translateX }],
          },
        ]}
      >
        {renderStep()}
      </Animated.View>

      {step === 0 && (
        <TouchableOpacity style={styles.nextButton} onPress={next}>
          <Feather name="arrow-right" size={24} color="black" />
        </TouchableOpacity>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    paddingTop: 40,
    paddingBottom: 8,
  },
  nextButton: {
    position: 'absolute',
    bottom: 60,
    right: 40,
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
    backgroundColor: '#e2e2e2',
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
  },

  value: {
    fontSize: 16,
    color: '#888',
  },
});
