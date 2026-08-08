
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { MODULES } from '../constants/activities';

// ONE repo, TWO runtimes: backend in cloud, frontend offline-first in APK
const API_URL = Constants.expoConfig?.extra?.apiUrl || 'http://192.168.1.5:8000/api';
const OFFLINE = Constants.expoConfig?.extra?.offlineMode ?? true;

function bundledActivitiesForModule(module: string): string[] {
  return MODULES.find((moduleItem) => moduleItem.key === module)?.tasks ?? [];
}

export async function getActivitiesOffline(module: string){
  // 1. Try local cache first (works inside APK without internet)
  const cached = await AsyncStorage.getItem(`activities_${module}`);
  if(cached && OFFLINE){
    return JSON.parse(cached);
  }
  // 2. If online, fetch from FastAPI cloud
  try {
    const res = await fetch(`${API_URL}/activities?module=${module}`);
    if (!res.ok) {
      throw new Error(`Activities fetch failed: ${res.status}`);
    }
    const data = await res.json();
    await AsyncStorage.setItem(`activities_${module}`, JSON.stringify(data));
    return data;
  } catch(e){
    // 3. Fallback to bundled seed data
    console.log('Offline mode - using bundled activities');
    return bundledActivitiesForModule(module);
  }
}

export async function logProgressOffline(data: any){
  // Save locally always - this is what makes APK standalone
  const queue = JSON.parse(await AsyncStorage.getItem('progress_queue') || '[]');
  queue.push({...data, timestamp: Date.now()});
  await AsyncStorage.setItem('progress_queue', JSON.stringify(queue));

  // Try sync if online
  try {
    await fetch(`${API_URL}/progress/`, {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(data)});
  } catch {}
  return {logged:true, offline: true};
}
