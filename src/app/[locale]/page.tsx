import Main from "@/components/main";

export default async function Home({ params }: { params: { locale: string } }){
  const { locale } = await params;
  return (
    <Main locale={locale}/>
  );
}
