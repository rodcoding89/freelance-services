// app/api/auth/login/route.ts

import { getClientList } from '@/server/handle-database';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const result = await getClientList();
    return NextResponse.json({ success: true,result: result});
  } catch (error: any) {
    console.log("Erreur",error)
    return NextResponse.json(
      { success: false, message: error },
      { status: 500,statusText:error }
    );
  }
}