import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db/client';
import { getAuthenticatedUser } from '@/lib/auth/auth';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET - Buscar todas as coleções de um livro específico
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const user = await getAuthenticatedUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }
    
    // Verificar se o livro pertence ao usuário
    const books = await sql`
      SELECT id FROM books WHERE id = ${id} AND user_id = ${user.id}
    `;
    
    if (books.length === 0) {
      return NextResponse.json({ error: 'Livro não encontrado' }, { status: 404 });
    }
    
    const collections = await sql`
      SELECT c.* 
      FROM collections c
      JOIN book_collections bc ON c.id = bc.collection_id
      WHERE bc.book_id = ${id}
    `;
    
    return NextResponse.json({ collections });
  } catch (error) {
    console.error('Erro ao buscar coleções do livro:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar coleções do livro' },
      { status: 500 }
    );
  }
}

// POST - Adicionar livro a uma coleção
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params; // book_id
    const user = await getAuthenticatedUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }
    
    const body = await request.json();
    const { collectionId } = body;
    
    if (!collectionId) {
      return NextResponse.json(
        { error: 'ID da coleção é obrigatório' },
        { status: 400 }
      );
    }
    
    // Verificar se o livro e a coleção pertencem ao usuário
    const bookCheck = await sql`SELECT id FROM books WHERE id = ${id} AND user_id = ${user.id}`;
    const collectionCheck = await sql`SELECT id FROM collections WHERE id = ${collectionId} AND user_id = ${user.id}`;
    
    if (bookCheck.length === 0 || collectionCheck.length === 0) {
      return NextResponse.json({ error: 'Livro ou coleção não encontrados' }, { status: 404 });
    }
    
    // Adicionar à tabela de junção (usando ON CONFLICT para evitar erros se já existir)
    await sql`
      INSERT INTO book_collections (book_id, collection_id)
      VALUES (${id}, ${collectionId})
      ON CONFLICT (book_id, collection_id) DO NOTHING
    `;
    
    return NextResponse.json({ message: 'Livro adicionado à coleção' });
  } catch (error) {
    console.error('Erro ao adicionar livro à coleção:', error);
    return NextResponse.json(
      { error: 'Erro ao adicionar livro à coleção' },
      { status: 500 }
    );
  }
}

// DELETE - Remover livro de uma coleção
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params; // book_id
    const user = await getAuthenticatedUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }
    
    const { searchParams } = new URL(request.url);
    const collectionId = searchParams.get('collectionId');
    
    if (!collectionId) {
      return NextResponse.json(
        { error: 'ID da coleção é obrigatório' },
        { status: 400 }
      );
    }
    
    // Verificar se o livro pertence ao usuário
    const bookCheck = await sql`SELECT id FROM books WHERE id = ${id} AND user_id = ${user.id}`;
    
    if (bookCheck.length === 0) {
      return NextResponse.json({ error: 'Livro não encontrado' }, { status: 404 });
    }
    
    const result = await sql`
      DELETE FROM book_collections 
      WHERE book_id = ${id} AND collection_id = ${collectionId}
      RETURNING *
    `;
    
    return NextResponse.json({ message: 'Livro removido da coleção' });
  } catch (error) {
    console.error('Erro ao remover livro da coleção:', error);
    return NextResponse.json(
      { error: 'Erro ao remover livro da coleção' },
      { status: 500 }
    );
  }
}
