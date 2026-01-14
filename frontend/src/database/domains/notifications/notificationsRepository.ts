import { db } from '../../index';
export async function getAllNotifications() {
    const result = await db.execute(
        'SELECT * FROM notifications ORDER BY criado_em DESC;'
    );
    const notifications = [];
    if(result.rows == null) {
        return [];
    }
    for (let i = 0; i < result.rows.length; i++) {
        notifications.push(result.rows.item(i));
    }
    return notifications;
}

export async function markNotificationAsRead(id: number) {
    await db.execute(
        'UPDATE notifications SET lida = 1 WHERE id = ?;',
        [id]
    );
}

export async function addNotification(notifee_id: string, titulo: string, mensagem: string, agendada_para: Date) {
    await db.execute(
        'INSERT INTO notifications (notifee_id, title, body, agendada_para) VALUES (?, ?, ?, ?)',
        [notifee_id, titulo, mensagem, agendada_para]
    );
}

export async function deleteNotification(id: number) {
    await db.execute(
        'DELETE FROM notifications WHERE id = ?;',
        [id]
    );
}

export async function deleteAllNotifications() {
    await db.execute(
        'DELETE FROM notifications;'
    );
}

