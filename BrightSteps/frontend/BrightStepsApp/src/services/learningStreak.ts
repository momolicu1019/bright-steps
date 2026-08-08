import AsyncStorage from '@react-native-async-storage/async-storage';

const STREAK_STORAGE_KEY = 'brightsteps.learningStreak';

type StreakRecord = {
  lastActiveDate: string;
  streakDays: number;
};

function dateKey(offsetDays = 0): string {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString().slice(0, 10);
}

async function readStreak(): Promise<StreakRecord> {
  try {
    const raw = await AsyncStorage.getItem(STREAK_STORAGE_KEY);
    if (!raw) {
      return { lastActiveDate: '', streakDays: 0 };
    }
    const parsed = JSON.parse(raw) as StreakRecord;
    return {
      lastActiveDate: parsed.lastActiveDate ?? '',
      streakDays: Number.isFinite(parsed.streakDays) ? parsed.streakDays : 0,
    };
  } catch {
    return { lastActiveDate: '', streakDays: 0 };
  }
}

/** Call when the child completes a learning action (e.g. opens a module). */
export async function recordLearningActivity(): Promise<number> {
  const today = dateKey();
  const yesterday = dateKey(-1);
  const current = await readStreak();

  if (current.lastActiveDate === today) {
    return Math.max(current.streakDays, 1);
  }

  const nextStreak = current.lastActiveDate === yesterday ? Math.max(current.streakDays, 0) + 1 : 1;
  const next: StreakRecord = { lastActiveDate: today, streakDays: nextStreak };
  await AsyncStorage.setItem(STREAK_STORAGE_KEY, JSON.stringify(next));
  return nextStreak;
}

export async function getLearningStreakDays(): Promise<number> {
  const today = dateKey();
  const yesterday = dateKey(-1);
  const current = await readStreak();

  if (current.lastActiveDate === today || current.lastActiveDate === yesterday) {
    return current.streakDays;
  }
  return 0;
}
