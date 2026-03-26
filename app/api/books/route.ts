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
    } = body;
    
    if (!title || !author) {
      return NextResponse.json(
        { error: 'Título e autor são obrigatórios' },
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
    
    return NextResponse.json({ book: result[0] }, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar livro:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro ao criar livro' },
      { status: 500 }
    );
  }
}