import { db } from '../../index';


export function createTipo_SaidaTable() {
    db.execute(`
        CREATE TABLE IF NOT EXISTS tipo_saida (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            descricao TEXT NOT NULL,
            criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    `);
    db.execute(`
        INSERT OR IGNORE INTO tipo_saida (id, descricao) VALUES 
            (0, 'Débito'),
            (1, 'Crédito'),
            (2, 'Transferência'),
            (3, 'Pix'),
            (4, 'VR/VA');
    `);
}