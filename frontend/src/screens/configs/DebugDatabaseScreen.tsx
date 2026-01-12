import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert, Button, TouchableOpacity } from 'react-native';
import notifee, { AndroidImportance } from '@notifee/react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useTheme as useNavTheme } from '@react-navigation/native';
import { useTheme } from '../../components/ThemeContext';
import { db } from '../../database/index';

export default function DebugDatabaseScreen() {
  const [tables, setTables] = useState<any[]>([]);
  const { darkMode, toggleDarkMode } = useTheme();
  const { colors } = useNavTheme();

  const styles = createStyles(colors, darkMode);

  useEffect(() => {
    carregar();
  }, []);

  function carregar() {
    const result = db.execute(`
      SELECT name FROM sqlite_master WHERE type='table'
    `);

    setTables(result.rows?._array ?? []);
  }

  function testeNotificacao() {
    notifee.displayNotification({
      title: 'Teste de Notificação',
      body: 'Esta é uma notificação de teste do Gastou?',
      android: {
        channelId: 'default',
        importance: AndroidImportance.HIGH,
      },
    });
  }

  function verTabela(nome: string) {
    const result = db.execute(`SELECT * FROM ${nome}`);
    console.log(nome, result.rows?._array);
    alert(JSON.stringify(result.rows?._array, null, 2));
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>📊 Debug SQLite</Text>

      <View style={{ marginBottom: 16, flexDirection: 'row', gap: 16 }}>
        <TouchableOpacity onPress={carregar} style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Feather name="refresh-cw" size={16} color={colors.text} />
          <Text style={{ color: colors.text }}>  atualizar lista de tabelas</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={testeNotificacao} style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Feather name="send" size={16} color={colors.text} />
          <Text style={{ color: colors.text }}>  Teste de notificação</Text>
        </TouchableOpacity>
      </View>

      {tables.map(t => (
        <View key={t.name} style={styles.card}>
          <Text style={styles.tableName}>{t.name}</Text>
          <Button title="Ver dados" onPress={() => verTabela(t.name)} />
        </View>
      ))}
    </ScrollView>
  );
}

const createStyles = (colors: any, darkMode: boolean) => StyleSheet.create({
  container: {
    padding: 16,
    paddingTop: 40,
    flex: 1,
    backgroundColor: darkMode ? '#18023b' : '#d0ffff',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16 },
  card: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
    color: colors.text,
    borderColor: colors.border,
    backgroundColor: darkMode ? '#929292' : '#e6e6e6',
  },
  tableName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8
  },
});
