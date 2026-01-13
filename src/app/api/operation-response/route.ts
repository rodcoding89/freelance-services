import bcrypt from 'bcryptjs';
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
    console.log("cookie",cookieStore,"operation",operation)

    if (!operation || !cookieStore) {
      return NextResponse.json({ error: 'captcha' }, { status: 400,statusText:"captcha" })
    }

    const [result, signature] = cookieStore.split(':')

    const isOperationCorrect = await bcrypt.compare(operation, signature);
    
    if (isOperationCorrect) {
      const cookieStore = await cookies()
      cookieStore.delete("captcha")
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'captcha_incorrect' }, { status: 400,statusText:"captcha_incorrect" });
  } catch (error: any) {
    //console.error("Erreur dans la route API de add client:", error);
    return NextResponse.json(
      { success: false, message: "" },
      { status: 500,statusText:error }
    );
  }
}