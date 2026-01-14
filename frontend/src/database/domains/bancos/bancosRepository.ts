import { db } from '../../index';

export async function getAllBancos() {
    const result = await db.execute(
        'SELECT bancos.id as id, bancos.nome as nome, bancos.cor as cor, tipo_banco.descricao as descricao FROM bancos INNER JOIN tipo_banco ON bancos.tipo = tipo_banco.id;'
    );
    const bancos = [];

    if(result.rows == null) {
        return [];
    }

    for (let i = 0; i < result.rows.length; i++) {
        bancos.push(result.rows.item(i));
    }
    return bancos;
}

export async function addBanco(nome: string, cor: string, tipo: string) {
    await db.execute(
        'INSERT INTO bancos (nome, cor, tipo) VALUES (?, ?, ?);',
        [nome, cor, tipo]
    );
}

export async function updateBanco(id: number, nome: string, cor: string, tipo: string, status: string) {
    await db.execute(
        'UPDATE bancos SET nome = ?, cor = ?, tipo = ?, status = ?, atualizado_em = CURRENT_TIMESTAMP WHERE id = ?;',
        [nome, cor, tipo, status, id]
    );
}

