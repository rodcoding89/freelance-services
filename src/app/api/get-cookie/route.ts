import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const cookieName = url.searchParams.get('cookieName');
  const cookieStore = await cookies()
  if (!cookieName) {
    return NextResponse.json({ error: 'cookieName parameter is required' }, { status: 400 });
  }

  // Récupérer la valeur du cookie côté serveur
  const cookieValue = cookieStore.get(cookieName)?.value ?? null;
  //console.log("cookieValue",cookieValue,"cookieName",cookieName)
  return NextResponse.json({ cookieValue });
}
