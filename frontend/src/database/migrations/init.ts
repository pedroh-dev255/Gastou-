//src/database/migrations/init.ts

//importa as tabelas de criação
import { createUsersTable } from '../domains/users/user.schema';
import { createTipo_BancosTable } from '../domains/tipo_banco/tipo_banco.schema';
import { createBancosTable } from '../domains/bancos/bancos.schema';
import { createNotificationsTable } from '../domains/notifications/notification.schema';
import { createLogsTable } from '../domains/logs/createLogsTable';
import { createTipo_SaidaTable } from '../domains/tipo_saida/tipo_saida.schema';
import { createDbVersionSchema } from '../domains/db_version/db_version.schema';
import { createCartoesTable } from '../domains/cartoes/cartoes.schema';

// update de schemas v2
import { updateBancoV2 } from '../domains/updateV2/update.schemas';


export function runMigrations() {
    createUsersTable();
    createTipo_BancosTable();
    createBancosTable();
    createCartoesTable();
    //logs
    createNotificationsTable();
    createLogsTable();
    //saida
    createTipo_SaidaTable();
    

    createDbVersionSchema();


    updateBancoV2();
}
