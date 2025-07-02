// app/api/auth/login/route.ts
import { deleteClient, userAuth } from '@/server/services';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(req: NextRequest) {
  try {
    const { updateClient, id } = await req.json();

    // Appeler l'action de serveur userAuth
    const result = await deleteClient(updateClient, id);
    
    if (result) {
      return NextResponse.json({ success: true, message: "Client supprimé avec succès." });
    } else {
      return NextResponse.json({ success: false, message: "Erreur lors de la suppression du client." }, { status: 401 }); // 401 Unauthorized
    }

  } catch (error: any) {
    console.error("Erreur dans la route API de delete client:", error);
    return NextResponse.json(
      { success: false, message: "Une erreur interne du serveur s'est produite." },
      { status: 500 }
    );
  }
}