import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Importar los archivos de traducción
import translationEN from './locales/en.json';
import translationES from './locales/es.json';

// Configuración de los recursos de idioma
const resources = {
  en: {
    translation: translationEN
  },
  es: {
    translation: translationES
  }
};

// Inicializar i18next
i18n
  .use(LanguageDetector) // Detecta el idioma del navegador
  .use(initReactI18next) // Inicializa react-i18next
  .init({
    resources,
    fallbackLng: 'es', // Idioma predeterminado
    interpolation: {
      escapeValue: false // No es necesario para React
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    }
  });

export default i18n;