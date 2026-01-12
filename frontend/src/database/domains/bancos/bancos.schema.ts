import { db } from '../../index';

export function createBancosTable() {
    // tipo de banco:
        // 0 - Dinheiro
        // 1 - Banco Tradicional
        // 2 - Carteira Digital
        // 3 - Investimentos
        // ... - Outros


    db.execute(`
        CREATE TABLE IF NOT EXISTS bancos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            cor VARCHAR(7) DEFAULT '#000000',
            tipo INTEGER DEFAULT 0,
            status TEXT DEFAULT 'ativo' CHECK (status IN ('ativo', 'bloqueado', 'pausado', 'inativo')),
            criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
            atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (tipo) REFERENCES tipo_banco(id) 
        );
    `);

    db.execute(`
        INSERT OR IGNORE INTO bancos (id, nome, cor, tipo) VALUES (1, 'Dinheiro', '#FFD700', 0);
    `);
}