import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db/client';
import { getAuthenticatedUser } from '@/lib/auth/auth';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET - Buscar uma coleção específica e seus livros
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const user = await getAuthenticatedUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    // Virtual "Favoritos" collection
    if (id === 'favorites') {
      const books = await sql`
        SELECT b.*,
          COALESCE(
            (SELECT json_agg(a.*)
             FROM authors a
             JOIN book_authors ba ON a.id = ba.author_id
             WHERE ba.book_id = b.id),
            '[]'::json
          ) as authors
        FROM books b
        WHERE b.user_id = ${user.id} AND b.is_favorite = true
        ORDER BY b.created_at DESC
      `;

      const favoritesCollection = {
        id: 'favorites',
        user_id: user.id,
        name: 'Favoritos',
        description: 'Os seus livros favoritos',
        image_url: null,
        books_count: books.length,
        is_system: true,
      };

      return NextResponse.json({ collection: favoritesCollection, books });
    }
    
    const collections = await sql`
      SELECT * FROM collections 
      WHERE id = ${id} AND user_id = ${user.id}
    `;
    
    if (collections.length === 0) {
      return NextResponse.json({ error: 'Coleção não encontrada' }, { status: 404 });
    }
    
    // Buscar livros nesta coleção
    const books = await sql`
      SELECT b.*,
        COALESCE(
          (SELECT json_agg(a.*)
           FROM authors a
           JOIN book_authors ba ON a.id = ba.author_id
           WHERE ba.book_id = b.id),
          '[]'::json
        ) as authors
      FROM books b
      JOIN book_collections bc ON b.id = bc.book_id
      WHERE bc.collection_id = ${id} AND b.user_id = ${user.id}
      ORDER BY b.created_at DESC
    `;
    
    return NextResponse.json({ collection: collections[0], books });
  } catch (error) {
    console.error('Erro ao buscar detalhes da coleção:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar detalhes da coleção' },
      { status: 500 }
    );
  }
}

// PUT - Atualizar coleção
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    
    if (id === 'favorites') {
      return NextResponse.json({ error: 'A coleção Favoritos não pode ser editada' }, { status: 403 });
    }

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
      UPDATE collections 
      SET 
        name = ${name}, 
        description = ${description || null}, 
        image_url = ${imageUrl || null},
        color = ${color || null},
        emoji = ${emoji || null},
        updated_at = NOW()
      WHERE id = ${id} AND user_id = ${user.id}
      RETURNING *
    `;
    
    if (result.length === 0) {
      return NextResponse.json({ error: 'Coleção não encontrada' }, { status: 404 });
    }
    
    return NextResponse.json({ collection: result[0] });
  } catch (error) {
    console.error('Erro ao atualizar coleção:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar coleção' },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar coleção
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    if (id === 'favorites') {
      return NextResponse.json({ error: 'A coleção Favoritos não pode ser removida' }, { status: 403 });
    }

    const user = await getAuthenticatedUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }
    
    const result = await sql`
      DELETE FROM collections 
      WHERE id = ${id} AND user_id = ${user.id}
      RETURNING *
    `;
    
    if (result.length === 0) {
      return NextResponse.json({ error: 'Coleção não encontrada' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Coleção eliminada com sucesso' });
  } catch (error) {
    console.error('Erro ao eliminar coleção:', error);
    return NextResponse.json(
      { error: 'Erro ao eliminar coleção' },
      { status: 500 }
    );
  }
}
