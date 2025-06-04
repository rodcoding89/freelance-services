import TermsOfServices from "@/components/terms-of-services";

export default async function Page({ params }: { params: { locale: string } }){
  const { locale } = await params;
  return (
    <TermsOfServices locale={locale}/>
  );
}
