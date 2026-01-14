//AddEditTipoBancoModal

import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useTheme as useNavTheme } from '@react-navigation/native';
import { useTheme } from './ThemeContext';
import {
  addTipoBanco,
  updateTipoBanco,
} from '../database/domains/tipo_banco/tipo_bancoRepository';

type Props = {
  visible: boolean;
  tipo?: {
    id?: number;
    descricao: string;
  };
  onClose: () => void;
};

export default function AddEditTipoBancoModal({
  visible,
  tipo,
  onClose,
}: Props) {
  const { darkMode } = useTheme();
  const { colors } = useNavTheme();
  const styles = createStyles(colors, darkMode);

  const [descricao, setDescricao] = useState('');

  useEffect(() => {
    if (tipo) {
      setDescricao(tipo.descricao);
    } else {
      setDescricao('');
    }
  }, [tipo, visible]);

  async function handleSave() {
    if (!descricao.trim()) return;

    if (tipo?.id) {
      await updateTipoBanco(tipo.id, descricao.trim());
    } else {
      await addTipoBanco(descricao.trim());
    }

    onClose();
  }

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>
            {tipo ? 'Editar tipo de banco' : 'Adicionar tipo de banco'}
          </Text>

          <TextInput
            value={descricao}
            onChangeText={setDescricao}
            style={styles.input}
            placeholder="Descrição do tipo"
            placeholderTextColor={colors.text + '88'}
          />

          <View style={styles.actions}>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.cancel}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleSave}>
              <Text style={styles.save}>Salvar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const createStyles = (colors: any, darkMode: boolean) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modal: {
      width: '80%',
      backgroundColor: darkMode ? '#2c2c2c' : '#fff',
      borderRadius: 16,
      padding: 20,
    },
    title: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 16,
      color: colors.text,
    },
    input: {
      borderWidth: 1,
      borderColor: darkMode ? '#555' : '#ccc',
      color: colors.text,
      borderRadius: 10,
      padding: 12,
      marginBottom: 18,
    },
    actions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    cancel: {
      color: '#999',
      fontSize: 16,
    },
    save: {
      color: '#4CAF50',
      fontSize: 16,
      fontWeight: 'bold',
    },
  });
