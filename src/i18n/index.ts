import { uz, type TranslationKeys } from './uz';
import { ru } from './ru';
import type { Language } from '../types';

export type { TranslationKeys };
export const translations = { uz, ru };

export function getTranslations(lang: Language) {
  return translations[lang] ?? uz;
}
