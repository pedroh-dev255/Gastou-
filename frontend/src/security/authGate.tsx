import React, { useEffect, useState } from 'react';
import { AppState, View, ActivityIndicator, Text } from 'react-native';
import { authenticate } from './biometric.service';
import { isSecurityEnabled } from './security.repository';
import * as Keychain from 'react-native-keychain';

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const [unlocked, setUnlocked] = useState(false);

  async function checkAuth() {
    const enabled = await isSecurityEnabled();
    if (!enabled) {
      setUnlocked(true);
      return;
    }

    const hasCredential = await Keychain.hasGenericPassword({
      service: 'gastou_lock',
    });

    if (!hasCredential) {
      console.warn('Segurança ativa mas sem credencial — corrigindo');
      setUnlocked(true);
      return;
    }

    const ok = await authenticate();
    setUnlocked(ok);
  }

  useEffect(() => {
    checkAuth();

    const sub = AppState.addEventListener('change', state => {
      if (state === 'active') {
        setUnlocked(false);
        checkAuth();
      }
    });

    return () => sub.remove();
  }, []);

  if (!unlocked) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <Text style={{color: 'white', paddingTop: 30}}>Aguardando Authenticação</Text>
      </View>
    );
  }

  return <>{children}</>;
}
