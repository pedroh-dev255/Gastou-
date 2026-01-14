import { db } from '../database/index';

const MAX_LOGS = 100;

export const LOG_LEVELS = {
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR',
  DEBUG: 'DEBUG',
};

// Cache em memória (opcional, melhora UI)
let logs = [];

/* ===========================
   CONSOLE ORIGINAL
=========================== */
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;
const originalConsoleInfo = console.info;
const originalConsoleDebug = console.debug;

/* ===========================
   DB HELPERS
=========================== */

const insertLogDB = (log) => {
  db.execute(
    `INSERT INTO logs (id, timestamp, level, message, data)
     VALUES (?, ?, ?, ?, ?)`,
    [log.id, log.timestamp, log.level, log.message, log.data]
  );

  // Garante limite máximo no banco
  db.execute(`
    DELETE FROM logs
    WHERE id NOT IN (
      SELECT id FROM logs
      ORDER BY timestamp DESC
      LIMIT ?
    )
  `, [MAX_LOGS]);
};

const loadLogsFromDB = () => {
  const result = db.execute(
    `SELECT * FROM logs ORDER BY timestamp DESC LIMIT ?`,
    [MAX_LOGS]
  );

  logs = result.rows?._array ?? [];
  return logs;
};

const clearLogsDB = () => {
  db.execute(`DELETE FROM logs`);
  logs = [];
};

/* ===========================
   LOGGER CORE
=========================== */

export const addLog = async (level, message, data = null) => {
  const timestamp = new Date().toISOString();

  const logEntry = {
    id: `${timestamp}-${Math.random().toString(36).slice(2, 9)}`,
    timestamp,
    level,
    message: typeof message === 'string' ? message : JSON.stringify(message),
    data: data ? JSON.stringify(data) : null,
  };

  // Cache em memória
  logs.unshift(logEntry);
  if (logs.length > MAX_LOGS) logs.pop();

  // Persistência SQLite
  insertLogDB(logEntry);

  // Console original
  const consoleMessage = `[${level}] ${logEntry.message}`;
  switch (level) {
    case LOG_LEVELS.ERROR:
      originalConsoleError(consoleMessage, data || '');
      break;
    case LOG_LEVELS.WARN:
      originalConsoleWarn(consoleMessage, data || '');
      break;
    case LOG_LEVELS.INFO:
      originalConsoleInfo(consoleMessage, data || '');
      break;
    case LOG_LEVELS.DEBUG:
      originalConsoleDebug(consoleMessage, data || '');
      break;
    default:
      originalConsoleLog(consoleMessage, data || '');
  }

  return logEntry;
};

/* ===========================
   HELPERS POR NÍVEL
=========================== */

export const logInfo = (msg, data = null) => addLog(LOG_LEVELS.INFO, msg, data);
export const logWarn = (msg, data = null) => addLog(LOG_LEVELS.WARN, msg, data);
export const logError = (msg, data = null) => addLog(LOG_LEVELS.ERROR, msg, data);
export const logDebug = (msg, data = null) => addLog(LOG_LEVELS.DEBUG, msg, data);

/* ===========================
   CONSULTAS
=========================== */

export const getLogs = () => logs;

export const getLogStats = () => ({
  total: logs.length,
  info: logs.filter(l => l.level === LOG_LEVELS.INFO).length,
  warn: logs.filter(l => l.level === LOG_LEVELS.WARN).length,
  error: logs.filter(l => l.level === LOG_LEVELS.ERROR).length,
  debug: logs.filter(l => l.level === LOG_LEVELS.DEBUG).length,
});

export const filterLogsByLevel = (level) =>
  !level ? logs : logs.filter(l => l.level === level);

export const searchLogs = (term) => {
  if (!term) return logs;
  const t = term.toLowerCase();
  return logs.filter(l =>
    l.message.toLowerCase().includes(t) ||
    l.level.toLowerCase().includes(t)
  );
};

/* ===========================
   CONTROLE
=========================== */

export const clearLogs = async () => {
  clearLogsDB();
  return true;
};

export const loadLogsFromStorage = async () => {
  return loadLogsFromDB();
};

/* ===========================
   INTERCEPTAÇÃO DO CONSOLE
=========================== */

export const initConsoleInterception = () => {
  console.log = (...args) => {
    addLog(LOG_LEVELS.INFO, args.join(' '));
    originalConsoleLog(...args);
  };

  console.error = (...args) => {
    addLog(LOG_LEVELS.ERROR, args.join(' '));
    originalConsoleError(...args);
  };

  console.warn = (...args) => {
    addLog(LOG_LEVELS.WARN, args.join(' '));
    originalConsoleWarn(...args);
  };

  console.info = (...args) => {
    addLog(LOG_LEVELS.INFO, args.join(' '));
    originalConsoleInfo(...args);
  };

  console.debug = (...args) => {
    addLog(LOG_LEVELS.DEBUG, args.join(' '));
    originalConsoleDebug(...args);
  };

  logInfo('Console interception initialized');
};

/* ===========================
   INIT
=========================== */

export const initLogger = async () => {
  loadLogsFromDB();
  initConsoleInterception();
  logInfo('Logger initialized');
};
