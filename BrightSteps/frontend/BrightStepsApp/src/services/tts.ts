
import * as Speech from 'expo-speech';
export function speak(text: string, lang: string='en'){
  Speech.stop();
  Speech.speak(text, {
    language: lang === 'fil' ? 'fil-PH' : 'en-US',
    rate: 0.66,
    pitch: lang === 'fil' ? 1.08 : 1.12,
  });
}
export function stop(){ Speech.stop(); }
