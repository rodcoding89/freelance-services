import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpBackend from 'i18next-http-backend';

i18n
.use(HttpBackend)
  .use(initReactI18next)
  .init({
    lng: 'en',
    fallbackLng: 'en',
    keySeparator: false,
    interpolation: {
      escapeValue: false,
    },
    backend: {
        loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
});