import { I18n } from 'i18n-js';
import en from './en.json';
import fil from './fil.json';

export type AppLocale = 'en' | 'fil';

const i18n = new I18n({ en, fil });
i18n.enableFallback = true;
i18n.defaultLocale = 'en';
i18n.locale = 'en';

export function setLocale(locale: AppLocale): void {
  i18n.locale = locale;
}

export function t(key: string, options?: Record<string, unknown>): string {
  return i18n.t(key, options) as string;
}
