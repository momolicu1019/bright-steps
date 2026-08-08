import AsyncStorage from '@react-native-async-storage/async-storage';

const WATCH_HISTORY_KEY = 'brightsteps.videoWatchHistory';

export type VideoWatchRecord = {
  videoId: string;
  lastWatchedAt: number;
  completed: boolean;
};

export async function getVideoWatchHistory(): Promise<VideoWatchRecord[]> {
  try {
    const raw = await AsyncStorage.getItem(WATCH_HISTORY_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as VideoWatchRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function recordVideoWatch(videoId: string, completed: boolean): Promise<void> {
  const history = await getVideoWatchHistory();
  const existing = history.find((entry) => entry.videoId === videoId);
  const nextRecord: VideoWatchRecord = {
    videoId,
    lastWatchedAt: Date.now(),
    completed: existing?.completed || completed,
  };
  const nextHistory = [nextRecord, ...history.filter((entry) => entry.videoId !== videoId)];
  await AsyncStorage.setItem(WATCH_HISTORY_KEY, JSON.stringify(nextHistory));
}

export async function hasWatchedVideo(videoId: string): Promise<boolean> {
  const history = await getVideoWatchHistory();
  return history.some((entry) => entry.videoId === videoId);
}
