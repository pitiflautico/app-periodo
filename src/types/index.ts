export interface Period {
  id: string;
  startDate: string;
  endDate?: string;
  flow?: 'light' | 'medium' | 'heavy';
  symptoms?: string[];
  notes?: string;
}

export interface CycleData {
  id: string;
  periods: Period[];
  averageCycleLength: number;
  averagePeriodLength: number;
}

export interface DailyLog {
  date: string;
  mood?: 'happy' | 'sad' | 'anxious' | 'calm' | 'angry' | 'confused' | 'sleepy' | 'distracted';
  symptoms?: string[];
  flow?: 'light' | 'medium' | 'heavy';
  notes?: string;
  sexualActivity?: boolean;
}

export interface Reminder {
  id: string;
  type: 'pill' | 'period' | 'ovulation' | 'custom';
  title: string;
  time: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'custom';
  enabled: boolean;
  notificationId?: string;
}

export interface UserProfile {
  name?: string;
  age?: number;
  weight?: number;
  height?: number;
  lastPeriodDate?: string;
  averageCycleLength: number;
  averagePeriodLength: number;
  firstTimeUser: boolean;
}

export interface Settings {
  theme: 'light' | 'dark' | 'auto';
  securityEnabled: boolean;
  securityType?: 'pin' | 'biometric';
  pin?: string;
  notificationsEnabled: boolean;
  language: string;
}

export type NavigationParamList = {
  Onboarding: undefined;
  Main: undefined;
  Home: undefined;
  Calendar: undefined;
  Statistics: undefined;
  Settings: undefined;
  AddPeriod: undefined;
  DayDetails: { date: string };
  Reminders: undefined;
  AddReminder: { reminder?: Reminder };
  Security: undefined;
  Export: undefined;
};
