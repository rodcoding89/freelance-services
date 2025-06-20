import type { Metadata } from "next";

import "./globals.css";
import { TranslationProvider } from "../context/translation-context";
import { AppContext, AppProvider } from "../context/app-context";
import loadLangData from "@/utils/load-lang-data";
import Header from "@/components/header";
import Footer from "@/components/footer";
import PopUp from "@/components/popup";
import { useContext } from "react";

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default async function RootLayout({
  children,params
}: Readonly<{
  children: React.ReactNode,params: { locale: string };
}>) {
  const { locale } = await params;
  let messages = await loadLangData({locale});
  //const {contextData} = useContext(AppContext);
  const date = new Date().getFullYear();
  return (
    <html lang={locale}>
      <body>
        <TranslationProvider locale={locale} messages={messages}><AppProvider>
          <Header locale={locale}/>
          {children}
          <PopUp locale={locale}/>
          <Footer locale={locale} date={date}/>
          </AppProvider>
        </TranslationProvider>
      </body>
    </html>
  );
}
