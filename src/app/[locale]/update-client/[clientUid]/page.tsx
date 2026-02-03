
import UpdateClient from "@/components/update-client";
import { generateSeoMetadata } from "@/utils/fonction";
import { Metadata } from "next";

interface PageProps {
  params: Promise<{ locale: string; clientUid:string,serviceUid:string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale,clientUid,serviceUid } = await params;
  const author = process.env.NEXT_PUBLIC_COMPANY_AUTHOR;
  const link = process.env.NEXT_PUBLIC_ROOT_LINK+'/'+locale+"/update-client/"+clientUid+"/"+serviceUid;
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

export default async function Home({ params }: PageProps){
  const { locale,clientUid,serviceUid } = await params;
  return (
    <>
      <UpdateClient locale={locale} clientUid={clientUid}/>
    </>
  );
}
