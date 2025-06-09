import LegalNotice from "@/components/legal-notice";

export default async function Page({ params }: { params: { locale: string } }){
  const { locale } = await params;
  return (
    <LegalNotice locale={locale}/>
  );
}
