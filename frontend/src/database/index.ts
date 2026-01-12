import { open } from 'react-native-quick-sqlite';

export const db = open({
  name: 'gastou.db',
  location: 'default',
});
