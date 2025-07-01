
import WebConfig from "@/components/web-config";
import { generateSeoMetadata } from "@/utils/fonction";
import { Metadata } from "next";

interface PageProps {
  params: Promise<{ locale: string;}>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const author = process.env.NEXT_PUBLIC_COMPANY_AUTHOR;
  const link = process.env.NEXT_PUBLIC_ROOT_LINK+'/'+locale+"/web-config/";
  const seoParams = {
    params:{
      locale: locale,
      page: "webConfig",
      pageLink: link,
      pageImageLink: "",
      shouldIndex: false,
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
      <WebConfig locale={locale}/>
    </>
  );
}
