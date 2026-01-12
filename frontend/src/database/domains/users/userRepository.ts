import { db } from '../../index';

export async function getUser() {
  const result = await db.execute(
    'SELECT * FROM users WHERE id = 1;'
  );
  return result.rows?.item(0);
}

export async function updateUserName(nome: string) {
  await db.execute(
    'UPDATE users SET nome = ? WHERE id = 1;',
    [nome]
  );
}

export async function updateUserOnboardingCompleted(onboarding_completed: number) {
  await db.execute(
    'UPDATE users SET onboarding_completed = ? WHERE id = 1;',
    [onboarding_completed]
  );
}

export async function updateUserDarkMode(dark_mode: boolean) {
  await db.execute(
    'UPDATE users SET dark_mode = ? WHERE id = 1;',
    [dark_mode ? 1 : 0]
  );
}

export async function updateUserNotificationsEnabled(notifications_enabled: boolean) {
  await db.execute(
    'UPDATE users SET notifications_enabled = ? WHERE id = 1;',
    [notifications_enabled ? 1 : 0]
  );
}