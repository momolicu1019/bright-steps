import { I18n } from 'i18n-js';
import en from './en.json';
import fil from './fil.json';

export type AppLocale = 'en' | 'fil';

type TranslationTree = Record<string, unknown>;

function expandDotNotation(input: Record<string, string>): TranslationTree {
  const output: TranslationTree = {};

  for (const [rawKey, value] of Object.entries(input)) {
    const parts = rawKey.split('.');
    let current: TranslationTree = output;

    for (let i = 0; i < parts.length; i += 1) {
      const part = parts[i];
      const isLeaf = i === parts.length - 1;

      if (isLeaf) {
        current[part] = value;
      } else {
        const existing = current[part];
        if (typeof existing !== 'object' || existing === null || Array.isArray(existing)) {
          current[part] = {};
        }
        current = current[part] as TranslationTree;
      }
    }
  }

  return output;
}

const i18n = new I18n({
  en: expandDotNotation(en as Record<string, string>),
  fil: expandDotNotation(fil as Record<string, string>),
});
i18n.enableFallback = true;
i18n.defaultLocale = 'en';
i18n.locale = 'en';

export function setLocale(locale: AppLocale): void {
  i18n.locale = locale;
}

export function t(key: string, options?: Record<string, unknown>): string {
  return i18n.t(key, options) as string;
}
