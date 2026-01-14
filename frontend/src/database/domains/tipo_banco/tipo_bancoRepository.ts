import { db } from '../../index';


export async function getAllTipoBancos() {
    const result = await db.execute(
        'SELECT * FROM tipo_banco;'
    );
    const tipoBancos = [];
    if(result.rows == null) {
        return [];
    }
    for (let i = 0; i < result.rows.length; i++) {
        tipoBancos.push(result.rows.item(i));
    }
    return tipoBancos;
}

export async function addTipoBanco(descricao: string) {
    await db.execute(
        'INSERT INTO tipo_banco (descricao) VALUES (?);',
        [descricao]
    );
}

export async function updateTipoBanco(id: number, descricao: string) {
    await db.execute(
        'UPDATE tipo_banco SET descricao = ?, atualizado_em = CURRENT_TIMESTAMP WHERE id = ?;',
        [descricao, id]
    );
}