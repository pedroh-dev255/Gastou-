import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Switch,
} from 'react-native';

export default function LancamentosScreen() {
  const [tipo, setTipo] = useState<'saida' | 'entrada'>('saida');
  const [parcelado, setParcelado] = useState(false);

  return (
    <View style={styles.container}>
      {/* TOPO - ENTRADA | SAÍDA */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            styles.entrada,
            tipo === 'entrada' && styles.entradaAtivo,
          ]}
          onPress={() => setTipo('entrada')}
        >
          <Text style={styles.toggleText}>Entrada</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.toggleButton,
            styles.saida,
            tipo === 'saida' && styles.saidaAtivo,
          ]}
          onPress={() => setTipo('saida')}
        >
          <Text style={styles.toggleText}>Saída</Text>
        </TouchableOpacity>
      </View>

      {/* FORMULÁRIO */}
      <View style={styles.form}>
        {tipo === 'saida' ? (
          <>
            <Text style={styles.label}>Descrição</Text>
            <TextInput style={styles.input} placeholder="Ex: Supermercado" />

            <Text style={styles.label}>Tipo</Text>
            <TextInput style={styles.input} placeholder="Ex: Alimentação" />

            <View style={styles.switchRow}>
              <Text style={styles.label}>Parcelado</Text>
              <Switch
                value={parcelado}
                onValueChange={setParcelado}
              />
            </View>

            {parcelado && (
              <>
                <Text style={styles.label}>Número de parcelas</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: 3"
                  keyboardType="numeric"
                />
              </>
            )}
          </>
        ) : (
          <>
            <Text style={styles.label}>Descrição</Text>
            <TextInput style={styles.input} placeholder="Ex: Salário" />

            <Text style={styles.label}>Conta de destino</Text>
            <TextInput style={styles.input} placeholder="Ex: Conta principal" />

            <Text style={styles.label}>Valor</Text>
            <TextInput
              style={styles.input}
              placeholder="R$ 0,00"
              keyboardType="numeric"
            />
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },

  /* TOGGLE */
  toggleContainer: {
    flexDirection: 'row',
    marginBottom: 24,
    gap: 12,
  },

  toggleButton: {
    flex: 1,
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
  },

  toggleText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },

  entrada: {
    backgroundColor: '#a5d6a7',
  },

  entradaAtivo: {
    backgroundColor: '#2e7d32',
  },

  saida: {
    backgroundColor: '#ef9a9a',
  },

  saidaAtivo: {
    backgroundColor: '#c62828',
  },

  /* FORM */
  form: {
    marginTop: 12,
  },

  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },

  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },

  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
});
