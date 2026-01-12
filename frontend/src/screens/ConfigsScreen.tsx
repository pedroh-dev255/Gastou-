import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useTheme } from '../components/ThemeContext';
import { useNavigation, useTheme as useNavTheme } from '@react-navigation/native';
import DeviceInfo from 'react-native-device-info';
import {
  getUser,
  updateUserName,
  updateUserNotificationsEnabled,
} from '../database/domains/users/userRepository';
import EditUserNameModal from '../components/EditUserNameModal';
import notifee from '@notifee/react-native';
import { Platform } from 'react-native';

export default function ConfigsScreen() {
  const navigation = useNavigation<any>();
  const tapCount = useRef(0);
  const lastTap = useRef<number>(0);

  const [appVersion, setAppVersion] = useState('0.0.0');
  const [userName, setUserName] = useState('');
  const [notifications, setNotifications] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const { darkMode, toggleDarkMode } = useTheme();
  const { colors } = useNavTheme();

  const styles = createStyles(colors, darkMode); // <-- Factory styles dinâmicas

  useEffect(() => {
    setAppVersion(DeviceInfo.getVersion());
    loadUser();
  }, []);

  async function loadUser() {
    const user = await getUser();
    if (user?.nome) setUserName(user.nome);
    if (user?.notifications_enabled !== undefined)
      setNotifications(user.notifications_enabled === 1);
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

  function handleSecretTap() {
    const now = Date.now();
    tapCount.current =
      now - lastTap.current < 600 ? tapCount.current + 1 : 1;
    lastTap.current = now;

    if (tapCount.current >= 5) {
      tapCount.current = 0;
      Alert.alert('Debug ativado', 'Abrindo tela de debug');
      navigation.navigate('DebugDatabase');
    }
  }

  return (
    <>
      <ScrollView style={styles.container}>
        <Text style={styles.section}>Geral</Text>

        <View style={styles.item}>
          <Text style={styles.label}>Tema escuro</Text>
          <Switch value={darkMode} onValueChange={toggleDarkMode} />
        </View>

        <View style={styles.item}>
          <Text style={styles.label}>Notificações</Text>
          <Switch value={notifications} onValueChange={updateNotifications} />
        </View>

        <Text style={styles.section}>Conta</Text>

        <TouchableOpacity
          style={styles.item}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.label}>Nome do usuário</Text>
          <Text style={styles.value}>{userName}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleSecretTap}>
          <View style={styles.footer}>
            <Text style={styles.version}>Versão {appVersion}</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>

      <EditUserNameModal
        visible={modalVisible}
        initialValue={userName}
        onClose={() => setModalVisible(false)}
        onSave={handleSaveName}
      />
    </>
  );
}

// -------------------- Styles dinâmicos --------------------
const createStyles = (colors: any, darkMode: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
      backgroundColor: colors.background, // fundo da tela
    },

    section: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text, // cor do texto
      marginTop: 24,
      marginBottom: 8,
    },

    item: {
      backgroundColor: darkMode ? 'rgb(56, 56, 56)' : 'rgb(223, 221, 221)', // fundo do item
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      elevation: 1,
    },

    label: {
      color: colors.text,
      fontSize: 16,
    },

    value: {
      fontSize: 16,
      color: colors.notification, // texto secundário
    },

    footer: {
      marginTop: 40,
      alignItems: 'center',
    },

    version: {
      fontSize: 12,
      color: colors.text, // texto discreto
    },
  });
