import { db } from '../../index';


export async function getDbVersion() {
    const result = await db.execute(
        'SELECT * FROM db_version ORDER BY id DESC LIMIT 1;'
    );

    if(!result.rows || result.rows.length === 0) {
        return 0;
    }
    const currentVersion =

    result.rows.length > 0
        ? Number(result.rows.item(0).version)
        : 0;

    
    return currentVersion;
}