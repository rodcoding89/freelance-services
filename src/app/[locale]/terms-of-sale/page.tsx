import TermsOfSale from "@/components/terms-of-sale";

export default async function Page({ params }: { params: { locale: string } }){
  const { locale } = await params;
  return (
    <TermsOfSale locale={locale}/>
  );
}
