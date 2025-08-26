// app/api/auth/login/route.ts
import { addClient, userAuth } from '@/server/services';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { clientData } = await req.json();
    const result = await addClient(clientData);
    return NextResponse.json({ result: result });

  } catch (error: any) {
    console.error("Erreur dans la route API de add client:", error);
    return NextResponse.json(
      { success: false, message: "Une erreur interne du serveur s'est produite." },
      { status: 500 }
    );
  }
}