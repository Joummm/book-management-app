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
      return NextResponse.json({ error: 'Livro não encontrado' }, { status: 404 });
    }
    
    return NextResponse.json({ book: books[0] });
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
        updated_at = NOW()
      WHERE id = ${id} AND user_id = ${user.id}
      RETURNING *
    `;
    
    if (result.length === 0) {
      return NextResponse.json({ error: 'Livro não encontrado' }, { status: 404 });
    }
    
    return NextResponse.json({ book: result[0] });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro ao atualizar livro' },
      { status: 500 }
    );
  }
}

// DELETE - Remover livro
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getAuthenticatedUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }
    
    const result = await sql`
      DELETE FROM books 
      WHERE id = ${id} AND user_id = ${user.id}
      RETURNING id
    `;
    
    if (result.length === 0) {
      return NextResponse.json({ error: 'Livro não encontrado' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro ao deletar livro' },
      { status: 500 }
    );
  }
}