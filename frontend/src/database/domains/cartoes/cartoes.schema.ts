import { db } from '../../index';

export function createCartoesTable() {
    // tipo de cartão:
        // 0 - Debito
        // 1 - Credito


    db.execute(`
        CREATE TABLE IF NOT EXISTS cartoes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            id_banco INTEGER NOT NULL,
            tipo INTEGER DEFAULT 0,
            status TEXT DEFAULT 'ativo' CHECK (status IN ('ativo', 'bloqueado', 'pausado', 'inativo')),
            data_fechamento date not null,
            data_vencimento date not null,
            criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
            atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (id_banco) REFERENCES bancos(id) 
        );
    `);


}