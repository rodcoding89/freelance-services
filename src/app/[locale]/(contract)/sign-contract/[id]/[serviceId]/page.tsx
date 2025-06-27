import GeneredContract from "@/components/genered-contract";
import { generateSeoMetadata } from "@/utils/fonction";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: { locale: string,id:string,serviceId:string } }): Promise<Metadata> {
  const { locale,id,serviceId } = await params;
  const author = process.env.NEXT_PUBLIC_COMPANY_AUTHOR;
  const link = process.env.NEXT_PUBLIC_ROOT_LINK+'/'+locale+'/sign-contrat/'+id+'/'+serviceId;
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

export default async function Page({ params }: { params: { locale: string,id:string,serviceId:string } }){
  const { locale,id,serviceId } = await params;
  return (
    <>
      <GeneredContract locale={locale} clientId={id} clientServiceId={serviceId}/>
    </>
  );
}
