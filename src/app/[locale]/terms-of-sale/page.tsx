
import TermsOfSale from "@/components/terms-of-sale";
import { generateSeoMetadata } from "@/utils/fonction";
import { Metadata } from "next";

interface PageProps {
  params: Promise<{ locale: string; }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const author = process.env.NEXT_PUBLIC_COMPANY_AUTHOR;
  const link = process.env.NEXT_PUBLIC_ROOT_LINK+'/'+locale+"/terms-of-sale/";
  const seoParams = {
    params:{
      locale: locale,
      page: "gts",
      pageLink: link,
      pageImageLink: "",
      shouldIndex: true,
      siteName: "RodCoding",
      author: author ?? "RodCoding"
    }
  }
  return generateSeoMetadata(seoParams);
}

export default async function Page({ params }: PageProps){
  const { locale } = await params;
  return (
    <>
      <TermsOfSale locale={locale}/>
    </>
  );
}
