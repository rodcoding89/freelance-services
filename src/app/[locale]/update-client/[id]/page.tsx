
import UpdateClient from "@/components/update-client";
import { generateSeoMetadata } from "@/utils/fonction";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: { locale: string,id:string } }): Promise<Metadata> {
  const { locale,id } = await params;
  const author = process.env.NEXT_PUBLIC_COMPANY_AUTHOR;
  const link = process.env.NEXT_PUBLIC_ROOT_LINK+'/'+locale+"/update-client/"+id;
  const seoParams = {
    params:{
      locale: locale,
      page: "updateClient",
      pageLink: link,
      pageImageLink: "",
      shouldIndex: false,
      siteName: "RodCoding",
      author: author ?? "RodCoding"
    }
  }
  return generateSeoMetadata(seoParams);
}

export default async function Home({ params }: { params: { locale: string,id:string } }){
  const { locale,id } = await params;
  return (
    <>
      <UpdateClient locale={locale} clientId={id}/>
    </>
  );
}
