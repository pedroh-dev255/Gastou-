/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
// Importar logger
import { initLogger, logError, logInfo, logWarn } from './src/services/loggerService';

initLogger().then(() => {
  logInfo('Background handler initialized');
});

AppRegistry.registerComponent(appName, () => App);
