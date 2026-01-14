import notifee, {
  AndroidImportance,
  TriggerType,
  TimestampTrigger,
} from '@notifee/react-native';
import { db } from '../database';
import { addNotification } from '../database/domains/notifications/notificationsRepository';
import { getUser } from '../database/domains/users/userRepository';

export async function scheduleNotification(
  title: string,
  body: string,
  date: Date
) {
  const trigger: TimestampTrigger = {
    type: TriggerType.TIMESTAMP,
    timestamp: date.getTime(),
  };

  const user = await getUser();

  const isEnabled = Boolean(user.notifications_enabled);

  if (!isEnabled) return;

  // 👉 ID manual (permite controle depois)
  const notifeeId = `notif_${Date.now()}`;

  await notifee.createTriggerNotification(
    {
      id: notifeeId,
      title,
      body,
      android: {
        channelId: 'default',
        importance: AndroidImportance.HIGH,
      },
    },
    trigger
  );

    // Salva no banco de dados
    await addNotification(notifeeId, title, body, date);

  return notifeeId;
}
