// app/api/auth/login/route.ts

import { saveContract } from '@/server/handle-database';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { contract, clientId,addressId, serviceId, prestataireId,mode,from,contractId } = await req.json();
    console.log("contract route",contract)
    // Appeler l'action de serveur userAuth
    const result = await saveContract(contract,clientId,addressId, serviceId,prestataireId,mode,from,contractId);
    //console.log("result",result)
    // Si l'authentification a réussi, l'action de serveur a déjà défini le cookie.
    // Il suffit de retourner le résultat à l'interface utilisateur.
    if (result) {
      return NextResponse.json({ success: true, message: "Formulaire de contrat remplies." });
    } else {
      return NextResponse.json({ success: false, message: "Erreur lors du remplicage du formulaire de contrat." }, { status: 401 }); // 401 Unauthorized
    }

  } catch (error: any) {
    //console.error("Erreur dans la route API de save prefill contract:", error);
    return NextResponse.json(
      { success: false, message: error },
      { status: 500,statusText:error }
    );
  }
}