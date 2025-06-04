import Login from "@/components/login";

export default async function Page({ params }: { params: { locale: string } }){
  const { locale } = await params;
  return (
    <Login locale={locale}/>
  );
}
