import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useTheme as useNavTheme } from '@react-navigation/native';
import { useTheme } from './ThemeContext';
import { getAllTipoBancos } from '../database/domains/tipo_banco/tipo_bancoRepository';
import AddEditTipoBancoModal from './AddEditTipoBancoModal';
import SimpleColorPicker  from './colorPicker/SimpleColorPicker';


type Props = {
  visible: boolean;
  banco?: {
    id?: number;
    nome: string;
    tipo_id: number | null;
    cor: string;
  };
  onClose: () => void;
  onSave: (data: {
    id?: number;
    nome: string;
    tipo_id: number | null;
    cor: string;
  }) => void;
};

export default function AddEditBancoModal({
  visible,
  banco,
  onClose,
  onSave,
}: Props) {
  const { darkMode } = useTheme();
  const { colors } = useNavTheme();
  const styles = createStyles(colors, darkMode);

  const [nome, setNome] = useState('');
  const [tipoId, setTipoId] = useState<number | null>(null);
  const [cor, setCor] = useState('');
  const [tipos, setTipos] = useState<any[]>([]);

  const [openAddTipoModal, setOpenAddTipoModal] = useState(false);
  const [openColorPicker, setOpenColorPicker] = useState(false);


  useEffect(() => {
    getAllTipoBancos().then(setTipos);
  }, []);

  useEffect(() => {
    if (banco) {
      setNome(banco.nome);
      setTipoId(banco.tipo_id);
      setCor(banco.cor);
    } else {
      setNome('');
      setTipoId(null);
      setCor('');
    }
  }, [banco, visible]);

  function handleSave() {
    if (!nome.trim() || !tipoId || !cor) return;

    onSave({
      id: banco?.id,
      nome,
      tipo_id: tipoId,
      cor,
    });
  }

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>
            {banco ? 'Editar banco' : 'Adicionar banco'}
          </Text>

          {/* Nome */}
          <TextInput
            value={nome}
            onChangeText={setNome}
            style={styles.input}
            placeholder="Nome do banco"
            placeholderTextColor={colors.text + '88'}
          />

          {/* Tipo (Select) */}
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={tipoId}
              onValueChange={(value) => {
                if (value === -1) {
                  // reset para não ficar selecionado
                  setTipoId(null);
                  console.log('Adicionar novo tipo');
                  // ação real
                  setOpenAddTipoModal(true);
                  value = null;
                  return;
                }

                setTipoId(value);
              }}
              style={{ color: colors.text }}
              dropdownIconColor={colors.text}
            >
              <Picker.Item color='black' label="Selecione o tipo" value={null} />
              {tipos.map((tipo) => (
                <Picker.Item
                  key={tipo.id}
                  label={tipo.descricao}
                  value={tipo.id}
                  color='black'
                />
              ))}
               <Picker.Item
                  label="➕ Adicionar novo tipo"
                  value={-1}
                  color={darkMode ? '#4CAF50' : '#2E7D32'}
                />
            </Picker>
          </View>

          {/* Color Picker */}
          <Text style={styles.label}>Cor do banco</Text>
          <TouchableOpacity
            style={[
              styles.colorPreviewButton,
              { backgroundColor: cor || '#ccc' },
            ]}
            onPress={() => setOpenColorPicker(true)}
          >
            <Text style={styles.colorPreviewText}>
              {cor ? cor : 'Selecionar cor'}
            </Text>
          </TouchableOpacity>

          {/* Preview */}
          {cor ? (
            <View style={[styles.preview, { backgroundColor: cor }]}>
              <Text style={styles.previewText}>{nome ? `${nome} ` : 'Preview'}</Text>
            </View>
          ) : null}

          {/* Actions */}
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

      {openAddTipoModal && (
        <View style={{ flex: 1 }}>
          <AddEditTipoBancoModal
            visible={openAddTipoModal}
            onClose={() => {
              setOpenAddTipoModal(false);
              // atualizar lista de tipos
              getAllTipoBancos().then(setTipos);
            }}
          />
        </View>
      )}

      <Modal visible={openColorPicker} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.colorPickerModal}>
            <Text style={styles.title}>Escolha uma cor</Text>

            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <SimpleColorPicker
                onChange={(hex) => setCor(hex)}
              />
            </View>

            <TouchableOpacity
              style={styles.colorPickerClose}
              onPress={() => setOpenColorPicker(false)}
            >
              <Text style={styles.colorPickerCloseText}>Confirmar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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
      width: '85%',
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
    label: {
      marginBottom: 6,
      color: colors.text,
    },
    input: {
      borderWidth: 1,
      borderColor: darkMode ? '#555' : '#ccc',
      color: colors.text,
      borderRadius: 10,
      padding: 12,
      marginBottom: 14,
    },
    pickerWrapper: {
      borderWidth: 1,
      borderColor: darkMode ? '#555' : '#ccc',
      borderRadius: 10,
      marginBottom: 14,
      overflow: 'hidden',
    },
    colorRow: {
      flexDirection: 'row',
      marginBottom: 12,
      flexWrap: 'wrap',
      gap: 10,
    },
    colorCircle: {
      width: 36,
      height: 36,
      borderRadius: 18,
    },
    preview: {
      height: 40,
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
    },
    previewText: {
      color: '#000',
      fontWeight: 'bold',
    },
    actions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 10,
    },
    cancel: {
      color: '#999',
      fontSize: 16,
    },
    save: {
      color: '#315174',
      fontSize: 16,
      fontWeight: 'bold',
    },
    colorPreviewButton: {
      height: 45,
      borderRadius: 10,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
      borderWidth: 1,
      borderColor: '#ccc',
    },
    colorPreviewText: {
      color: '#000',
      fontWeight: 'bold',
    },
    colorPickerModal: {
      width: '90%',
      height: 450,
      backgroundColor: darkMode ? '#2c2c2c' : '#fff',
      borderRadius: 16,
      padding: 16,
    },
    colorPickerClose: {
      marginTop: 10,
      paddingTop: 12,
      padding: 12,
      backgroundColor: '#315174',
      borderRadius: 8,
      color: '#fff',
      justifyContent: 'center',
      alignItems: 'center',
    },
    colorPickerCloseText: {
      color: '#fff',
      fontWeight: 'bold',
      fontSize: 16,
    },

  });
