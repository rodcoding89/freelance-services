import CreateClient from "@/components/create-client";
import { generateSeoMetadata } from "@/utils/fonction";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const { locale } = await params;
  const author = process.env.NEXT_PUBLIC_COMPANY_AUTHOR;
  const link = process.env.NEXT_PUBLIC_ROOT_LINK+'/'+locale+"/create-client/";
  const seoParams = {
    params:{
      locale: locale,
      page: "createClient",
      pageLink: link,
      pageImageLink: "",
      shouldIndex: false,
      siteName: "RodCoding",
      author: author ?? "RodCoding"
    }
  }
  return generateSeoMetadata(seoParams);
}

export default async function Home({ params }: { params: { locale: string } }){
  const { locale } = await params;
  return (
    <>
      <CreateClient locale={locale}/>
    </>
  );
}
