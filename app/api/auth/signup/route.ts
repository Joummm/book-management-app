import { NextRequest, NextResponse } from 'next/server';
import { createUser } from '@/lib/auth/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json();
    
    // Validações básicas
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios' },
        { status: 400 }
      );
    }
    
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'A senha deve ter pelo menos 6 caracteres' },
        { status: 400 }
      );
    }
    
    const user = await createUser(email, password, name);
    
    return NextResponse.json({ user });
  } catch (error) {
    // Verificar se é erro de email duplicado
    const errorMessage = error instanceof Error ? error.message : 'Erro no cadastro';
    
    if (errorMessage.includes('duplicate key') || errorMessage.includes('unique constraint')) {
      return NextResponse.json(
        { error: 'Este email já está cadastrado' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 400 }
    );
  }
}