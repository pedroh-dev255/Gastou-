import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useTheme } from '../components/ThemeContext';
import { useTheme as useNavTheme } from '@react-navigation/native';

type TipoLancamento =
  | 'pix'
  | 'cartao'
  | 'alimentacao'
  | 'salario'
  | 'conta_fixa';

type StatusLancamento =
  | 'pago'
  | 'pendente'
  | 'vencido'
  | 'futuro';

type Lancamento = {
  id: number;
  descricao: string;
  tipo: 'entrada' | 'saida';
  categoria: TipoLancamento;
  valor: number;
  data: string;
  status: StatusLancamento;
  banco?: string;
  parcela?: string;
  faturaId?: number;
};

type Fatura = {
  id: number;
  cartao: string;
  vencimento: string;
};


export default function LancamentosScreen() {
  const { darkMode } = useTheme();
  const { colors } = useNavTheme();

  const styles = createStyles(colors, darkMode);

  const [filtroVisible, setFiltroVisible] = useState(false);
  const [faturasAbertas, setFaturasAbertas] = useState<number[]>([]);

  // 🔹 FATURAS
  const faturas = [
    { id: 1, cartao: 'Nubank', vencimento: '15/01/2026' },
  ];

  // 🔹 LANÇAMENTOS
  const lancamentos = [
    {
      id: 1,
      descricao: 'Salário',
      tipo: 'entrada',
      categoria: 'salario',
      valor: 5200,
      data: '05/01/2026',
      status: 'pago',
    },
    {
      id: 2,
      descricao: 'Supermercado',
      tipo: 'saida',
      categoria: 'alimentacao',
      valor: 380,
      data: '08/01/2026',
      status: 'pago',
    },
    {
      id: 3,
      descricao: 'iFood',
      tipo: 'saida',
      categoria: 'alimentacao',
      valor: 120,
      data: '09/01/2026',
      status: 'pago',
      faturaId: 1,
      parcela: '2/6',
    },
    {
      id: 4,
      descricao: 'Amazon',
      tipo: 'saida',
      categoria: 'cartao',
      valor: 300,
      data: '10/01/2026',
      status: 'pendente',
      faturaId: 1,
    },
    {
      id: 5,
      descricao: 'Internet',
      tipo: 'saida',
      categoria: 'conta_fixa',
      valor: 120,
      data: '20/01/2026',
      status: 'futuro',
    },
  ];

  function toggleFatura(id: number) {
    setFaturasAbertas(prev =>
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id],
    );
  }

  function getIcon(categoria: string) {
    switch (categoria) {
      case 'pix':
        return 'zap';
      case 'cartao':
        return 'credit-card';
      case 'alimentacao':
        return 'shopping-cart';
      case 'salario':
        return 'dollar-sign';
      case 'conta_fixa':
        return 'file-text';
      default:
        return 'circle';
    }
  }

  const totalEntradas = lancamentos
    .filter(l => l.tipo === 'entrada')
    .reduce((s, l) => s + l.valor, 0);

  const totalSaidas = lancamentos
    .filter(l => l.tipo === 'saida')
    .reduce((s, l) => s + l.valor, 0);

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.title}>Extrato</Text>

        <View style={styles.actions}>
          <TouchableOpacity onPress={() => setFiltroVisible(true)}>
            <Feather name="filter" size={22} color={colors.text} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.addBtn}>
            <Feather name="plus" size={18} color="#fff" />
            <Text style={styles.addText}>Adicionar</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* LISTA */}
      <FlatList
        contentContainerStyle={{ paddingBottom: 140 }}
        data={faturas}
        keyExtractor={f => `fatura-${f.id}`}
        renderItem={({ item: fatura }) => (
          <View>
            {/* FATURA */}
            <TouchableOpacity
              style={styles.fatura}
              onPress={() => toggleFatura(fatura.id)}
            >
              <Feather name="credit-card" size={20} color={colors.primary} />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.faturaTitle}>
                  Fatura {fatura.cartao}
                </Text>
                <Text style={styles.faturaMeta}>
                  Vencimento {fatura.vencimento}
                </Text>
              </View>
              <Feather
                name={
                  faturasAbertas.includes(fatura.id)
                    ? 'chevron-up'
                    : 'chevron-down'
                }
                size={20}
                color={colors.text}
              />
            </TouchableOpacity>

            {/* ITENS DA FATURA */}
            {faturasAbertas.includes(fatura.id) &&
              lancamentos
                .filter(l => l.faturaId === fatura.id)
                .map(item => (
                  <View key={item.id} style={styles.item}>
                    <Feather
                      name={getIcon(item.categoria)}
                      size={18}
                      color={colors.text}
                    />
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={styles.desc}>{item.descricao}</Text>
                      <Text style={styles.meta}>
                        {item.data} • Parcela {item.parcela}
                      </Text>
                    </View>
                    <Text style={styles.saida}>- R$ {item.valor}</Text>
                  </View>
                ))}
          </View>
        )}
      />

      {/* FOOTER FIXO */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Entradas: R$ {totalEntradas}
        </Text>
        <Text style={styles.footerText}>
          Saídas: R$ {totalSaidas}
        </Text>
        <Text style={styles.footerSaldo}>
          Saldo: R$ {totalEntradas - totalSaidas}
        </Text>
      </View>

      {/* MODAL FILTRO */}
      <Modal visible={filtroVisible} animationType="slide">
        <View style={styles.modal}>
          <Text style={styles.modalTitle}>Filtros</Text>

          <Text style={styles.modalItem}>✔ Entradas</Text>
          <Text style={styles.modalItem}>✔ Saídas</Text>
          <Text style={styles.modalItem}>✔ Parcelados</Text>
          <Text style={styles.modalItem}>✔ Futuros</Text>
          <Text style={styles.modalItem}>✔ Pagos</Text>
          <Text style={styles.modalItem}>✔ Vencidos</Text>
          <Text style={styles.modalItem}>✔ Alimentação</Text>
          <Text style={styles.modalItem}>✔ Cartão</Text>

          <TouchableOpacity
            style={styles.applyBtn}
            onPress={() => setFiltroVisible(false)}
          >
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>
              Aplicar filtros
            </Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}
const createStyles = (colors: any, dark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },

    header: {
      padding: 16,
      backgroundColor: dark ? '#1e1e1e' : '#fff',
      elevation: 4,
    },

    title: {
      fontSize: 22,
      fontWeight: 'bold',
      color: colors.text,
    },

    actions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 12,
    },

    addBtn: {
      flexDirection: 'row',
      backgroundColor: colors.primary,
      padding: 10,
      borderRadius: 10,
      alignItems: 'center',
      gap: 6,
    },

    addText: {
      color: '#fff',
      fontWeight: 'bold',
    },

    fatura: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 14,
      backgroundColor: dark ? '#2a2a2a' : '#eaeaea',
      marginTop: 10,
    },

    faturaTitle: {
      fontWeight: 'bold',
      color: colors.text,
    },

    faturaMeta: {
      fontSize: 12,
      color: colors.text,
      opacity: 0.7,
    },

    item: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 14,
      paddingLeft: 32,
      borderBottomWidth: 1,
      borderColor: dark ? '#333' : '#ddd',
    },

    desc: {
      color: colors.text,
      fontWeight: '600',
    },

    meta: {
      fontSize: 12,
      color: colors.text,
      opacity: 0.6,
    },

    entrada: { color: '#2ecc71', fontWeight: 'bold' },
    saida: { color: '#e74c3c', fontWeight: 'bold' },

    footer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      padding: 14,
      backgroundColor: dark ? '#1e1e1e' : '#fff',
      borderTopWidth: 1,
      borderColor: dark ? '#333' : '#ddd',
    },

    footerText: {
      color: colors.text,
      fontSize: 12,
    },

    footerSaldo: {
      color: colors.primary,
      fontWeight: 'bold',
      marginTop: 4,
    },

    modal: {
      flex: 1,
      padding: 20,
      backgroundColor: colors.background,
    },

    modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 20,
    },

    modalItem: {
      fontSize: 16,
      color: colors.text,
      marginBottom: 10,
    },

    applyBtn: {
      marginTop: 20,
      backgroundColor: colors.primary,
      padding: 14,
      borderRadius: 12,
      alignItems: 'center',
    },
  });
