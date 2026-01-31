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
  FlatList,
  Modal,
  ScrollView
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { updateUserOnboardingCompleted, getUser, updateUserName, updateUserNotificationsEnabled } from '../database/domains/users/userRepository';
import { getAllBancos, addBanco, updateBanco } from '../database/domains/bancos/bancosRepository';
import { getAllCartoes, addCartao, updateCartao } from '../database/domains/cartoes/cartoesRepository';
import { useNavigation } from '@react-navigation/native';
import { Platform } from 'react-native';
import notifee from '@notifee/react-native';
import { useTheme } from '../components/ThemeContext';

import { isSecurityEnabled, enableSecurity, disableSecurity } from '../security/security.repository';

import EditUserNameModal from '../components/EditUserNameModal';
import AddEditBancoModal from '../components/AddEditBancoModal';

const { width } = Dimensions.get('window');

export default function OnboardingScreen() {
  const navigation = useNavigation<any>();
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [userName, setUserName] = useState('Usuário');
  const [bancos, setBancos] = useState<any>([]);
  const [cartoes, setCartoes] = useState<any>([]);
  const [modalVisible, setModalVisible] = useState(false);

  const { darkMode, toggleDarkMode } = useTheme();
  const [notifications, setNotifications] = useState(false);
  const [securityEnabled, setSecurityEnabled] = useState<boolean>(false);

  const [step, setStep] = useState(0);
  const [modalBancoVisible, setModalBancoVisible] = useState(false);
  const [bancoSelecionado, setBancoSelecionado] = useState<any>(null);

  const translateX = useRef(new Animated.Value(0)).current;

  const styles = createStyles(darkMode);

  useEffect(() => {
    loadUser();
    loadBancos();
    loadCartoes();
  }, []);

  async function loadUser() {
    const user = await getUser();
    if (user?.nome) setUserName(user.nome);
    if (user?. security !== undefined)
      setSecurityEnabled(user.security === 1)
    if (user?.notifications_enabled !== undefined)
      setNotifications(user.notifications_enabled === 1);
  }

  async function loadBancos() {
    const bancos = await getAllBancos();
    setBancos(bancos);
  }

  async function loadCartoes() {
    const cards = await getAllCartoes();
    setCartoes(cards);
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

  async function updateBanco(banco: any) {
    await updateBanco(banco);
  }

  async function addBancoFunction(banco: any) {
    const {nome, tipo_id, cor} = banco;
    await addBanco(nome, cor, tipo_id);
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

          <TouchableOpacity onPress={() => setShowPrivacy(true)}>
            <Text
              style={{
                marginBottom: 25,
                fontSize: 14,
                color: darkMode ? '#ab8abe' : '#43165e',
                textDecorationLine: 'underline',
              }}
            >
              🔒 Privacidade e segurança
            </Text>
          </TouchableOpacity>

          
          <TouchableOpacity style={styles.nextButton} onPress={next}>
            <Feather name="arrow-right" size={24} color={darkMode ? 'black' : 'white'} />
          </TouchableOpacity>

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
                    transmite, compartilha ou processa dados pessoais em servidores externos.

                    {'\n\n'}
                    O Gastou? funciona de forma totalmente local, não realizando qualquer tipo de
                    monitoramento, rastreamento, análise de uso ou envio de informações a terceiros,
                    estando em conformidade com a Lei Geral de Proteção de Dados (LGPD – Lei nº 13.709/2018).

                    {'\n\n'}
                    A responsabilidade pela guarda, backup e integridade dos dados é exclusivamente do
                    usuário. Em caso de perda do dispositivo, desinstalação do aplicativo, restauração
                    do sistema ou limpeza dos dados, todas as informações serão apagadas de forma
                    permanente, sem possibilidade de recuperação.

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
              <Text style={styles.value}>  {userName}</Text>
            </TouchableOpacity>

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
          </View>


           <View style={styles.footer}>
              <TouchableOpacity style={[styles.nextButton, {right: 25}]} onPress={next}>
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
        <View style={styles.stepContainer}>
          <Text style={styles.title}>Configuração bancária</Text>
          <Text style={styles.subtitle}>
            Adicione suas contas bancárias para acompanhar seus gastos.
          </Text>

          <FlatList
            data={bancos}
            keyExtractor={(item) => String(item.id)}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.bankList}
            renderItem={({ item }) => (
              <View
                style={[
                  styles.cardBanck,
                  { backgroundColor: item.cor },
                ]}
              >
                <Text style={styles.label_card}>{item.nome}</Text>
                <Text style={styles.type_card}>
                  Tipo: {item.descricao}
                </Text>
              </View>
            )}
            ListFooterComponent={
              <TouchableOpacity
                style={styles.addCard}
                onPress={() => {
                  setBancoSelecionado(null);
                  setModalBancoVisible(true);
                }}
              >
                <Text style={styles.addText}>+</Text>
              </TouchableOpacity>
            }
          />

          <TouchableOpacity
            style={[styles.nextButton, {width: 60, height: 60, justifyContent: 'center', alignItems: 'center', alignSelf: 'center', marginBottom: 50}]}
            onPress={next}
          >
            <Feather name="arrow-right" size={24} color={darkMode ? 'black' : 'white'} />
          </TouchableOpacity>

          <AddEditBancoModal
            visible={modalBancoVisible}
            banco={bancoSelecionado}
            onClose={() => setModalBancoVisible(false)}
            onSave={async (data) => {
              if (data.id) {
                await updateBanco(data);
              } else {
                await addBancoFunction(data);
              }
              loadBancos();
              setModalBancoVisible(false);
            }}
          />
        </View>
      );
    }

    if (step === 3) {
      return (
        <View style={styles.stepContainer}>
          <Text style={styles.title}>Cartões de Credito</Text>
          <Text style={styles.subtitle}>
            Adicione seus cartões de Credito/debito para acompanhar suas faturas.
          </Text>

          <FlatList
            data={cartoes}
            keyExtractor={(item) => String(item.id)}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.bankList}
            renderItem={({ item }) => (
              <View
                style={[
                  styles.cardBanck,
                  { backgroundColor: item.cor },
                ]}
              >
                <Text style={styles.label_card}>{item.tipo}</Text>
                <Text style={styles.type_card}>
                  Tipo: {item.bancos_nome}
                </Text>
              </View>
            )}
            ListFooterComponent={
              <TouchableOpacity
                style={styles.addCard}
                onPress={() => {
                  setBancoSelecionado(null);
                  setModalBancoVisible(true);
                }}
              >
                <Text style={styles.addText}>+</Text>
              </TouchableOpacity>
            }
          />

          <TouchableOpacity
            style={styles.finishButtonFixed}
            onPress={finishOnboarding}
          >
            <Text style={styles.finishText}>Finalizar</Text>
          </TouchableOpacity>

          <AddEditBancoModal
            visible={modalBancoVisible}
            banco={bancoSelecionado}
            onClose={() => setModalBancoVisible(false)}
            onSave={async (data) => {
              if (data.id) {
                await updateBanco(data);
              } else {
                await addBancoFunction(data);
              }
              loadBancos();
              setModalBancoVisible(false);
            }}
          />
        </View>
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


    </View>
  );
}

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


const createStyles = (darkMode: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: darkMode ? '#1c002c' : '#f7eadb',
    },
    content: {
      flex: 1,
      justifyContent: 'center',
      width: '100%',
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
      //paddingBottom: 50,
      borderRadius: 50,
    },
    finishButton: {
      bottom: -40,
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
    cardBankList: {
      marginTop: 24,
      width: 800,
      maxHeight: 200,
    },
    label_card: {
      fontSize: 24,
      fontWeight: 'bold',
      elevation: 1,
      color: darkMode ? 'white' : 'black',
      marginBottom: 8, },
    type_card : {
      fontSize: 16,
      
      color: '#000000ea',
      alignSelf: 'flex-end',
    },
    previewText: {
      color: darkMode ? 'white' : 'black',
      fontWeight: 'bold',
    },
    stepContainer: {
      flex: 1,
      width: '100%',
      paddingHorizontal: 16,
    },


    bankList: {
      paddingBottom: 120, // espaço pro botão Finalizar
      alignItems: 'center',
    },

    cardBanck: {
      width: 300,
      height: 120,
      padding: 12,
      borderRadius: 12,
      marginBottom: 12,
      justifyContent: 'space-between',
    },

    addCard: {
      width: 300,
      height: 120,
      borderRadius: 12,
      borderWidth: 2,
      borderStyle: 'dashed',
      borderColor: '#aaa',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: darkMode ? '#383838' : '#e0e0e0',
    },

    addText: {
      fontSize: 40,
      fontWeight: 'bold',
      color: darkMode ? '#aaa' : '#555',
    },

    finishButtonFixed: {
      position: 'absolute',
      bottom: 24,
      alignSelf: 'center',
      backgroundColor: '#315174',
      paddingVertical: 14,
      paddingHorizontal: 36,
      borderRadius: 10,
      elevation: 4,
    },

    finishText: {
      color: 'white',
      fontSize: 16,
      fontWeight: 'bold',
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
