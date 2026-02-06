import "./globals.css";
import { TranslationProvider } from "../context/translation-context";
import { AppProvider } from "../context/app-context";
import loadLangData from "@/utils/load-lang-data";
import Header from "@/components/header";
import Footer from "@/components/footer";
import PopUp from "@/components/popup";

import CookieConsentCompo from "@/components/cookieconsent";
import db from '../../server/init-database'

import Script from "next/script";
import { ShemaLdJson } from "@/utils/fonction";
import { initializationDb } from "@/server/inititaliseDb";
import HandleToast from "@/components/handle-toast";

interface PageProps {
  params: Promise<{ locale: string;}>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
  children:React.ReactNode;
}

export default async function RootLayout({
  children,params
}: Readonly<PageProps>) {
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

  db.get(`SELECT * from meta`,[],async(err,row:any)=>{
    if (err) {
      console.log("Error",err.message)
      if (err.message.includes("no such table: meta")) {
        await initializationDb(db)
      }
    }else{
      if (!row) {
        await initializationDb(db);
      }else{
        console.log("Data deja present.")
      }
    }
  })

  return (
    <html lang={locale}>
      <Script
          id={`schema`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemasToRender) }}
        />
      <body>
        <TranslationProvider locale={locale} messages={messages}>
          <AppProvider>
            <Header locale={locale}/>
            {children}
            <PopUp locale={locale}/>
            <Footer locale={locale} date={date}/>
            <HandleToast locale={locale}/>
          </AppProvider>
        </TranslationProvider>
        <CookieConsentCompo locale={locale}/>
      </body>
    </html>
  );
}
