import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import { Alert, Platform } from 'react-native';
import { open } from 'react-native-quick-sqlite';
import { getDbVersion } from '../database/domains/db_version/db_versionRepository';
import RNRestart from 'react-native-restart';


const DB_NAME = 'gastou.db';
const DB_PATH_ATUAL = `/data/user/0/com.gastou/files/default/${DB_NAME}`;
const BACKUP_FOLDER = `${RNFS.DownloadDirectoryPath}/Gastou`;

const TEMP_IMPORT_DB = `/data/user/0/com.gastou/files/default/__import_temp.db`;


/* ===================== UTIL ===================== */

function getDateTimeLocal() {
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');

  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(
    now.getDate()
  )}_${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(
    now.getSeconds()
  )}`;
}

async function garantirPastaBackup() {
  const exists = await RNFS.exists(BACKUP_FOLDER);
  if (!exists) {
    await RNFS.mkdir(BACKUP_FOLDER);
  }
}

async function getDbVersionFromPath(dbPath: string): Promise<number> {
  try {
    // Copia o backup para um DB temporário no sandbox
    await RNFS.unlink(TEMP_IMPORT_DB).catch(() => {});
    await RNFS.copyFile(dbPath, TEMP_IMPORT_DB);

    const tempDb = open({
      name: '__import_temp.db',
      location: 'default',
    });

    const result: any = tempDb.execute(
      'SELECT version FROM db_version ORDER BY id DESC LIMIT 1'
    );

    tempDb.close();

    if (!result?.rows?.length) return 0;

    return result.rows.item(0).version;
  } catch (err) {
    console.log('Erro ao ler versão do backup:', err);
    return 0;
  }
}


async function substituirBanco(backupPath: string) {
  try {
    await RNFS.unlink(DB_PATH_ATUAL).catch(() => {});
    await RNFS.copyFile(backupPath, DB_PATH_ATUAL);

    await RNFS.unlink(TEMP_IMPORT_DB).catch(() => {});


    Alert.alert(
      'Importação concluída',
      'O banco de dados foi restaurado com sucesso.\n\nReabra o aplicativo para garantir o funcionamento correto.',
      [{ text: 'OK',
         onPress: () => {
            RNRestart.Restart(); // 🔁 reinicia o app
          },
       }],
      
      { cancelable: false }
    );



  } catch (err) {
    console.log(err);
    Alert.alert('Erro', 'Falha ao substituir o banco de dados.');
  }
}

/* ===================== EXPORT ===================== */

export async function exportarBanco() {
  try {
    const dbPath =
      Platform.OS === 'android'
        ? DB_PATH_ATUAL
        : `${RNFS.LibraryDirectoryPath}/${DB_NAME}`;

    const exists = await RNFS.exists(dbPath);
    if (!exists) {
      Alert.alert('Erro', 'Banco de dados não encontrado.');
      return;
    }

    await garantirPastaBackup();

    const exportPath = `${BACKUP_FOLDER}/backup_gastou_${getDateTimeLocal()}.db`;

    await RNFS.copyFile(dbPath, exportPath);

    Alert.alert(
      'Backup concluído',
      'O backup foi salvo em:\n\nDownloads/Gastou',
      [
        { text: 'Não compartilhar', style: 'cancel' },
        {
          text: 'Compartilhar',
          onPress: async () => {
            await Share.open({
              title: 'Backup do Gastou?',
              message: 'Backup completo do banco de dados',
              url: `file://${exportPath}`,
              type: 'application/octet-stream',
              failOnCancel: false,
            });
          },
        },
      ]
    );
  } catch (err) {
    console.log(err);
    Alert.alert('Erro', 'Não foi possível exportar o banco de dados.');
  }
}

/* ===================== IMPORT ===================== */

/**
 * Lista os backups disponíveis para o MODAL
 */
export async function listarBackups(): Promise<string[]> {
  await garantirPastaBackup();

  const files = await RNFS.readDir(BACKUP_FOLDER);

  return files
    .filter(f => f.isFile() && f.name.endsWith('.db'))
    .sort((a, b) => b.mtime!.getTime() - a.mtime!.getTime())
    .map(f => f.path);
}

/**
 * Importa o backup ESCOLHIDO pelo usuário
 */
export async function importarBanco(backupPath: string) {
  try {
    const versaoAtual = await getDbVersion();
    const versaoBackup = await getDbVersionFromPath(backupPath);

    if (versaoBackup > versaoAtual) {
      Alert.alert(
        'Possível incompatibilidade',
        `Este backup foi criado em uma versão MAIS NOVA do aplicativo.\n\nVersão do backup: ${versaoBackup}\nVersão atual: ${versaoAtual}\n\nIsso pode causar erros, falhas ou corrupção de dados.`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Continuar mesmo assim',
            style: 'destructive',
            onPress: () => substituirBanco(backupPath),
          },
        ],
        { cancelable: false }
      );
      return;
    }

    substituirBanco(backupPath);
  } catch (err) {
    console.log(err);
    Alert.alert('Erro', 'Não foi possível importar o banco de dados.');
  }
}
