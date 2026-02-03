import { NextRequest, NextResponse } from "next/server";
import { LANG_LIST } from "./constants";

const DEFAULT_LOCALE = 'en';
const SUPPORTED_LOCALES = LANG_LIST;

function getPreferredLocale(req: NextRequest): string {
  const acceptLanguage = req.headers.get('accept-language');
  if (acceptLanguage) {
    const preferredLocale = acceptLanguage.split(',')[0].split('-')[0].toLowerCase();
    if (SUPPORTED_LOCALES.includes(preferredLocale)) {
      return preferredLocale;
    }
  }
  return DEFAULT_LOCALE;
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  
  // 1. Vérifier si la route est déjà localisée
  const pathLocale = pathname.split('/')[1];
  if (SUPPORTED_LOCALES.includes(pathLocale)) {
    // La locale est déjà présente - pas de redirection nécessaire
    return NextResponse.next();
  }

  // 2. Pour la racine ou les routes sans locale
  if (pathname === '/' || !SUPPORTED_LOCALES.includes(pathLocale)) {
    const locale = getPreferredLocale(req);
    const newUrl = new URL(`/${locale}${pathname === '/' ? '' : pathname}`, req.url);
    
    // 3. Créer la réponse sans créer de boucle
    const response = NextResponse.redirect(newUrl);
    response.cookies.set("lang", locale, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)'
  ]
};