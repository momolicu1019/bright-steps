
import * as Speech from 'expo-speech';
export function speak(text: string, lang: string='en'){
  Speech.speak(text, {language: lang==='fil' ? 'fil-PH' : 'en-US', rate: 0.72, pitch: 1.0});
}
export function stop(){ Speech.stop(); }
