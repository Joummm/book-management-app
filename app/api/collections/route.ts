import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db/client';
import { getAuthenticatedUser } from '@/lib/auth/auth';

// GET - Listar todas as coleções do usuário
export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }
    
    const collections = await sql`
      SELECT c.*, COUNT(bc.book_id) as books_count
      FROM collections c
      LEFT JOIN book_collections bc ON c.id = bc.collection_id
      WHERE c.user_id = ${user.id}
      GROUP BY c.id
      ORDER BY c.created_at DESC
    `;

    // Inject virtual "Favoritos" collection at the top
    const favoritesCount = await sql`
      SELECT COUNT(*) as count FROM books
      WHERE user_id = ${user.id} AND is_favorite = true
    `;

    const favoritesCollection = {
      id: 'favorites',
      user_id: user.id,
      name: 'Favoritos',
      description: 'Os seus livros favoritos',
      image_url: null,
      books_count: Number(favoritesCount[0].count),
      is_system: true,
      created_at: new Date(0).toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    return NextResponse.json({ collections: [favoritesCollection, ...collections] });
  } catch (error) {
    console.error('Erro ao buscar coleções:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar coleções' },
      { status: 500 }
    );
  }
}

// POST - Criar nova coleção
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }
    
    const body = await request.json();
    const { name, description, imageUrl, color, emoji } = body;
    
    if (!name) {
      return NextResponse.json(
        { error: 'Nome da coleção é obrigatório' },
        { status: 400 }
      );
    }
    
    const result = await sql`
      INSERT INTO collections (user_id, name, description, image_url, color, emoji, created_at, updated_at)
      VALUES (${user.id}, ${name}, ${description || null}, ${imageUrl || null}, ${color || null}, ${emoji || null}, NOW(), NOW())
      RETURNING *
    `;
    
    return NextResponse.json({ collection: result[0] }, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar coleção:', error);
    return NextResponse.json(
      { error: 'Erro ao criar coleção' },
      { status: 500 }
    );
  }
}
