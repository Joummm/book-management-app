import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db/client';
import { getAuthenticatedUser } from '@/lib/auth/auth';

// POST - Criar novo livro
export async function POST(request: NextRequest) {
  try {
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
      collections, // IDs das coleções
      author_ids, // IDs dos autores selecionados
    } = body;
    
    if (!title) {
      return NextResponse.json(
        { error: 'O título é obrigatório' },
        { status: 400 }
      );
    }
    
    const result = await sql`
      INSERT INTO books (
        user_id, title, author, cover_image, rating, review,
        release_date, start_reading_date, finish_reading_date, pages,
        genres, publisher, format, characters, quotes, would_read_again,
        would_recommend, created_at, updated_at
      ) VALUES (
        ${user.id}, ${title}, ${author}, ${cover_image || null}, 
        ${rating || null}, ${review || null}, ${release_date || null},
        ${start_reading_date || null}, ${finish_reading_date || null},
        ${pages || null}, ${genres || null}, ${publisher || null},
        ${format}, ${characters || null}, ${quotes || null},
        ${would_read_again || null}, ${would_recommend !== undefined ? would_recommend : null},
        NOW(), NOW()
      )
      RETURNING *
    `;
    
    const book = result[0];

    // Associar coleções se fornecidas
    if (collections && Array.isArray(collections) && collections.length > 0) {
      for (const collectionId of collections) {
        await sql`
          INSERT INTO book_collections (book_id, collection_id)
          VALUES (${book.id}, ${collectionId})
          ON CONFLICT DO NOTHING
        `;
      }
    }

    // Associar autores se fornecidos
    if (author_ids && Array.isArray(author_ids) && author_ids.length > 0) {
      for (const authorId of author_ids) {
        await sql`
          INSERT INTO book_authors (book_id, author_id)
          VALUES (${book.id}, ${authorId})
          ON CONFLICT DO NOTHING
        `;
      }
    }
    
    return NextResponse.json({ book }, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar livro:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro ao criar livro' },
      { status: 500 }
    );
  }
}

// GET - Listar livros do utilizador
export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }
    
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
      WHERE b.user_id = ${user.id}
      ORDER BY b.created_at DESC
    `;
    
    return NextResponse.json({ books });
  } catch (error) {
    console.error('Erro ao listar livros:', error);
    return NextResponse.json(
      { error: 'Erro ao carregar livros' },
      { status: 500 }
    );
  }
}