import bcrypt from 'bcryptjs';
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

    const salt = await bcrypt.genSalt(10);
    const signature = await bcrypt.hash(result.toString(), salt);

    res.cookies.set('captcha', `${result}:${signature}`, {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      path: '/'
    })

    return res;
  } catch (error: any) {
    //console.error("Erreur dans la route API de add client:", error);
    return NextResponse.json(
      { success: false, message: "" },
      { status: 500,statusText:error }
    );
  }
}