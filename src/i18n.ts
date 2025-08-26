import {notFound} from 'next/navigation';
import {getRequestConfig} from 'next-intl/server';
import { LANG_LIST } from './constants';

// 1. Typez explicitement vos locales
const locales = LANG_LIST;
type Locale = typeof locales[number];

// 3. Configuration avec typage strict
export default getRequestConfig(async ({locale}) => {
  // Conversion explicite en Locale
  const typedLocale = locale as Locale;
  
  if (!locales.includes(typedLocale)) {
    notFound();
  }

  // Import dynamique avec vérification
  let messages;
  try {
    messages = (await import(`../messages/${typedLocale}.json`)).default;
  } catch (error) {
    notFound();
  }

  // Retournez l'objet avec le bon typage
  return {
    locale: typedLocale, // string garantie
    messages
  };
});