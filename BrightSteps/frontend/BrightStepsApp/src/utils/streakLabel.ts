import { t } from '../i18n';

export function streakLabel(streakDays: number): string {
  if (streakDays > 0) {
    return t('child.streak', { count: streakDays });
  }
  return t('child.streakStart');
}
