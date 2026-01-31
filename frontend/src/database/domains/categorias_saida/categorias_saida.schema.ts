import { db } from "../..";

export function createCategoriasSaidaSchema() {
    db.execute(`
        CREATE TABLE IF NOT EXISTS categorias_saida(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL UNIQUE,
            cor VARCHAR(7) DEFAULT '#000000'
        );
    `);
    
}