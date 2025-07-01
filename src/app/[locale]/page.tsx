import Main from "@/components/main";
import { generateSeoMetadata } from "@/utils/fonction";
import { Metadata } from "next";

interface PageProps {
  params: Promise<{ locale: string; }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const author = process.env.NEXT_PUBLIC_COMPANY_AUTHOR;
  const link = process.env.NEXT_PUBLIC_ROOT_LINK+'/'+locale;
  const seoParams = {
    params:{
      locale: locale,
      page: "index",
      pageLink: link,
      pageImageLink: "",
      shouldIndex: true,
      siteName: "RodCoding",
      author: author ?? "RodCoding"
    }
  }
  return generateSeoMetadata(seoParams);
}

export default async function Home({ params }: PageProps){
  const { locale } = await params;
  return (
    <>
      <Main locale={locale}/>
    </>
  );
}
