import { db } from '../../index';

export function createSaidasTable() {

    // tipo: 
        // 0 - Debido
        // 1 - Crédito
        // 2 - Transferência
        // 3 - Pix
        // 4 - VR/VA
        // 5 - Outros

    // carteira:
        // referencia ao id do cartão de onde a saída foi feita
        // ou a carteira em dinheiro

    db.execute(`
        CREATE TABLE IF NOT EXISTS saidas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,

            descricao TEXT NOT NULL,
            valor REAL NOT NULL,
            data_hora DATETIME NOT NULL,

            status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'pago', 'cancelado', 'atrasado', 'estornado')),

            categoria INTEGER NOT NULL,

            tipo INTEGER NOT NULL,



            parcela_atual INTEGER DEFAULT 1,
            total_parcelas INTEGER DEFAULT 1,

            id_parcela_master INTEGER DEFAULT NULL,

            id_banco INTEGER NOT NULL,
            id_cartao INTEGER DEFAULT NULL,

            criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
            atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP,

            foreign key (categoria) references categorias_saida(id),
            foreign key (tipo) references tipo_saida(id),
            foreign key (id_banco) references bancos(id),
            foreign key (id_cartao) references cartoes(id),
            FOREIGN KEY (id_parcela_master) REFERENCES saidas(id)
        );
    `);
}