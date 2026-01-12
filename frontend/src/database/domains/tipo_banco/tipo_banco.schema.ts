import { db } from '../../index';


export function createTipo_BancosTable() {
    db.execute(`
        CREATE TABLE IF NOT EXISTS tipo_banco (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            descricao TEXT NOT NULL,
            criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    `);

    db.execute(`
        INSERT OR IGNORE INTO tipo_banco (id, descricao) VALUES 
            (0, 'Dinheiro'),
            (1, 'Banco Tradicional'),
            (2, 'Carteira Digital'),
            (3, 'Investimentos');
    `);
}