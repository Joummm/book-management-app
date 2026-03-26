import { NextRequest, NextResponse } from 'next/server';
import { loginUser } from '@/lib/auth/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    
    const { user, token } = await loginUser(email, password);
    
    const response = NextResponse.json({ user });
    
    // Set cookie com configurações corretas
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });
    
    return response;
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro no login' },
      { status: 400 }
    );
  }
}