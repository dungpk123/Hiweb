import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import translationEN from './locales/en/translation.json';
import translationVI from './locales/vi/translation.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    // ngon ngu mac dinh
    fallbackLng: 'vi',
    // danh sach ngon ngu duoc ho tro
    supportedLngs: ['en', 'vi'],
    
    defaultNS: 'translation',
    debug: false,
    
    detection: {
      // Thứ tự ưu tiên phát hiện ngôn ngữ
      order: ['localStorage', 'navigator', 'htmlTag'],
      // Key lưu trong localStorage
      lookupLocalStorage: 'i18nextLng',
      // Cache user language
      caches: ['localStorage'],
    },
    
    // Interpolation options
    interpolation: {
      escapeValue: false, 
    },
    
    resources: {
      en: {
        translation: translationEN,
      },
      vi: {
        translation: translationVI,
      },
    },
  });

export default i18n;