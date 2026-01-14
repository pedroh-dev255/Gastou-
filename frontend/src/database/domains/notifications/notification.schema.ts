import { db } from '../../index';

export function createNotificationsTable() {

    db.execute(`
        CREATE TABLE IF NOT EXISTS notifications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            notifee_id TEXT,
            title TEXT NOT NULL,
            body TEXT NOT NULL,
            agendada_para DATETIME,
            enviada_em DATETIME,
            lida INTEGER DEFAULT 0,
            criada_em DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    `);
}