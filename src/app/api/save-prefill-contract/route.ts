// app/api/auth/login/route.ts
import { savePreFillContract, userAuth } from '@/server/services';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { parsedService, clientServiceId } = await req.json();

    // Appeler l'action de serveur userAuth
    const result = await savePreFillContract(parsedService, clientServiceId);
    console.log("result",result)
    // Si l'authentification a réussi, l'action de serveur a déjà défini le cookie.
    // Il suffit de retourner le résultat à l'interface utilisateur.
    if (result) {
      return NextResponse.json({ success: true, message: "Formulaire de contrat remplies." });
    } else {
      return NextResponse.json({ success: false, message: "Erreur lors du remplicage du formulaire de contrat." }, { status: 401 }); // 401 Unauthorized
    }

  } catch (error: any) {
    console.error("Erreur dans la route API de save prefill contract:", error);
    return NextResponse.json(
      { success: false, message: "Une erreur interne du serveur s'est produite." },
      { status: 500 }
    );
  }
}