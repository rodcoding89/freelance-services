import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { uid } = await req.json();
  const value = uid;
  console.log("value",value)
  const oneDayInSeconds = 24 * 60 * 60;
  const res = NextResponse.json({ success: true });
  const isDev = process.env.NODE_ENV === 'development';
  res.cookies.set({
      name: "userAuth",
      value: value,
      httpOnly: true,
      secure: isDev ? false : true,
      sameSite: 'strict',
      path: '/',
      maxAge: oneDayInSeconds
  });

  return res;
}
