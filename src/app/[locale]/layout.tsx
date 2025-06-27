import type { Metadata } from "next";

import "./globals.css";
import { TranslationProvider } from "../context/translation-context";
import { AppContext, AppProvider } from "../context/app-context";
import loadLangData from "@/utils/load-lang-data";
import Header from "@/components/header";
import Footer from "@/components/footer";
import PopUp from "@/components/popup";

import CookieConsentCompo from "@/components/cookieconsent";

import Script from "next/script";
import { ShemaLdJson } from "@/utils/fonction";

export default async function RootLayout({
  children,params
}: Readonly<{
  children: React.ReactNode,params: { locale: string };
}>) {
  const { locale } = await params;
  let messages = await loadLangData({locale});
  //const {contextData} = useContext(AppContext);
  const date = new Date().getFullYear();
  const name = "RodCoding by ROD TECH SOLUTIONS"
  const pageLink = process.env.NEXT_PUBLIC_ROOT_LINK;
  const logo = pageLink+"/assets/images/logo.webp"
  const defaultSchemas = {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": name,
      "url": pageLink,
      "logo": logo
  };
  const pageSchema = await ShemaLdJson(locale)
  const schemasToRender = pageSchema 
    ? pageSchema
    : defaultSchemas;
  return (
    <html lang={locale}>
      <Script
          id={`schema`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemasToRender) }}
        />
      <body>
        <TranslationProvider locale={locale} messages={messages}><AppProvider>
          <Header locale={locale}/>
          {children}
          <PopUp locale={locale}/>
          <Footer locale={locale} date={date}/>
          </AppProvider>
        </TranslationProvider>
        <CookieConsentCompo locale={locale}/>
      </body>
    </html>
  );
}
