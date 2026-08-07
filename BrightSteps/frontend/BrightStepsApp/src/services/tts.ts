import * as Speech from 'expo-speech';

const ENGLISH_FEMALE_HINTS = ['samantha', 'karen', 'zira', 'aria', 'eva', 'female'];
const FILIPINO_HINTS = ['fil', 'tl'];
let availableVoicesPromise: Promise<Speech.Voice[]> | null = null;
const cachedVoiceIds: Record<string, string | undefined> = {};

function normalizeLangKey(lang: string): 'fil' | 'en' {
  const loweredLang = lang.toLowerCase();
  return loweredLang === 'fil' || loweredLang.startsWith('tl') ? 'fil' : 'en';
}

function pickVoiceIdentifier(voices: Speech.Voice[], lang: string): string | undefined {
  const isFilipino = normalizeLangKey(lang) === 'fil';

  const languageMatches = voices.filter((voice) => {
    const voiceLang = voice.language.toLowerCase();
    return isFilipino ? FILIPINO_HINTS.some((hint) => voiceLang.startsWith(hint)) : voiceLang.startsWith('en');
  });

  if (!languageMatches.length) {
    return undefined;
  }

  if (!isFilipino) {
    // Prefer known female voices in a stable priority order for English.
    for (const hint of ENGLISH_FEMALE_HINTS) {
      const found = languageMatches.find((voice) => voice.name.toLowerCase().includes(hint));
      if (found) {
        return found.identifier;
      }
    }
  }

  // Fallback to first available voice for the target language.
  return languageMatches[0]?.identifier;
}

async function getCachedVoiceIdentifier(lang: string): Promise<string | undefined> {
  const langKey = normalizeLangKey(lang);
  if (Object.prototype.hasOwnProperty.call(cachedVoiceIds, langKey)) {
    return cachedVoiceIds[langKey];
  }

  if (!availableVoicesPromise) {
    availableVoicesPromise = Speech.getAvailableVoicesAsync().catch(() => []);
  }

  const availableVoices = await availableVoicesPromise;
  const selectedVoiceId = pickVoiceIdentifier(availableVoices, langKey);
  cachedVoiceIds[langKey] = selectedVoiceId;
  return selectedVoiceId;
}

export async function speak(text: string, lang: string = 'en') {
  Speech.stop();

  const selectedVoiceId = await getCachedVoiceIdentifier(lang);

  Speech.speak(text, {
    language: lang === 'fil' ? 'fil-PH' : 'en-US',
    // Preferred voice identifier if found on device
    voice: selectedVoiceId,
    // Slower rate for clear, exaggerated child-friendly articulation (Ms. Rachel style)
    rate: 0.55,
    // Noticeably higher pitch (creates the warm, enthusiastic "Parentese" sound)
    pitch: 1.35,
  });
}

export function stop() {
  Speech.stop();
}