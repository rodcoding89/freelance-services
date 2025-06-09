import ClientsList from "@/components/client-list";

export default async function Page({ params }: { params: { locale: string } }){
  const { locale } = await params;
  return (
    <ClientsList locale={locale}/>
  );
}
