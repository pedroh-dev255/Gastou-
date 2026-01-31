import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { PieChart } from 'react-native-gifted-charts';
import { useTheme } from '../components/ThemeContext';
import { useTheme as useNavTheme } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import { updateUserOnboardingCompleted } from '../database/domains/users/userRepository';

export default function HomeScreen() {
  const { darkMode } = useTheme();
  const { colors } = useNavTheme();
  const styles = createStyles(colors, darkMode);
  const navigation = useNavigation<any>();

  // 🔹 Dados placeholder REALISTAS
  const rendaAtual = 5200;
  const rendaProximoMes = 5200;

  const comprometidoMesAtual = 3100;
  const comprometidoProximoMes = 2600;

  const livreAtual = rendaAtual - comprometidoMesAtual;
  const percentualComprometido = Math.round(
    (comprometidoProximoMes / rendaProximoMes) * 100,
  );

  const categorias = [
    { key: 'Alimentação', value: 200, color: '#ff7675' },
    { key: 'Transporte', value: 600, color: '#74b9ff' },
    { key: 'Lazer', value: 480, color: '#55efc4' },
    { key: 'Outros', value: 1500, color:'#ffeaa7' },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* VISÃO GERAL */}
      <Text style={styles.title}>Visão financeira</Text>

            {/* DEBUG */}
      <TouchableOpacity
        style={styles.debug}
        onPress={async () => {
          await updateUserOnboardingCompleted(0);
          navigation.reset({
            index: 0,
            routes: [{ name: 'Onboarding' }],
          });
        }}
      >
        <Text style={{ color: 'black' }}>
          Entrar no onboarding (debug)
        </Text>
      </TouchableOpacity>

      <View style={styles.cardFull}>
        <Text style={styles.label}>Renda do mês</Text>
        <Text style={styles.value}>R$ {rendaAtual}</Text>

        <Text style={styles.label}>Comprometido este mês</Text>
        <Text style={styles.negative}>R$ {comprometidoMesAtual}</Text>

        <Text style={styles.label}>Disponível para gastar</Text>
        <Text
          style={[
            styles.positive,
            { fontSize: 22 },
          ]}
        >
          R$ {livreAtual}
        </Text>
      </View>

      {/* IMPACTO FUTURO */}
      <Text style={styles.sectionTitle}>Impacto no próximo mês</Text>

      <View style={styles.cardFull}>
        <Text style={styles.label}>Renda estimada</Text>
        <Text style={styles.value}>R$ {rendaProximoMes}</Text>

        <Text style={styles.label}>Já comprometido</Text>
        <Text style={styles.negative}>R$ {comprometidoProximoMes}</Text>

        <Text style={styles.alertText}>
          ⚠️ {percentualComprometido}% da sua renda do próximo mês já está comprometida
        </Text>
      </View>

      {/* GASTOS POR CATEGORIA */}
      <Text style={styles.sectionTitle}>Onde seu dinheiro está indo</Text>

      <View style={[styles.cardFull, {alignItems: 'center'}]}>
        <PieChart
          data={categorias}
          donut
          radius={120}
          innerRadius={70}
          centerLabelComponent={() => (
            <Text style={{ color: colors.text, fontWeight: 'bold' }}>
              Gastos do mês
            </Text>
          )}
        />

        {categorias.map(item => (
          <View key={item.key} style={styles.categoryRow}>
            <Text style={styles.text}>{item.key}</Text>
            <Text style={styles.text}>R$ {item.value}</Text>
          </View>
        ))}
      </View>

      {/* ALERTA FINAL */}
      <View style={styles.alertCard}>
        <Text style={styles.alertText}>
          Evite novos parcelamentos este mês.
        </Text>
        <Text style={styles.alertHint}>
          Seu próximo salário já está parcialmente comprometido.
        </Text>
      </View>
    </ScrollView>
  );
}

const createStyles = (colors: any, darkMode: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
      backgroundColor: colors.background,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 12,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginTop: 20,
      marginBottom: 8,
    },
    cardFull: {
      padding: 14,
      borderRadius: 14,
      backgroundColor: darkMode ? '#4f4f4f' : '#e6e6e6',
      marginBottom: 10,
    },
    label: {
      color: colors.text,
      opacity: 0.7,
      marginTop: 6,
    },
    value: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.text,
    },
    positive: {
      fontWeight: 'bold',
      color: '#2ecc71',
    },
    negative: {
      fontWeight: 'bold',
      color: '#e74c3c',
    },
    categoryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 6,
    },
    text: {
      color: colors.text,
    },
    alertCard: {
      padding: 14,
      borderRadius: 12,
      backgroundColor: darkMode ? '#3a1f1f' : '#fad0cb',
      marginTop: 12,
      marginBottom: 20,
    },
    alertText: {
      color: '#e74c3c',
      fontWeight: 'bold',
    },
    alertHint: {
      color: colors.text,
      marginTop: 4,
      opacity: 0.8,
    },
    debug: {
      marginTop: 30,
      alignItems: 'center',
    },
  });
