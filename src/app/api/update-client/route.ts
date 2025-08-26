// app/api/auth/login/route.ts
import { updateClient, userAuth } from '@/server/services';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(req: NextRequest) {
  try {
    const { clientData, clientId } = await req.json();

    // Appeler l'action de serveur userAuth
    const result = await updateClient(clientData, clientId);
    console.log("result",result)
    if (result) {
      return NextResponse.json({ success: true, message: "Mise a jour réussie." });
    } else {
      return NextResponse.json({ success: false, message: "Erreur lors de la mise a jour." }, { status: 401 }); // 401 Unauthorized
    }

  } catch (error: any) {
    console.error("Erreur dans la route API de update client:", error);
    return NextResponse.json(
      { success: false, message: "Une erreur interne du serveur s'est produite." },
      { status: 500 }
    );
  }
}