import { db } from "../..";

export function createDbVersionSchema() {
    db.execute(`
        CREATE TABLE IF NOT EXISTS db_version(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            version REAL NOT NULL,
            criada_em DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    db.execute(`
        INSERT OR IGNORE INTO db_version (id, version) VALUES (1, 0.1);
    `);
}