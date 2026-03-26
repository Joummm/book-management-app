import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth/auth';

export async function GET() {
  const user = await getAuthenticatedUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }
  
  return NextResponse.json({ user });
}