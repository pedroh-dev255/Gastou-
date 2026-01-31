import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  Vibration,
  Platform
} from 'react-native';
import { useTheme } from '../components/ThemeContext';
import { useNavigation, useTheme as useNavTheme } from '@react-navigation/native';
import Feather from 'react-native-vector-icons/Feather';
import DeviceInfo from 'react-native-device-info';
import {
  getUser,
  updateUserName,
  updateUserNotificationsEnabled,
} from '../database/domains/users/userRepository';
import { getDbVersion } from '../database/domains/db_version/db_versionRepository';
import EditUserNameModal from '../components/EditUserNameModal';
import notifee, {AndroidImportance} from '@notifee/react-native';
import { exportarBanco, listarBackups, importarBanco  } from '../services/dbmanager';

import { isSecurityEnabled, enableSecurity, disableSecurity } from '../security/security.repository';

import { authenticate } from '../security/biometric.service';

export default function ConfigsScreen() {
  const navigation = useNavigation<any>();
  const tapCount = useRef(0);
  const lastTap = useRef<number>(0);

  const [showPrivacy, setShowPrivacy] = useState(false);

  const [appVersion, setAppVersion] = useState('0.0.0');
  const [dbVersion, setDbVersion ] = useState<number>(0);
  const [userName, setUserName] = useState('');

  const [notifications, setNotifications] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const [backupSelecionado, setBackupSelecionado] = useState<string | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [backups, setBackups] = useState<string[]>([]);

  const { darkMode, toggleDarkMode } = useTheme();
  const { colors } = useNavTheme();

  const [securityEnabled, setSecurityEnabled] = useState<boolean>(false);

  const styles = createStyles(colors, darkMode); // <-- Factory styles dinâmicas

  useEffect(() => {
    setAppVersion(DeviceInfo.getVersion());
    async function loadVersion() {
        const version = await getDbVersion();
        setDbVersion(version);
    }
    loadVersion();
    loadUser();
  }, []);

  useEffect(() => {
    async function loadSecurity() {
      const enabled = await isSecurityEnabled();
      setSecurityEnabled(enabled);
    }

    loadSecurity();
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

  async function abrirModalImportacao() {
    const lista = await listarBackups();

    if (lista.length === 0) {
      Alert.alert(
        'Nenhum backup encontrado',
        'Nenhum arquivo .db foi encontrado em:\n\nDownloads/Gastou\n\nColoque seu backup nessa pasta e tente novamente.'
      );
      return;
    }

    setBackupSelecionado(null);
    setBackups(lista);
    setShowImportModal(true);
  }


  async function tocarAlertaSonoro() {
    await notifee.displayNotification({
      title: 'Confirmação necessária',
      body: 'Ação crítica em andamento',
      android: {
        channelId: 'alertas',
        sound: 'alert',
        importance: AndroidImportance.HIGH,
      },
    });
  }

  async function exportDb() {
    await exportarBanco();
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

        <View style={styles.item}>
          <Text style={styles.label}>Exigir senha</Text>
          <Switch
            value={securityEnabled}
            onValueChange={async (value) => {
              if (value) {
                await enableSecurity();
                setSecurityEnabled(true);
              } else {
                await disableSecurity();
                setSecurityEnabled(false);
              }
            }}
          />
        </View>

        <TouchableOpacity
          style={styles.item}
          onPress={() => setShowPrivacy(true)}
        >
          <Text style={styles.label}>Privacidade e segurança</Text>
        </TouchableOpacity>

        <Text style={styles.section}>Conta</Text>

        <TouchableOpacity
          style={styles.item}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.label}>Nome do usuário</Text>
          <Text style={styles.value}>{userName}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.item}
          onPress={async() => {
             Alert.alert(
            'Atenção',
            'Ao exportar sua base de dados, suas informações ficaram acessiveis no armazenamento do seu dispositivo, deseja continuar?',
            [
              {
                text: 'Não',
                style: 'cancel',
                onPress: () => {
                  return;
                },
              },
              {
                text: 'Sim',
                style: 'destructive',
                onPress: async () => {
                  await exportDb();
                },
              },
            ],
            { cancelable: true }
          );
            
          }}
        >
          <Text style={styles.label}>Exportar Banco de dados</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.item}
          onPress={() => {
            Alert.alert(
            'Atenção',
            'Esta ação vai sobrescrever a base de dados atual.\n\nAo continuar, todos os dados armazenados localmente serão APAGADOS de forma permanente.\n\nTem certeza que deseja continuar?',
            [
              {
                text: 'Não',
                style: 'cancel',
                onPress: () => {
                  return;
                },
              },
              {
                text: 'Sim',
                style: 'destructive',
                onPress: () => {
                  tocarAlertaSonoro();
                  Vibration.vibrate([0, 400, 200, 400]);

                  Alert.alert(
                    'Confirmação final',
                    '⚠️ Esta é uma ação IRREVERSÍVEL.\n\nAo importar uma nova base, TODOS os dados atuais serão perdidos sem possibilidade de recuperação.\n\nTem certeza absoluta que deseja continuar?',
                    [
                      {
                        text: 'Cancelar',
                        style: 'cancel',
                      },
                      {
                        text: 'Confirmar importação',
                        style: 'destructive',
                        onPress: () => {
                         

                          abrirModalImportacao();
                        }
                      },
                    ],
                    { cancelable: false }
                  );
                },
              },
            ],
            { cancelable: true }
          );
          }}
        >
          <Text style={styles.label}>Importar Banco de dados</Text>
        </TouchableOpacity>

        

        <TouchableOpacity onPress={handleSecretTap}>
          <View style={styles.footer}>
            <Text style={styles.version}>APP {appVersion}</Text>
            <Text style={styles.version}>DB   {dbVersion}.0</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>

      <EditUserNameModal
        visible={modalVisible}
        initialValue={userName}
        onClose={() => setModalVisible(false)}
        onSave={handleSaveName}
      />

      <Modal
        visible={showPrivacy}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPrivacy(false)}
      >
        <View style={modal_privacidade.overlay}>
          <View style={modal_privacidade.sheet}>
            
            {/* Header */}
            <View style={modal_privacidade.header}>
              <Feather
                name="lock"
                size={20}
                color={darkMode ? '#ab8abe' : '#43165e'}
              />
              <Text style={modal_privacidade.title}>Privacidade e segurança</Text>
            </View>
            {/* Conteúdo */}
            <ScrollView
              style={modal_privacidade.body}
              showsVerticalScrollIndicator={false}
            >
              <Text style={modal_privacidade.text}>
                Para sua segurança e privacidade, todas as informações inseridas no aplicativo são
                armazenadas exclusivamente no seu próprio dispositivo. O aplicativo não coleta,
                transmite, compartilha ou processa dados pessoais em servidores externos
                {'\n\n'}
                O Gastou? funciona de forma totalmente local, não realizando qualquer tipo de
                monitoramento, rastreamento, análise de uso ou envio de informações a terceiros,
                estando em conformidade com a Lei Geral de Proteção de Dados (LGPD – Lei nº 13.709/2018)
                {'\n\n'}
                A responsabilidade pela guarda, backup e integridade dos dados é exclusivamente do
                usuário. Em caso de perda do dispositivo, desinstalação do aplicativo, restauração
                do sistema ou limpeza dos dados, todas as informações serão apagadas de forma
                permanente, sem possibilidade de recuperação
                {'\n\n'}
                Ao utilizar este aplicativo, o usuário declara estar ciente dessas condições e
                concorda que a manutenção e a segurança dos dados dependem exclusivamente do uso
                adequado do próprio dispositivo.
              </Text>
            </ScrollView>
            {/* Footer */}
            <TouchableOpacity
              style={modal_privacidade.button}
              onPress={() => setShowPrivacy(false)}
              activeOpacity={0.85}
            >
              <Text style={modal_privacidade.buttonText}>Entendi</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Modal
        visible={showImportModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowImportModal(false)}
      >
        <View style={importModal.overlay}>
          <View style={importModal.container}>
            {/* Header */}
            <View style={importModal.header}>
              <Feather name="alert-triangle" size={20} color="#c0392b" />
              <Text style={importModal.title}>Importar banco de dados</Text>
            </View>

            <Text style={importModal.subtitle}>
              Selecione um backup abaixo para restaurar.
              {'\n'}Essa ação substituirá todos os dados atuais.
            </Text>

            {/* Lista */}
            <ScrollView style={importModal.list}>
              {backups.map(path => {
                const nome = path.split('/').pop();
                const selecionado = backupSelecionado === path;

                return (
                  <TouchableOpacity
                    key={path}
                    style={[
                      importModal.item,
                      selecionado && importModal.itemSelected,
                    ]}
                    onPress={() => setBackupSelecionado(path)}
                    activeOpacity={0.8}
                  >
                    <Feather
                      name="database"
                      size={18}
                      color={selecionado ? '#fff' : '#555'}
                    />
                    <Text
                      style={[
                        importModal.itemText,
                        selecionado && importModal.itemTextSelected,
                      ]}
                    >
                      {nome}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Footer */}
            <View style={importModal.footer}>
              <TouchableOpacity
                style={importModal.cancelButton}
                onPress={() => {
                  setBackupSelecionado(null);
                  setShowImportModal(false);
                }}
              >
                <Text style={importModal.cancelText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  importModal.confirmButton,
                  !backupSelecionado && importModal.confirmDisabled,
                ]}
                disabled={!backupSelecionado}
                onPress={() => {
                  setShowImportModal(false);
                  if (backupSelecionado) {
                    importarBanco(backupSelecionado);
                  }
                }}
              >
                <Text style={importModal.confirmText}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </>
  );
}

const importModal = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  container: {
    width: '100%',
    maxHeight: '80%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    elevation: 10,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },

  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#c0392b',
  },

  subtitle: {
    fontSize: 13,
    color: '#555',
    marginBottom: 16,
    lineHeight: 18,
  },

  list: {
    marginBottom: 16,
  },

  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#f2f2f2',
    marginBottom: 8,
  },

  itemSelected: {
    backgroundColor: '#c0392b',
  },

  itemText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },

  itemTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },

  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },

  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#e0e0e0',
  },

  cancelText: {
    color: '#333',
    fontWeight: '600',
  },

  confirmButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#c0392b',
  },

  confirmDisabled: {
    backgroundColor: '#e6b0aa',
  },

  confirmText: {
    color: '#fff',
    fontWeight: '700',
  },
});


const modal_privacidade = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },

  sheet: {
    backgroundColor: '#f7eadb',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    maxHeight: '80%',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },

  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#43165e',
  },

  body: {
    marginBottom: 20,
  },

  text: {
    fontSize: 14,
    lineHeight: 22,
    color: '#3a3a3a',
    textAlign: 'justify',
  },

  button: {
    backgroundColor: '#43165e',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },

  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  /* DARK MODE */
  sheetDark: {
    backgroundColor: '#1c002c',
  },

  titleDark: {
    color: '#ffffff',
  },

  textDark: {
    color: '#ddd',
  },

  buttonDark: {
    backgroundColor: '#ab8abe',
  },
});

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
