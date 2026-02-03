// app/api/auth/login/route.ts
import { addClient } from '@/server/handle-database';
import { userAuth } from '@/server/services';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { clientData,service } = await req.json();
    const result = await addClient(clientData,service);
    return NextResponse.json({ success: true,result: result });
  } catch (error: any) {
    console.log("Erreur",error)
    //console.error("Erreur dans la route API de add client:", error);
    return NextResponse.json(
      { success: false, message: error },
      { status: 500,statusText:error }
    );
  }
}