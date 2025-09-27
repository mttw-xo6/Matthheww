export enum HabitStatus {
  OnTrack = 'ON_TRACK', // 順調
  MissedOne = 'MISSED_ONE', // 1日休み
  StreakLost = 'STREAK_LOST', // 継続がリセット
  InRecovery = 'IN_RECOVERY', // 復活チャンス
}

export interface HabitStats {
  streak: number;
  recoveryPoints: number;
  status: HabitStatus;
  lastStreakBeforeReset: number;
  longestStreak: number;
}

export interface HabitReminder {
  time: string; // "HH:mm" format
  enabled: boolean;
}

export interface Habit {
  id: string;
  name:string;
  logs: Date[];
  stats: HabitStats;
  reminder?: HabitReminder;
}