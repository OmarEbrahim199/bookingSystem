import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import da from './locales/da.json';
import en from './locales/en.json';
import ar from './locales/ar.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      da: { translation: da },
      en: { translation: en },
      ar: { translation: ar }
    },
    lng: 'da',
    fallbackLng: 'da',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;