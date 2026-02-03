// app/api/auth/login/route.ts
import { fetchWebConfig } from '@/server/handle-database';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const result = await fetchWebConfig();
    console.log("result",result)
    return NextResponse.json({ success: true,result: result});

  } catch (error: any) {
    console.log("Erreur",error)
    //console.error("Erreur dans la route API de get clients list:", error);
    return NextResponse.json(
      { success: false, message: error },
      { status: 500,statusText:error }
    );
  }
}