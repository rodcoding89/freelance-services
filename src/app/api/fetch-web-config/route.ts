// app/api/auth/login/route.ts
import { fetchWebConfig, userAuth } from '@/server/services';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const result = await fetchWebConfig();
    console.log("result",result)
    return NextResponse.json({ result: result});

  } catch (error: any) {
    console.error("Erreur dans la route API de login:", error);
    return NextResponse.json(
      { success: false, message: "Une erreur interne du serveur s'est produite." },
      { status: 500 }
    );
  }
}