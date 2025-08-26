import { userLogout } from '@/server/services';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const response =  await userLogout()
  const cookieStore = await cookies()

  if (response) {
    cookieStore.delete("userAuth")
    return NextResponse.json({ response: true });
  } else {
    return NextResponse.json({ response: false });
  }
}
