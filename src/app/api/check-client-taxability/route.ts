// app/api/auth/login/route.ts
import { checkClientTaxability, userAuth } from '@/server/services';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { juridiction } = await req.json();

    // Appeler l'action de serveur userAuth
    const result = await checkClientTaxability(juridiction);
    if (result) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ success: false }, { status: 401 }); // 401 Unauthorized
    }

  } catch (error: any) {
    console.error("Erreur dans la route API de check client taxability:", error);
    return NextResponse.json(
      { success: false, message: "Une erreur interne du serveur s'est produite." },
      { status: 500 }
    );
  }
}