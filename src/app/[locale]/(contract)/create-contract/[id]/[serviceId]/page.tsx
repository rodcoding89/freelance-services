import Contrat from "@/components/contract";
import { generateSeoMetadata } from "@/utils/fonction";
import { Metadata } from "next";

interface PageProps {
  params: Promise<{ locale: string; id: string; serviceId: string; }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale,id,serviceId } = await params;
  const author = process.env.NEXT_PUBLIC_COMPANY_AUTHOR;
  const link = process.env.NEXT_PUBLIC_ROOT_LINK+'/'+locale+'/create-contrat/'+id+'/'+serviceId;
  const seoParams = {
    params:{
      locale: locale,
      page: "createContrat",
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
  const { locale,id,serviceId } = await params;
  return (
    <>
      <Contrat locale={locale} clientId={id} clientServiceId={serviceId}/>
    </>
  );
}
