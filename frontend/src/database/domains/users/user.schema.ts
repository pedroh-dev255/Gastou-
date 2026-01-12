import { db } from '../../index';

export function createUsersTable() {
  db.execute(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT default 'Usuário',
        email TEXT default '',
        dark_mode BOOLEAN DEFAULT 0,
        notifications_enabled BOOLEAN DEFAULT 0,
        onboarding_completed BOOLEAN DEFAULT 0,
        criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  db.execute(`
    INSERT OR IGNORE INTO users (id, nome, email, dark_mode, notifications_enabled, onboarding_completed) VALUES (1, 'Usuário', '', 0, 0, 0);
  `);
}
