import { NextResponse } from 'next/server';
import { logoutUser } from '@/lib/auth/auth';

export async function POST() {
  try {
    const response = await logoutUser();
    return response;
  } catch (error) {
    console.error('Erro no logout:', error);
    return NextResponse.json(
      { error: 'Erro ao fazer logout' },
      { status: 500 }
    );
  }
}