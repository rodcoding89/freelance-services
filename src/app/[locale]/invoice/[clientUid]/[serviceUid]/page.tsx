import InvoiceForm from "@/components/genered-bill";
import { generateSeoMetadata } from "@/utils/fonction";
import { Metadata } from "next";

interface PageProps {
  params: Promise<{ locale: string; clientId: string; serviceId: string; }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale,clientId,serviceId } = await params;
  const author = process.env.NEXT_PUBLIC_COMPANY_AUTHOR;
  const link = process.env.NEXT_PUBLIC_ROOT_LINK+'/'+locale+'/invoice/'+clientId+'/'+serviceId;
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

export default async function Home({ params }: PageProps){
  const { locale,clientId,serviceId } = await params;
  return (
    <>
      <InvoiceForm locale={locale} clientUid={clientId} serviceUid={serviceId}/>
    </>
  );
}
