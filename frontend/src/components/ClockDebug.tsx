import React, { useEffect, useState } from 'react';
import { Text, View, StyleSheet } from 'react-native';

export default function ClockFullDebug() {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const t = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const date = new Date(now);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>⏱ Debug de Horário</Text>

      <Row label="Date.now()" value={now} />
      <Row label="ISO (UTC)" value={date.toISOString()} />
      <Row label="Local" value={date.toLocaleString()} />
      <Row
        label="Timezone"
        value={Intl.DateTimeFormat().resolvedOptions().timeZone}
      />
      <Row
        label="Offset"
        value={`${date.getTimezoneOffset()} min`}
      />
    </View>
  );
}

/** Linha padrão */
function Row({ label, value }: { label: string; value: string | number }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f3f3f3',
    borderRadius: 10,
    padding: 12,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },

  title: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },

  row: {
    marginBottom: 6,
  },

  label: {
    fontSize: 11,
    color: '#666',
  },

  value: {
    fontSize: 13,
    fontFamily: 'monospace',
    color: '#111',
  },
});
