// app/api/auth/login/route.ts

import { NextRequest, NextResponse } from 'next/server';

import { saveWebConfig } from '@/server/handle-database';
export async function POST(req: NextRequest) {
  try {
    const { type,config,date } = await req.json();

    // Appeler l'action de serveur userAuth
    const result = await saveWebConfig(type,config,date);
    if (result) {
      return NextResponse.json({ success: true, message: "Enregistrement réussie." });
    } else {
      return NextResponse.json({ success: false, message: "Erreur lors de l'enregistrement." }, { status: 401 }); // 401 Unauthorized
    }

  } catch (error: any) {
    //console.error("Erreur dans la route API de get clients list:", error);
    return NextResponse.json(
      { success: false, message: error },
      { status: 500,statusText:error }
    );
  }
}