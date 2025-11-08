import AsyncStorage from '@react-native-async-storage/async-storage';
import { Period, DailyLog, Reminder, UserProfile, Settings } from '../types';

const KEYS = {
  PERIODS: '@periods',
  DAILY_LOGS: '@daily_logs',
  REMINDERS: '@reminders',
  USER_PROFILE: '@user_profile',
  SETTINGS: '@settings',
  ONBOARDING_COMPLETED: '@onboarding_completed',
};

// Periods
export const savePeriods = async (periods: Period[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(KEYS.PERIODS, JSON.stringify(periods));
  } catch (error) {
    console.error('Error saving periods:', error);
    throw error;
  }
};

export const getPeriods = async (): Promise<Period[]> => {
  try {
    const data = await AsyncStorage.getItem(KEYS.PERIODS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting periods:', error);
    return [];
  }
};

export const addPeriod = async (period: Period): Promise<void> => {
  try {
    const periods = await getPeriods();
    periods.push(period);
    await savePeriods(periods);
  } catch (error) {
    console.error('Error adding period:', error);
    throw error;
  }
};

export const updatePeriod = async (periodId: string, updates: Partial<Period>): Promise<void> => {
  try {
    const periods = await getPeriods();
    const index = periods.findIndex(p => p.id === periodId);
    if (index !== -1) {
      periods[index] = { ...periods[index], ...updates };
      await savePeriods(periods);
    }
  } catch (error) {
    console.error('Error updating period:', error);
    throw error;
  }
};

// Daily Logs
export const saveDailyLogs = async (logs: DailyLog[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(KEYS.DAILY_LOGS, JSON.stringify(logs));
  } catch (error) {
    console.error('Error saving daily logs:', error);
    throw error;
  }
};

export const getDailyLogs = async (): Promise<DailyLog[]> => {
  try {
    const data = await AsyncStorage.getItem(KEYS.DAILY_LOGS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting daily logs:', error);
    return [];
  }
};

export const addDailyLog = async (log: DailyLog): Promise<void> => {
  try {
    const logs = await getDailyLogs();
    const existingIndex = logs.findIndex(l => l.date === log.date);

    if (existingIndex !== -1) {
      logs[existingIndex] = { ...logs[existingIndex], ...log };
    } else {
      logs.push(log);
    }

    await saveDailyLogs(logs);
  } catch (error) {
    console.error('Error adding daily log:', error);
    throw error;
  }
};

export const getDailyLog = async (date: string): Promise<DailyLog | null> => {
  try {
    const logs = await getDailyLogs();
    return logs.find(l => l.date === date) || null;
  } catch (error) {
    console.error('Error getting daily log:', error);
    return null;
  }
};

// Reminders
export const saveReminders = async (reminders: Reminder[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(KEYS.REMINDERS, JSON.stringify(reminders));
  } catch (error) {
    console.error('Error saving reminders:', error);
    throw error;
  }
};

export const getReminders = async (): Promise<Reminder[]> => {
  try {
    const data = await AsyncStorage.getItem(KEYS.REMINDERS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting reminders:', error);
    return [];
  }
};

export const addReminder = async (reminder: Reminder): Promise<void> => {
  try {
    const reminders = await getReminders();
    reminders.push(reminder);
    await saveReminders(reminders);
  } catch (error) {
    console.error('Error adding reminder:', error);
    throw error;
  }
};

export const updateReminder = async (reminderId: string, updates: Partial<Reminder>): Promise<void> => {
  try {
    const reminders = await getReminders();
    const index = reminders.findIndex(r => r.id === reminderId);
    if (index !== -1) {
      reminders[index] = { ...reminders[index], ...updates };
      await saveReminders(reminders);
    }
  } catch (error) {
    console.error('Error updating reminder:', error);
    throw error;
  }
};

export const deleteReminder = async (reminderId: string): Promise<void> => {
  try {
    const reminders = await getReminders();
    const filtered = reminders.filter(r => r.id !== reminderId);
    await saveReminders(filtered);
  } catch (error) {
    console.error('Error deleting reminder:', error);
    throw error;
  }
};

// User Profile
export const saveUserProfile = async (profile: UserProfile): Promise<void> => {
  try {
    await AsyncStorage.setItem(KEYS.USER_PROFILE, JSON.stringify(profile));
  } catch (error) {
    console.error('Error saving user profile:', error);
    throw error;
  }
};

export const getUserProfile = async (): Promise<UserProfile | null> => {
  try {
    const data = await AsyncStorage.getItem(KEYS.USER_PROFILE);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
};

// Settings
export const saveSettings = async (settings: Settings): Promise<void> => {
  try {
    await AsyncStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving settings:', error);
    throw error;
  }
};

export const getSettings = async (): Promise<Settings> => {
  try {
    const data = await AsyncStorage.getItem(KEYS.SETTINGS);
    return data ? JSON.parse(data) : {
      theme: 'light',
      securityEnabled: false,
      notificationsEnabled: true,
      language: 'es',
    };
  } catch (error) {
    console.error('Error getting settings:', error);
    return {
      theme: 'light',
      securityEnabled: false,
      notificationsEnabled: true,
      language: 'es',
    };
  }
};

// Onboarding
export const setOnboardingCompleted = async (completed: boolean): Promise<void> => {
  try {
    await AsyncStorage.setItem(KEYS.ONBOARDING_COMPLETED, JSON.stringify(completed));
  } catch (error) {
    console.error('Error setting onboarding completed:', error);
    throw error;
  }
};

export const isOnboardingCompleted = async (): Promise<boolean> => {
  try {
    const data = await AsyncStorage.getItem(KEYS.ONBOARDING_COMPLETED);
    return data ? JSON.parse(data) : false;
  } catch (error) {
    console.error('Error checking onboarding:', error);
    return false;
  }
};

// Export data
export const exportAllData = async () => {
  try {
    const periods = await getPeriods();
    const dailyLogs = await getDailyLogs();
    const reminders = await getReminders();
    const profile = await getUserProfile();
    const settings = await getSettings();

    return {
      periods,
      dailyLogs,
      reminders,
      profile,
      settings,
      exportDate: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error exporting data:', error);
    throw error;
  }
};

// Clear all data
export const clearAllData = async (): Promise<void> => {
  try {
    await AsyncStorage.clear();
  } catch (error) {
    console.error('Error clearing data:', error);
    throw error;
  }
};
