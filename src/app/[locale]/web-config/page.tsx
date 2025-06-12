import WebConfig from "@/components/web-config";

export default async function Page({ params }: { params: { locale: string } }){
  const { locale } = await params;
  return (
    <WebConfig locale={locale}/>
  );
}
