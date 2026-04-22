import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db/client';
import { getAuthenticatedUser } from '@/lib/auth/auth';

// GET - Buscar livro específico
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getAuthenticatedUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }
    
    const books = await sql`
      SELECT * FROM books 
      WHERE id = ${id} AND user_id = ${user.id}
    `;
    
    if (books.length === 0) {
      return NextResponse.json({ error: 'Não encontrado' }, { status: 404 });
    }

    // Buscar coleções do livro
    const collections = await sql`
      SELECT c.* 
      FROM collections c
      JOIN book_collections bc ON c.id = bc.collection_id
      WHERE bc.book_id = ${id}
    `;

    // Buscar autores do livro
    const authors = await sql`
      SELECT a.*
      FROM authors a
      JOIN book_authors ba ON a.id = ba.author_id
      WHERE ba.book_id = ${id}
    `;
    
    return NextResponse.json({ 
      book: {
        ...books[0],
        collections,
        authors
      } 
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro ao buscar livro' },
      { status: 500 }
    );
  }
}

// PUT - Atualizar livro
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getAuthenticatedUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }
    
    const body = await request.json();
    const {
      title,
      author,
      cover_image,
      rating,
      review,
      release_date,
      start_reading_date,
      finish_reading_date,
      pages,
      genres,
      publisher,
      format,
      characters,
      quotes,
      would_read_again,
      would_recommend,
      is_favorite,
      collections, // IDs das coleções
      author_ids, // IDs dos autores
    } = body;
    
    const result = await sql`
      UPDATE books SET
        title = ${title},
        author = ${author},
        cover_image = ${cover_image || null},
        rating = ${rating || null},
        review = ${review || null},
        release_date = ${release_date || null},
        start_reading_date = ${start_reading_date || null},
        finish_reading_date = ${finish_reading_date || null},
        pages = ${pages || null},
        genres = ${genres || null},
        publisher = ${publisher || null},
        format = ${format},
        characters = ${characters || null},
        quotes = ${quotes || null},
        would_read_again = ${would_read_again || null},
        would_recommend = ${would_recommend !== undefined ? would_recommend : null},
        is_favorite = ${is_favorite !== undefined ? is_favorite : false},
        updated_at = NOW()
      WHERE id = ${id} AND user_id = ${user.id}
      RETURNING *
    `;
    
    if (result.length === 0) {
      return NextResponse.json({ error: 'Livro não encontrado' }, { status: 404 });
    }

    const updatedBook = result[0];

    // Atualizar associações de coleções se fornecidas
    if (collections && Array.isArray(collections)) {
      // Remover associações existentes
      await sql`DELETE FROM book_collections WHERE book_id = ${id}`;
      
      // Adicionar novas associações
      if (collections.length > 0) {
        for (const collectionId of collections) {
          await sql`
            INSERT INTO book_collections (book_id, collection_id)
            VALUES (${id}, ${collectionId})
          `;
        }
      }
    }

    // Atualizar associações de autores se fornecidas
    if (author_ids && Array.isArray(author_ids)) {
      // Remover associações existentes
      await sql`DELETE FROM book_authors WHERE book_id = ${id}`;
      
      // Adicionar novas associações
      if (author_ids.length > 0) {
        for (const authorId of author_ids) {
          await sql`
            INSERT INTO book_authors (book_id, author_id)
            VALUES (${id}, ${authorId})
          `;
        }
      }
    }
    
    // Check for new badges
    const { checkAndGrantBadges } = await import('@/lib/gamification');
    const newBadges = await checkAndGrantBadges(user.id);
    
    return NextResponse.json({ book: updatedBook, newBadges });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro ao atualizar livro' },
      { status: 500 }
    );
  }
}

// DELETE - Remover livro
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getAuthenticatedUser();
    
    console.log(`Tentativa de eliminar livro: ${id} para utilizador: ${user?.id}`);

    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }
    
    const result = await sql`
      DELETE FROM books 
      WHERE id = ${id} AND user_id = ${user.id}
      RETURNING id
    `;
    
    if (result.length === 0) {
      console.log(`Livro não encontrado ou sem permissão: ${id}`);
      return NextResponse.json({ error: 'Livro não encontrado' }, { status: 404 });
    }
    
    console.log(`Livro eliminado com sucesso: ${id}`);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao deletar livro:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro ao deletar livro' },
      { status: 500 }
    );
  }
}
