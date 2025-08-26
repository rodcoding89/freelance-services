// app/api/auth/login/route.ts
import { addService, userAuth } from '@/server/services';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { id,serviceName,serviceType } = await req.json();

    // Appeler l'action de serveur userAuth
    const result = await addService(id,serviceName,serviceType);
    console.log("result",result)
    return NextResponse.json({ result: result });
  } catch (error: any) {
    console.error("Erreur dans la route API de add service:", error);
    return NextResponse.json(
      { success: false, message: "Une erreur interne du serveur s'est produite." },
      { status: 500 }
    );
  }
}