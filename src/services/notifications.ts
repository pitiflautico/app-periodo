import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Reminder } from '../types';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Request notification permissions
 */
export const requestNotificationPermissions = async (): Promise<boolean> => {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Notification permissions not granted');
      return false;
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('period-reminders', {
        name: 'Recordatorios de Periodo',
        importance: Notifications.AndroidImportance.HIGH,
        sound: 'default',
        vibrationPattern: [0, 250, 250, 250],
      });
    }

    return true;
  } catch (error) {
    console.error('Error requesting notification permissions:', error);
    return false;
  }
};

/**
 * Schedule a local notification for a reminder
 */
export const scheduleReminderNotification = async (
  reminder: Reminder
): Promise<string | null> => {
  try {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      console.log('No notification permissions');
      return null;
    }

    // Parse time (HH:MM format)
    const [hours, minutes] = reminder.time.split(':').map(Number);

    let trigger: Notifications.NotificationTriggerInput;

    switch (reminder.frequency) {
      case 'daily':
        trigger = {
          hour: hours,
          minute: minutes,
          repeats: true,
        };
        break;

      case 'weekly':
        trigger = {
          weekday: 1, // Monday
          hour: hours,
          minute: minutes,
          repeats: true,
        };
        break;

      case 'monthly':
        trigger = {
          day: 1,
          hour: hours,
          minute: minutes,
          repeats: true,
        };
        break;

      default:
        // One-time notification
        const triggerDate = new Date();
        triggerDate.setHours(hours, minutes, 0, 0);
        if (triggerDate < new Date()) {
          triggerDate.setDate(triggerDate.getDate() + 1);
        }
        trigger = {
          date: triggerDate,
        };
    }

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: reminder.title,
        body: getNotificationBody(reminder.type),
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
        ...(Platform.OS === 'android' && {
          channelId: 'period-reminders',
        }),
      },
      trigger,
    });

    console.log('Notification scheduled:', notificationId);
    return notificationId;
  } catch (error) {
    console.error('Error scheduling notification:', error);
    return null;
  }
};

/**
 * Cancel a scheduled notification
 */
export const cancelNotification = async (notificationId: string): Promise<void> => {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
    console.log('Notification cancelled:', notificationId);
  } catch (error) {
    console.error('Error cancelling notification:', error);
  }
};

/**
 * Cancel all scheduled notifications
 */
export const cancelAllNotifications = async (): Promise<void> => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('All notifications cancelled');
  } catch (error) {
    console.error('Error cancelling all notifications:', error);
  }
};

/**
 * Schedule period prediction notification
 */
export const schedulePeriodPrediction = async (
  daysUntilPeriod: number,
  daysBeforeToNotify: number = 2
): Promise<string | null> => {
  try {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) return null;

    const notificationDate = new Date();
    notificationDate.setDate(notificationDate.getDate() + daysUntilPeriod - daysBeforeToNotify);
    notificationDate.setHours(9, 0, 0, 0); // 9 AM

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Tu periodo está cerca 🩸',
        body: `Tu periodo está previsto para dentro de ${daysBeforeToNotify} días`,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
        ...(Platform.OS === 'android' && {
          channelId: 'period-reminders',
        }),
      },
      trigger: {
        date: notificationDate,
      },
    });

    return notificationId;
  } catch (error) {
    console.error('Error scheduling period prediction:', error);
    return null;
  }
};

/**
 * Schedule ovulation prediction notification
 */
export const scheduleOvulationPrediction = async (
  daysUntilOvulation: number
): Promise<string | null> => {
  try {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) return null;

    const notificationDate = new Date();
    notificationDate.setDate(notificationDate.getDate() + daysUntilOvulation);
    notificationDate.setHours(9, 0, 0, 0); // 9 AM

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Ventana fértil 🌸',
        body: 'Hoy es tu día de ovulación predicho',
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
        ...(Platform.OS === 'android' && {
          channelId: 'period-reminders',
        }),
      },
      trigger: {
        date: notificationDate,
      },
    });

    return notificationId;
  } catch (error) {
    console.error('Error scheduling ovulation prediction:', error);
    return null;
  }
};

/**
 * Get notification body based on reminder type
 */
const getNotificationBody = (type: Reminder['type']): string => {
  switch (type) {
    case 'pill':
      return 'Es hora de tomar tu píldora';
    case 'period':
      return 'Recordatorio de periodo';
    case 'ovulation':
      return 'Estás en tu ventana fértil';
    default:
      return 'Tienes un recordatorio';
  }
};

/**
 * Get all scheduled notifications
 */
export const getScheduledNotifications = async () => {
  try {
    const notifications = await Notifications.getAllScheduledNotificationsAsync();
    console.log('Scheduled notifications:', notifications);
    return notifications;
  } catch (error) {
    console.error('Error getting scheduled notifications:', error);
    return [];
  }
};
