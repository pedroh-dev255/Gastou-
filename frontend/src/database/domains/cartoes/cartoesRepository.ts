import { db } from "../..";


export async function getAllCartoes(){
    const result = await db.execute('select cartoes.id as id, cartoes.nome as nome, cartoes.tipo as tipo, cartoes.status as status, bancos.nome as banco_nome, cartoes.id_banco as id_banco from cartoes inner join bancos on cartoes.id_banco = bancos.id');

    const cartoes = [];

    if(result.rows == null) {
        return [];
    }

    for (let i = 0; i < result.rows.length; i++) {
        cartoes.push(result.rows.item(i));
    }
    return cartoes;
}

export async function addCartao() {

}

export async function updateCartao() {

}