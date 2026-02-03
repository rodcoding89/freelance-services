// app/api/auth/login/route.ts
import { deleteClient } from '@/server/handle-database';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(req: NextRequest) {
  try {
    const { status, clientId } = await req.json();

    // Appeler l'action de serveur userAuth
    const result = await deleteClient(status, clientId);
    
    if (result) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ success: false }, { status: 401 }); // 401 Unauthorized
    }

  } catch (error: any) {
    console.log("Erreur",error)
    //console.error("Erreur dans la route API de delete client:", error);
    return NextResponse.json(
      { success: false, message: error },
      { status: 500,statusText:error }
    );
  }
}