import * as FileSystem from 'expo-file-system';

const CACHE_DIR = `${FileSystem.documentDirectory ?? ''}sped_videos/`;

type CacheIndex = Record<string, string>;

async function ensureCacheDir(): Promise<void> {
  const info = await FileSystem.getInfoAsync(CACHE_DIR);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(CACHE_DIR, { intermediates: true });
  }
}

async function readCacheIndex(): Promise<CacheIndex> {
  try {
    const raw = await FileSystem.readAsStringAsync(`${CACHE_DIR}index.json`);
    return JSON.parse(raw) as CacheIndex;
  } catch {
    return {};
  }
}

async function writeCacheIndex(index: CacheIndex): Promise<void> {
  await ensureCacheDir();
  await FileSystem.writeAsStringAsync(`${CACHE_DIR}index.json`, JSON.stringify(index));
}

export async function getCachedVideoUri(videoId: string): Promise<string | null> {
  const index = await readCacheIndex();
  const uri = index[videoId];
  if (!uri) {
    return null;
  }
  const info = await FileSystem.getInfoAsync(uri);
  return info.exists ? uri : null;
}

export async function isVideoCachedOnDevice(videoId: string): Promise<boolean> {
  return (await getCachedVideoUri(videoId)) !== null;
}

/** Downloads a direct MP4 URL you control — not a YouTube watch link. */
export async function cacheVideoFromUrl(videoId: string, downloadUrl: string): Promise<string> {
  await ensureCacheDir();
  const target = `${CACHE_DIR}${videoId}.mp4`;
  const existing = await FileSystem.getInfoAsync(target);
  if (existing.exists) {
    const index = await readCacheIndex();
    index[videoId] = target;
    await writeCacheIndex(index);
    return target;
  }

  const result = await FileSystem.downloadAsync(downloadUrl, target);
  const index = await readCacheIndex();
  index[videoId] = result.uri;
  await writeCacheIndex(index);
  return result.uri;
}
