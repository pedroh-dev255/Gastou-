import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TextInput, FlatList, ScrollView, StyleSheet, Alert, Button, TouchableOpacity } from 'react-native';
import notifee, { TimestampTrigger, TriggerType, AndroidImportance } from '@notifee/react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useTheme as useNavTheme } from '@react-navigation/native';
import { useTheme } from '../../components/ThemeContext';
import { db } from '../../database/index';
import SqlQueryModal from '../../components/SqlQueryModal';
import { scheduleNotification } from '../../services/createNotificationSevice';
import ClockDebug from '../../components/ClockDebug';
// Serviço de logs
import {
  getLogs,
  clearLogs,
  getLogStats,
  filterLogsByLevel,
  searchLogs,
  LOG_LEVELS,
  logInfo,
  logWarn,
  logError,
  logDebug, 
  loadLogsFromStorage
} from "../../services/loggerService";



export default function DebugDatabaseScreen() {
  const [tables, setTables] = useState<any[]>([]);
  const { darkMode, toggleDarkMode } = useTheme();
  const [sqlModalVisible, setSqlModalVisible] = useState(false);

  // Estados para logs
  const [logs, setLogs] = useState<any>([]);
  const [logStats, setLogStats] = useState({ total: 0, info: 0, warn: 0, error: 0, debug: 0 });
  const [selectedLog, setSelectedLog] = useState(null);
  const [logDetailVisible, setLogDetailVisible] = useState(false);
  const [logFilter, setLogFilter] = useState('');
  const [logLevelFilter, setLogLevelFilter] = useState('');
  const [isSavingLogs, setIsSavingLogs] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const { colors } = useNavTheme();

  const styles = createStyles(colors, darkMode);

  const loadData = useCallback(() => {
    carregar();
  }, []);

  useEffect(() => {
    loadData();
    loadLogsData();
  }, [loadData, loadLogsData]);

  function getLevelButtonStyle(level: any) {
    const isActive = logLevelFilter === level;
    return {
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 6,
      backgroundColor: isActive ? 
        ('#e5e7eb') : 
        'transparent',
      borderWidth: 1,
      borderColor: '#d1d5db',
    };
  };

  async function handleLoadLogs() {
    try {
      await loadLogsFromStorage();
      loadLogsData();
      logInfo('Logs loaded from storage');
    } catch (error: any) {
      logError('Failed to load logs', error);
    }
  };

  const loadLogsData = useCallback(() => {
    const allLogs: any = getLogs();
    setLogs(allLogs);
    setLogStats(getLogStats());
  }, []);

  const filteredLogs = React.useMemo(() => {
    let filtered: any = logs;
    
    // Filtrar por nível
    if (logLevelFilter) {
      filtered = filterLogsByLevel(logLevelFilter);
    }
    
    // Filtrar por termo de busca
    if (searchTerm) {
      filtered = filtered.filter(log => 
        log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.level.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.data && log.data.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    return filtered;
  }, [logs, logLevelFilter, searchTerm]);

  function handleLogPress(log: any) {
    setSelectedLog(log);
    setLogDetailVisible(true);
  };

  const renderLogItem = ({ item }) => (
    <TouchableOpacity onPress={() => handleLogPress(item)}>
      <LogItem log={item} isDark={darkMode} />
    </TouchableOpacity>
  );

  function carregar() {
    const result = db.execute(`
      SELECT name FROM sqlite_master WHERE type='table'
    `);

    setTables(result.rows?._array ?? []);
  }

  async function handleClearLogs() {
    Alert.alert(
      "Limpar Logs",
      "Deseja limpar todos os logs?",
      [
        { text: "Cancelar", style: 'cancel' },
        {
          text: "Limpar",
          style: 'destructive',
          onPress: async () => {
            await clearLogs();
            loadLogsData();
            logInfo('Logs cleared manually');
          }
        }
      ]
    );
  };

  async function getNotifications() {
    const triggers: any[] = await notifee.getTriggerNotifications();

    console.log('Agendadas:', triggers);

    if (triggers.length === 0) {
      Alert.alert('Notificações', 'Nenhuma notificação agendada');
      return;
    }

    const readable = triggers.map(t => ({
      id: t.notification.id,
      title: t.notification.title,
      body: t.notification.body,
      data: t.notification.data,
      quando: new Date(t.trigger.timestamp).toLocaleString(),
    }));

    Alert.alert(
      'Notificações agendadas',
      JSON.stringify(readable, null, 2)
    );
  }

  async function testeNotificacao() {
    const date = new Date(Date.now() + 60 * 1000); // 1 minuto no futuro
    await scheduleNotification(
      'Notificação de teste',
      'Esta é uma notificação agendada para teste.',
      date
    );
    Alert.alert('Notificação Agendada','Agendada para 1 minuto no futuro.');
  }

  async function sqlQuery(query: string) {
    const result = db.execute(query);
    if(result.rows?._array.length === 0) {
      Alert.alert('Query executada com sucesso', 'Nenhum dado retornado.');
      return;
    }
    Alert.alert('Query result:', JSON.stringify(result.rows?._array, null, 2));
  }

  function verTabela(nome: string) {
    const result = db.execute(`SELECT * FROM ${nome}`);
    console.log(nome, result.rows?._array);
    Alert.alert('Dados da tabela: ' + nome, JSON.stringify(result.rows?._array, null, 2));
  }


  
  const LogItem = ({ log }) => {
    const getLevelColor = (level: any) => {
      switch(level) {
        case LOG_LEVELS.ERROR: return '#ef4444';
        case LOG_LEVELS.WARN: return '#f59e0b';
        case LOG_LEVELS.INFO: return '#10b981';
        case LOG_LEVELS.DEBUG: return '#8b5cf6';
        default: '#666';
      }
    };
    
    const getLevelIcon = (level: any) => {
      switch(level) {
        case LOG_LEVELS.ERROR: return 'alert-circle';
        case LOG_LEVELS.WARN: return 'alert';
        case LOG_LEVELS.INFO: return 'information';
        case LOG_LEVELS.DEBUG: return 'bug';
        default: return 'message-text';
      }
    };
    
    const formatTime = (timestamp: any) => {
      try {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('pt-BR', { 
          hour: '2-digit', 
          minute: '2-digit',
          second: '2-digit',
          fractionalSecondDigits: 3
        });
      } catch {
        return timestamp;
      }
    };
    
    return (
      <View style={[
        styles.logItem,
        { 
          backgroundColor: '#f9fafb',
          borderLeftColor: getLevelColor(log.level),
          borderLeftWidth: 4
        }
      ]}>
        <View style={styles.logHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
            <Feather 
              name={getLevelIcon(log.level)} 
              size={14} 
              color={getLevelColor(log.level)} 
              style={{ marginRight: 6 }}
            />
            <Text style={[styles.logLevel, { color: getLevelColor(log.level) }]}>
              {log.level}
            </Text>
            <Text style={[styles.logTime, { color: '#666' }]}>
              {formatTime(log.timestamp)}
            </Text>
          </View>
          <Text style={[styles.logId, { color: '#999' }]}>
            #{log.id.substring(0, 8)}
          </Text>
        </View>
        
        <Text style={[styles.logMessage, { color: '#333' }]}>
          {log.message}
        </Text>
        
        {log.data && (
          <View style={styles.logDataContainer}>
            <Text style={styles.logDataLabel}>
              Dados:
            </Text>
            <Text style={[styles.logData, { color:'#555' }]} numberOfLines={3}>
              {log.data}
            </Text>
          </View>
        )}
      </View>
    );
  };


  return (
    <>
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
        <View style={{ marginBottom: 16, flexDirection: 'row', gap: 16 }}>
          <TouchableOpacity
            onPress={() => setSqlModalVisible(true)}
            style={{ flexDirection: 'row', alignItems: 'center' }}
          >
            <Feather name="terminal" size={16} color={colors.text} />
            <Text style={{ color: colors.text }}>  SQL </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => getNotifications()}
            style={{ flexDirection: 'row', alignItems: 'center' }}
          >
            <Feather name="bell" size={16} color={colors.text} />
            <Text style={{ color: colors.text }}>  notifee scheduler</Text>
          </TouchableOpacity>
        </View>


        <ClockDebug />



        {tables.map(t => (
          <View key={t.name} style={styles.card}>
            <Text style={styles.tableName}>{t.name}</Text>
            <Button title="Ver dados" onPress={() => verTabela(t.name)} />
          </View>
        ))}


        {/* LOGS DO SISTEMA */}
        <View style={styles.section}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <Text style={styles.secTitle}>Logs Internos ({logStats.total})</Text>
            <TouchableOpacity onPress={handleClearLogs}>
              <Feather name="trash-can-outline" size={20} color="#ef4444" />
            </TouchableOpacity>
          </View>
          
          {/* Estatísticas dos Logs */}
          <View style={styles.logStatsContainer}>
            <View style={styles.logStatItem}>
              <Text style={styles.logStatLabel}>Total</Text>
              <Text style={styles.logStatValue}>{logStats.total}</Text>
            </View>
            <View style={styles.logStatItem}>
              <Text style={[styles.logStatLabel, { color: '#10b981' }]}>Info</Text>
              <Text style={[styles.logStatValue, { color: '#10b981' }]}>{logStats.info}</Text>
            </View>
            <View style={styles.logStatItem}>
              <Text style={[styles.logStatLabel, { color: '#f59e0b' }]}>Warn</Text>
              <Text style={[styles.logStatValue, { color: '#f59e0b' }]}>{logStats.warn}</Text>
            </View>
            <View style={styles.logStatItem}>
              <Text style={[styles.logStatLabel, { color: '#ef4444' }]}>Error</Text>
              <Text style={[styles.logStatValue, { color: '#ef4444' }]}>{logStats.error}</Text>
            </View>
            <View style={styles.logStatItem}>
              <Text style={[styles.logStatLabel, { color: '#8b5cf6' }]}>Debug</Text>
              <Text style={[styles.logStatValue, { color: '#8b5cf6' }]}>{logStats.debug}</Text>
            </View>
          </View>
          
          {/* Filtros */}
          <View style={{ marginBottom: 10 }}>
            <TextInput
              style={[
                styles.searchInput,
                {
                  backgroundColor:'#f9fafb',
                  color:'#333',
                  borderColor:'#d1d5db'
                }
              ]}
              placeholder="Buscar logs..."
              placeholderTextColor='#999'
              value={searchTerm}
              onChangeText={setSearchTerm}
            />
            
            <View style={{ flexDirection: 'row', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
              <TouchableOpacity 
                style={getLevelButtonStyle('')}
                onPress={() => setLogLevelFilter('')}
              >
                <Text style={{ color:'#333', fontSize: 12 }}>Todos</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={getLevelButtonStyle(LOG_LEVELS.INFO)}
                onPress={() => setLogLevelFilter(LOG_LEVELS.INFO)}
              >
                <Text style={{ color: '#10b981', fontSize: 12 }}>Info</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={getLevelButtonStyle(LOG_LEVELS.WARN)}
                onPress={() => setLogLevelFilter(LOG_LEVELS.WARN)}
              >
                <Text style={{ color: '#f59e0b', fontSize: 12 }}>Warn</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={getLevelButtonStyle(LOG_LEVELS.ERROR)}
                onPress={() => setLogLevelFilter(LOG_LEVELS.ERROR)}
              >
                <Text style={{ color: '#ef4444', fontSize: 12 }}>Error</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={getLevelButtonStyle(LOG_LEVELS.DEBUG)}
                onPress={() => setLogLevelFilter(LOG_LEVELS.DEBUG)}
              >
                <Text style={{ color: '#8b5cf6', fontSize: 12 }}>Debug</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[getLevelButtonStyle(''), { marginLeft: 'auto' }]}
                onPress={handleLoadLogs}
              >
                <Feather name="download" size={14} color={'#333'} />
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Lista de Logs */}
          {filteredLogs.length === 0 ? (
            <View style={styles.noLogsContainer}>
              <Feather name="text-box-outline" size={40} color={'#ccc'} />
              <Text style={{ color:'#999', marginTop: 10 }}>
                Nenhum log encontrado
              </Text>
            </View>
          ) : (
            <FlatList
              data={filteredLogs.slice(0, 20)} // Mostrar apenas os 20 mais recentes
              renderItem={renderLogItem}
              keyExtractor={item => item.id}
              scrollEnabled={false}
              ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
              ListFooterComponent={() => (
                filteredLogs.length > 20 && (
                  <View style={{ alignItems: 'center', padding: 10 }}>
                    <Text style={{ color:'#999', fontSize: 12 }}>
                      ... e mais {filteredLogs.length - 20} logs
                    </Text>
                  </View>
                )
              )}
            />
          )}
        </View>

      </ScrollView>
      <SqlQueryModal
        visible={sqlModalVisible}
        onClose={() => setSqlModalVisible(false)}
        onExecute={sqlQuery}
      />
    </>

  );
}

const createStyles = (colors: any, darkMode: boolean) => StyleSheet.create({
  container: {
    padding: 16,
    paddingTop: 40,
    paddingBottom: 50,
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

  // logs
  section: { 
    backgroundColor:'#fff', 
    marginHorizontal:10, 
    marginTop: 10,
    padding:15, 
    borderRadius:10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  secTitle: { 
    fontSize:16, 
    fontWeight:'bold', 
    marginBottom:10, 
    color:'#374151', 
    borderBottomWidth:1, 
    borderColor:'#f3f4f6', 
    paddingBottom:5 
  },
  logItem: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 4,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  logLevel: {
    fontSize: 12,
    fontWeight: 'bold',
    marginRight: 8,
  },
  logTime: {
    fontSize: 11,
  },
  logId: {
    fontSize: 10,
  },
  logMessage: {
    fontSize: 13,
    marginBottom: 4,
  },
  logDataContainer: {
    marginTop: 4,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  logDataLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  logData: {
    fontSize: 11,
    fontFamily: 'monospace',
  },
  logStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    backgroundColor: '#f5f5f5',
    padding: 10,
    borderRadius: 8,
  },
  logStatItem: {
    alignItems: 'center',
    flex: 1,
  },
  logStatLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  logStatValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  searchInput: {
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    marginBottom: 8,
  },
  noLogsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
});
