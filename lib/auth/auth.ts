import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { sql } from '@/lib/db/client';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET!;
const TOKEN_EXPIRY = '7d';

export interface User {
  id: string;
  email: string;
  name: string;
  created_at: Date;
}

// Função para criar usuário
export async function createUser(email: string, password: string, name: string) {
  const passwordHash = await bcrypt.hash(password, 10);
  
  const result = await sql`
    INSERT INTO users (email, password_hash, name)
    VALUES (${email}, ${passwordHash}, ${name})
    RETURNING id, email, name, created_at
  `;
  
  // Criar profile também
  await sql`
    INSERT INTO profiles (id, name, email)
    VALUES (${result[0].id}, ${name}, ${email})
  `;
  
  return result[0] as User;
}

// Função para login
export async function loginUser(email: string, password: string) {
  const users = await sql`
    SELECT * FROM users WHERE email = ${email}
  `;
  
  if (users.length === 0) {
    throw new Error('Usuário não encontrado');
  }
  
  const user = users[0];
  const isValid = await bcrypt.compare(password, user.password_hash);
  
  if (!isValid) {
    throw new Error('Senha inválida');
  }
  
  // Gerar token JWT
  const token = jwt.sign(
    { userId: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRY }
  );
  
  // Salvar sessão
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);
  
  await sql`
    INSERT INTO sessions (user_id, token, expires_at)
    VALUES (${user.id}, ${token}, ${expiresAt.toISOString()})
  `;
  
  return { user: user as User, token };
}

// Função para verificar token (para ser usada em API routes e middleware)
export async function verifyAuth(request?: Request) {
  try {
    const cookieStore = await cookies(); // ✅ Adicionar await
    const token = cookieStore.get('auth-token')?.value;
    
    if (!token) {
      return null;
    }
    
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    
    // Verificar se sessão existe e não expirou
    const sessions = await sql`
      SELECT * FROM sessions 
      WHERE token = ${token} AND expires_at > NOW()
    `;
    
    if (sessions.length === 0) {
      return null;
    }
    
    // Buscar usuário
    const users = await sql`
      SELECT id, email, name, created_at FROM users WHERE id = ${decoded.userId}
    `;
    
    return users[0] as User;
  } catch (error) {
    return null;
  }
}

// Função para logout
export async function logoutUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  
  if (token) {
    // Remover sessão do banco de dados
    await sql`DELETE FROM sessions WHERE token = ${token}`;
  }
  
  // Criar resposta com cookie removido
  const response = NextResponse.json({ success: true });
  
  // Remover o cookie definindo maxAge=0
  response.cookies.set('auth-token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });
  
  return response;
}

// Função para resetar senha (simplificada)
export async function resetPassword(email: string, newPassword: string) {
  const passwordHash = await bcrypt.hash(newPassword, 10);
  
  await sql`
    UPDATE users 
    SET password_hash = ${passwordHash}, updated_at = NOW()
    WHERE email = ${email}
  `;
}

// Função para verificar se o usuário está autenticado (para uso em Server Components)
export async function getAuthenticatedUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    
    if (!token) {
      return null;
    }
    
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    
    // Verificar se sessão existe e não expirou
    const sessions = await sql`
      SELECT * FROM sessions 
      WHERE token = ${token} AND expires_at > NOW()
    `;
    
    if (sessions.length === 0) {
      return null;
    }
    
    // Buscar usuário
    const users = await sql`
      SELECT id, email, name, created_at FROM users WHERE id = ${decoded.userId}
    `;
    
    return users[0] as User;
  } catch (error) {
    return null;
  }
}