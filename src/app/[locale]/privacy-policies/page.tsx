import PrivacyPolicies from "@/components/privacis-policies";

export default async function Page({ params }: { params: { locale: string } }){
  const { locale } = await params;
  return (
    <PrivacyPolicies locale={locale}/>
  );
}
