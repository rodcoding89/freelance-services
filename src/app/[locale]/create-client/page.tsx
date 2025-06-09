import CreateClient from "@/components/create-client";

export default async function Home({ params }: { params: { locale: string } }){
  const { locale } = await params;
  return (
    <CreateClient locale={locale}/>
  );
}
