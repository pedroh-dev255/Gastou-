import { db } from '../../index';

export async function updateBancoV2() {
  const result: any = await db.execute(`
    SELECT version FROM db_version
    ORDER BY id DESC
    LIMIT 1
  `);

  // pega a versão atual
  const currentVersion =
    result.rows.length > 0
      ? Number(result.rows.item(0).version)
      : 0;

  console.log('DB version:', currentVersion);
    /*
  // ===== MIGRATION 0.1 -> 0.2 =====
  if (currentVersion < 0.2) {
    console.log('Updating DB to 0.2');

    // 👉 coloque aqui alterações da v0.2
    // ex:
    // await db.execute(`ALTER TABLE bancos ADD COLUMN ativo INTEGER DEFAULT 1`);

    await db.execute(`
      INSERT INTO db_version(version) values (0.2);
    `);
  }

  // ===== MIGRATION 0.2 -> 0.3 =====
  if (currentVersion < 0.3) {
    console.log('Updating DB to 0.3');

    // 👉 alterações da v0.3
    // ex:
    // await db.execute(`CREATE TABLE categorias_saida (...)`);

    await db.execute(`
      INSERT INTO db_version(version) values (0.3);
    `);
  }
    */
}
