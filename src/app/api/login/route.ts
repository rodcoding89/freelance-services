// app/api/auth/login/route.ts
import { userAuth } from '@/server/services';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    // Appeler l'action de serveur userAuth
    const result = await userAuth(email, password);
    console.log("result",result)
    // Si l'authentification a réussi, l'action de serveur a déjà défini le cookie.
    // Il suffit de retourner le résultat à l'interface utilisateur.
    if (result.success) {
      return NextResponse.json({ success: true, message: "Authentification réussie." });
    } else {
      return NextResponse.json({ success: false, message: result.message }, { status: 401 }); // 401 Unauthorized
    }

  } catch (error: any) {
    console.log("Erreur",error)
    return NextResponse.json(
      { success: false, message: "Une erreur interne du serveur s'est produite." },
      { status: 500 }
    );
  }
}