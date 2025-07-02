// app/api/auth/login/route.ts
import { saveWebConfig, userAuth } from '@/server/services';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { type,config,id } = await req.json();

    // Appeler l'action de serveur userAuth
    const result = await saveWebConfig(type,config,id);
    if (result) {
      return NextResponse.json({ success: true, message: "Enregistrement réussie." });
    } else {
      return NextResponse.json({ success: false, message: "Erreur lors de l'enregistrement." }, { status: 401 }); // 401 Unauthorized
    }

  } catch (error: any) {
    console.error("Erreur dans la route API de web config:", error);
    return NextResponse.json(
      { success: false, message: "Une erreur interne du serveur s'est produite." },
      { status: 500 }
    );
  }
}