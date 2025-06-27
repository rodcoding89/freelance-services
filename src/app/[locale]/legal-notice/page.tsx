import LegalNotice from "@/components/legal-notice";
import { generateSeoMetadata } from "@/utils/fonction";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const { locale } = await params;
  const author = process.env.NEXT_PUBLIC_COMPANY_AUTHOR;
  const link = process.env.NEXT_PUBLIC_ROOT_LINK+'/'+locale+"/legal-notice/";
  const seoParams = {
    params:{
      locale: locale,
      page: "legalNotice",
      pageLink: link,
      pageImageLink: "",
      shouldIndex: true,
      siteName: "RodCoding",
      author: author ?? "RodCoding"
    }
  }
  return generateSeoMetadata(seoParams);
}

export default async function Page({ params }: { params: { locale: string } }){
  const { locale } = await params;
  return (
    <>
      <LegalNotice locale={locale}/>
    </>
  );
}
