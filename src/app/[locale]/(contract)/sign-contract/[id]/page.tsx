import GeneredContract from "@/components/genered-contract";

export default async function Page({ params }: { params: { locale: string } }){
  const { locale } = await params;
  return (
    <GeneredContract locale={locale}/>
  );
}
