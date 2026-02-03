import { EnCoder } from '@/utils/fonction';

import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {

    const number1 = Math.floor(Math.random() * 9) + 1;
    const number2 = Math.floor(Math.random() * 9) + 1;

    const result = number1 + number2

    const res = NextResponse.json({
      question: `${number1} + ${number2} ?`,
      success: true
    })

    const signature = EnCoder("string",result.toString())

    res.cookies.set('captcha', `${result}:${signature}`, {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      path: '/'
    })
    console.log("signature",signature)
    return res;
  } catch (error: any) {
    console.log("Erreur",error)
    return NextResponse.json(
      { success: false, message: "" },
      { status: 500,statusText:error }
    );
  }
}