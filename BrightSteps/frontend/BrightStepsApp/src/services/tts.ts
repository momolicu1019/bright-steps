import * as Speech from 'expo-speech';

const ENGLISH_FEMALE_HINTS = ['samantha', 'karen', 'zira', 'aria', 'eva', 'female'];
const FILIPINO_HINTS = ['fil', 'tl'];

function pickVoiceIdentifier(voices: Speech.Voice[], lang: string): string | undefined {
  const loweredLang = lang.toLowerCase();
  const isFilipino = loweredLang === 'fil' || loweredLang.startsWith('tl');

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

export async function speak(text: string, lang: string = 'en') {
  Speech.stop();

  // Find available voices on the device
  const availableVoices = await Speech.getAvailableVoicesAsync();
  const selectedVoiceId = pickVoiceIdentifier(availableVoices, lang);

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