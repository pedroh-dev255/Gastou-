import React, { useState, useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';

const SQL_KEYWORDS = [
  'SELECT',
  'INSERT',
  'UPDATE',
  'DELETE',
  'FROM',
  'WHERE',
  'VALUES',
  'SET',
  'CREATE',
  'TABLE',
  'ALTER',
  'DROP',
  'PRAGMA',
  'JOIN',
  'LEFT',
  'RIGHT',
  'INNER',
  'ORDER BY',
  'GROUP BY',
  'LIMIT',
];

const SQL_SNIPPETS = [
  { label: 'SELECT *', value: 'SELECT * FROM tabela;' },
  { label: 'INSERT', value: 'INSERT INTO tabela (coluna) VALUES (valor);' },
  { label: 'UPDATE', value: 'UPDATE tabela SET coluna = valor WHERE id = ?;' },
  { label: 'DELETE', value: 'DELETE FROM tabela WHERE id = ?;' },
  { label: 'PRAGMA', value: 'PRAGMA table_info(tabela);' },
];


type Props = {
  visible: boolean;
  onClose: () => void;
  onExecute: (query: string) => void;
};

export default function SqlQueryModal({
  visible,
  onClose,
  onExecute,
}: Props) {
  const [query, setQuery] = useState('');
  const [history, setHistory] = useState<string[]>([]);

  const lastWord = useMemo(() => {
    const parts = query.split(/\s+/);
    return parts[parts.length - 1] || '';
  }, [query]);

  const suggestions = useMemo(() => {
    if (!lastWord) return [];
    return SQL_KEYWORDS.filter((k) =>
      k.toLowerCase().startsWith(lastWord.toLowerCase())
    );
  }, [lastWord]);

  function replaceLastWord(word: string) {
    const parts = query.split(/\s+/);
    parts.pop();
    setQuery(parts.concat(word).join(' ') + ' ');
  }

  function handleRun() {
    if (!query.trim()) {
      Alert.alert('Query vazia', 'Digite uma query SQL.');
      return;
    }

    setHistory((prev) =>
      [query, ...prev.filter((q) => q !== query)].slice(0, 10)
    );

    onExecute(query);
  }

  return (
    <Modal visible={visible} transparent onRequestClose={onClose} animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>SQL Console</Text>

          {/* SNIPPETS */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {SQL_SNIPPETS.map((s) => (
              <TouchableOpacity
                key={s.label}
                style={styles.snippet}
                onPress={() => setQuery(s.value)}
              >
                <Text style={styles.snippetText}>{s.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* INPUT */}
          <TextInput
            style={styles.input}
            placeholder="Digite sua query SQL..."
            placeholderTextColor="#888"
            multiline
            value={query}
            onChangeText={setQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />

          {/* AUTOCOMPLETE */}
          {suggestions.length > 0 && (
            <View style={styles.autocomplete}>
              {suggestions.map((s) => (
                <TouchableOpacity
                  key={s}
                  onPress={() => replaceLastWord(s)}
                >
                  <Text style={styles.suggestion}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* HISTORY */}
          {history.length > 0 && (
            <View style={styles.history}>
              <Text style={styles.historyTitle}>Histórico</Text>
              {history.map((q, i) => (
                <TouchableOpacity key={i} onPress={() => setQuery(q)}>
                  <Text style={styles.historyItem} numberOfLines={1}>
                    {q}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* ACTIONS */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.button, styles.cancel]}
              onPress={onClose}
            >
              <Text style={styles.buttonText}>Fechar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.run]}
              onPress={handleRun}
            >
              <Text style={styles.buttonText}>Executar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  container: {
    width: '92%',
    backgroundColor: '#1e1e1e',
    borderRadius: 14,
    padding: 16,
  },

  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },

  snippet: {
    backgroundColor: '#333',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    marginRight: 8,
    marginBottom: 8,
  },

  snippetText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'monospace',
  },

  input: {
    height: 150,
    backgroundColor: '#2b2b2b',
    borderRadius: 8,
    color: '#fff',
    padding: 12,
    textAlignVertical: 'top',
    fontFamily: 'monospace',
    marginTop: 8,
  },

  autocomplete: {
    backgroundColor: '#111',
    borderRadius: 6,
    marginTop: 6,
    padding: 6,
  },

  suggestion: {
    color: '#4CAF50',
    paddingVertical: 4,
    fontFamily: 'monospace',
  },

  history: {
    marginTop: 10,
  },

  historyTitle: {
    color: '#aaa',
    fontSize: 12,
    marginBottom: 4,
  },

  historyItem: {
    color: '#777',
    fontSize: 12,
    fontFamily: 'monospace',
  },

  actions: {
    flexDirection: 'row',
    marginTop: 16,
  },

  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },

  cancel: {
    backgroundColor: '#555',
    marginRight: 8,
  },

  run: {
    backgroundColor: '#4CAF50',
    marginLeft: 8,
  },

  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
