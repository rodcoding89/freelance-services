// app/api/auth/login/route.ts
import { updateClient } from '@/server/handle-database';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(req: NextRequest) {
  try {
    const { clientData,serviceData } = await req.json();

    // Appeler l'action de serveur userAuth
    const result = await updateClient(clientData,serviceData);
    console.log("result",result)
    if (result) {
      return NextResponse.json({ success: true, message: "Mise a jour réussie." });
    } else {
      return NextResponse.json({ success: false, message: "Erreur lors de la mise a jour." }, { status: 401 }); // 401 Unauthorized
    }

  } catch (error: any) {
    console.log("Erreur",error)
    return NextResponse.json(
      { success: false, message: error },
      { status: 500,statusText:error }
    );
  }
}