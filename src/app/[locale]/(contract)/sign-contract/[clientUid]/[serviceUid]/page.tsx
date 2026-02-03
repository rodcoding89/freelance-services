import GeneredContract from "@/components/genered-contract";
import { generateSeoMetadata } from "@/utils/fonction";
import { Metadata } from "next";

interface PageProps {
  params: Promise<{ locale: string; clientUid: string; serviceUid: string; }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale,clientUid,serviceUid } = await params;
  const author = process.env.NEXT_PUBLIC_COMPANY_AUTHOR;
  const link = process.env.NEXT_PUBLIC_ROOT_LINK+'/'+locale+'/sign-contrat/'+clientUid+'/'+serviceUid;
  const seoParams = {
    params:{
      locale: locale,
      page: "signContract",
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
  const { locale,clientUid,serviceUid } = await params;
  return (
    <>
      <GeneredContract locale={locale} clientUid={clientUid} serviceUid={serviceUid}/>
    </>
  );
}
