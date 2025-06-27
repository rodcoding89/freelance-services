import InvoiceForm from "@/components/genered-bill";
import { generateSeoMetadata } from "@/utils/fonction";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: { locale: string,id:string,serviceId:string } }): Promise<Metadata> {
  const { locale,id,serviceId } = await params;
  const author = process.env.NEXT_PUBLIC_COMPANY_AUTHOR;
  const link = process.env.NEXT_PUBLIC_ROOT_LINK+'/'+locale+'/bill/'+id+'/'+serviceId;
  const seoParams = {
    params:{
      locale: locale,
      page: "invoice",
      pageLink: link,
      pageImageLink: "",
      shouldIndex: false,
      siteName: "RodCoding",
      author: author ?? "RodCoding"
    }
  }
  return generateSeoMetadata(seoParams);
}

export default async function Home({ params }: { params: { locale: string,id:string,serviceId:string } }){
  const { locale,id,serviceId } = await params;
  return (
    <>
      <InvoiceForm locale={locale} clientId={id} clientServiceId={serviceId}/>
    </>
  );
}
