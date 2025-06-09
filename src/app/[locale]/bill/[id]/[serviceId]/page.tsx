import InvoiceForm from "@/components/genered-bill";

export default async function Home({ params }: { params: { locale: string } }){
  const { locale } = await params;
  return (
    <InvoiceForm locale={locale}/>
  );
}
