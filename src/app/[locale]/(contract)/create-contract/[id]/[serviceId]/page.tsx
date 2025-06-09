import Contrat from "@/components/contract";

export default async function Page({ params }: { params: { locale: string } }){
  const { locale } = await params;
  return (
    <Contrat locale={locale}/>
  );
}
