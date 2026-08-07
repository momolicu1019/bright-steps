import * as Speech from 'expo-speech';

export async function speak(text: string, lang: string = 'en') {
  Speech.stop();

  // Find available voices on the device
  const availableVoices = await Speech.getAvailableVoicesAsync();

  // Look for high-quality female voices depending on the OS/language
  const selectedVoice = availableVoices.find((voice) => {
    const isTargetLang = lang === 'fil' 
      ? voice.language.startsWith('fil') || voice.language.startsWith('tl')
      : voice.language.startsWith('en');

    // Filter for common female or enhanced system voice identifiers
    const name = voice.name.toLowerCase();
    const isFemale = name.includes('female') || 
                     name.includes('samantha') || // iOS
                     name.includes('karen') ||    // iOS
                     name.includes('zira') ||     // Windows
                     name.includes('network');    // High quality Android voices

    return isTargetLang && isFemale;
  });

  Speech.speak(text, {
    language: lang === 'fil' ? 'fil-PH' : 'en-US',
    // Selected voice identifier if found on device
    voice: selectedVoice?.identifier, 
    // Slower rate for clear, exaggerated child-friendly articulation (Ms. Rachel style)
    rate: 0.55, 
    // Noticeably higher pitch (creates the warm, enthusiastic "Parentese" sound)
    pitch: 1.35, 
  });
}

export function stop() {
  Speech.stop();
}