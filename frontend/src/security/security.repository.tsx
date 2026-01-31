import { db } from '../database';
import * as Keychain from 'react-native-keychain';
import { logError, logInfo } from '../services/loggerService';

const KEY_SECURITY = 'security_enabled';
const KEYCHAIN_SERVICE = 'gastou_lock';

/* ---------- SQLite ---------- */

export async function isSecurityEnabled(): Promise<boolean> {
  try {
    const result: any = db.execute(
      `SELECT security FROM users`
    );

    logInfo('Verificando segunraça: ', result.rows.item(0).security);

    const exists = await Keychain.hasGenericPassword({
      service: KEYCHAIN_SERVICE,
    });

    logInfo(`Credencial existe? ${exists}`);


    if(result.rows && result.rows.length > 0 && result.rows.item(0).security === 1){
      return true;
    }
    
    return false;
    
  } catch (error: any) {
    logError('Erro ao verificar segurança: ', error.message);
    return false;
  }

}

export async function setSecurityEnabled(value: boolean) {
  db.execute(
    `UPDATE users SET security = ?`,
    [value ? '1' : '0']
  );
}


export async function enableSecurity() {
  await Keychain.setGenericPassword(
    'user',
    'locked',
    {
      service: KEYCHAIN_SERVICE,
      accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
      accessControl: Keychain.ACCESS_CONTROL.DEVICE_PASSCODE,

    }
  );
  logInfo('Criação do security');
  await setSecurityEnabled(true);
}

export async function disableSecurity() {
  await Keychain.resetGenericPassword({
    service: KEYCHAIN_SERVICE,
  });
  logInfo('Security desativado');
  await setSecurityEnabled(false);
}