// app/api/auth/login/route.ts

import { getContratClientAndService } from '@/server/handle-database';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const clientId = req.nextUrl.searchParams.get("clientId") ?? "";
    const serviceId = req.nextUrl.searchParams.get("serviceId") ?? "";
    const prestataireId = req.nextUrl.searchParams.get("prestataireId") ?? "";

    const result = await getContratClientAndService(clientId, serviceId,prestataireId);
    console.log("result",result)
    return NextResponse.json({ success: true,result: result});
  } catch (error: any) {
    console.log("Erreur",error)
    return NextResponse.json(
      { success: false, message: error },
      { status: 500,statusText:error }
    );
  }
}