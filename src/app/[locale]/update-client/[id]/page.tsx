import UpdateClient from "@/components/update-client";

export default async function Home({ params }: { params: { locale: string } }){
  const { locale } = await params;
  return (
    <UpdateClient locale={locale}/>
  );
}
