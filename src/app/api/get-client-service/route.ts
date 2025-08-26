// app/api/auth/login/route.ts
import { getClientAndService, userAuth } from '@/server/services';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const clientId = req.nextUrl.searchParams.get("clientId") ?? "";
    const serviceId = req.nextUrl.searchParams.get("serviceId") ?? "";

    const result = await getClientAndService(clientId, serviceId);
    return NextResponse.json({ result: result});
  } catch (error: any) {
    console.error("Erreur dans la route API de client service:", error);
    return NextResponse.json(
      { success: false, message: "Une erreur interne du serveur s'est produite." },
      { status: 500 }
    );
  }
}