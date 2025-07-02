// app/api/auth/login/route.ts
import { deleteService, userAuth } from '@/server/services';
import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(req: NextRequest) {
  try {
    const serviceId = req.nextUrl.searchParams.get("serviceId") ?? "";

    const result = await deleteService(serviceId);
    if (result) {
      return NextResponse.json({ success: true, message: "Service supprimé avec succès." });
    } else {
      return NextResponse.json({ success: false, message: "Erreur lors de la suppression du service." }, { status: 401 }); // 401 Unauthorized
    }

  } catch (error: any) {
    console.error("Erreur dans la route API de delete service:", error);
    return NextResponse.json(
      { success: false, message: "Une erreur interne du serveur s'est produite." },
      { status: 500 }
    );
  }
}