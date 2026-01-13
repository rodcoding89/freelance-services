import GeneredContract from "@/components/genered-contract";
import { generateSeoMetadata } from "@/utils/fonction";
import { Metadata } from "next";

interface PageProps {
  params: Promise<{ locale: string; clientId: string; serviceId: string; }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale,clientId,serviceId } = await params;
  const author = process.env.NEXT_PUBLIC_COMPANY_AUTHOR;
  const link = process.env.NEXT_PUBLIC_ROOT_LINK+'/'+locale+'/sign-contrat/'+clientId+'/'+serviceId;
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
  const { locale,clientId,serviceId } = await params;
  return (
    <>
      <GeneredContract locale={locale} clientId={parseInt(clientId)} clientServiceId={serviceId}/>
    </>
  );
}
