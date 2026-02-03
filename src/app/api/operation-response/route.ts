import { DecoderData } from '@/utils/fonction';

import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { honeypot, operation } = await req.json();
    //console.log("honeypot",honeypot,"operation",operation)
    if (honeypot) {
      return NextResponse.json({ error: 'honeypot' }, { status: 403,statusText:"honeypot" })
    }

    const cookieStore = (await cookies()).get('captcha')?.value
    console.log("cookieStore",cookieStore,"operation",operation)
    if (!operation || !cookieStore) {
      return NextResponse.json({ error: 'captcha' }, { status: 400,statusText:"captcha" })
    }

    const [result, signature] = cookieStore.split(':')
    //console.log("signature",signature,"operation",operation)

    const isOperationCorrect = DecoderData(signature)
    console.log("isOperationCorrect",isOperationCorrect,"operation",operation)
    
    if (isOperationCorrect === operation && operation === result ) {
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'captcha_incorrect' }, { status: 500,statusText:"captcha_incorrect" });
  } catch (error: any) {
    console.log("Erreur",error)
    return NextResponse.json(
      { success: false, message: "" },
      { status: 500,statusText:error }
    );
  }
}