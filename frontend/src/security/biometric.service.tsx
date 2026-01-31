import * as Keychain from 'react-native-keychain';
import {Alert, BackHandler, Platform } from 'react-native';

const KEYCHAIN_SERVICE = 'gastou_lock';

export async function authenticate(
  reason = 'Desbloquear Gastou'
): Promise<boolean> {
  try {
    const credentials = await Keychain.getGenericPassword({
      service: KEYCHAIN_SERVICE, // ✅ ESSENCIAL
      authenticationPrompt: {
        title: reason,
        subtitle: 'Confirme sua identidade',
        description: 'Use biometria, PIN ou senha do dispositivo',
        cancel: 'Cancelar',
      },
      accessControl: Keychain.ACCESS_CONTROL.DEVICE_PASSCODE,

    });

    return !!credentials;
  } catch (error) {
    console.log('Auth error:', error);
    Alert.alert(
      'Autenticação necessária',
      'Você precisa se autenticar para usar o aplicativo.',
      [
        {
          text: 'Fechar app',
          onPress: () => {
            if (Platform.OS === 'android') {
              BackHandler.exitApp(); // ✅ permitido
            }
          },
        },
      ],
      { cancelable: false }
    );
    return false;
  }
}
