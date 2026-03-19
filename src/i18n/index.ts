import { I18n } from 'i18n-js';
import { getLocales } from 'expo-localization';
import { en } from './locales/en';
import { hi } from './locales/hi';

const i18n = new I18n({ en, hi });
const deviceLang = getLocales()?.[0]?.languageCode ?? 'en';
i18n.locale = deviceLang === 'hi' ? 'hi' : 'en';
i18n.defaultLocale = 'en';
i18n.enableFallback = true;

export default i18n;
