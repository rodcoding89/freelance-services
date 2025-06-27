import Login from "@/components/login";
import { generateSeoMetadata } from "@/utils/fonction";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const { locale } = await params;
  const author = process.env.NEXT_PUBLIC_COMPANY_AUTHOR;
  const link = process.env.NEXT_PUBLIC_ROOT_LINK+'/'+locale+"/login/";
  const seoParams = {
    params:{
      locale: locale,
      page: "login",
      pageLink: link,
      pageImageLink: "",
      shouldIndex: false,
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
      <Login locale={locale}/>
    </>
  );
}
