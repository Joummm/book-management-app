import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db/client';
import { getAuthenticatedUser } from '@/lib/auth/auth';

// GET - Get author details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getAuthenticatedUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    const authors = await sql`
      SELECT a.*, (
        SELECT json_agg(b.*)
        FROM books b
        JOIN book_authors ba ON b.id = ba.book_id
        WHERE ba.author_id = a.id
      ) as books
      FROM authors a
      WHERE a.id = ${id} AND a.user_id = ${user.id}
    `;
    
    if (authors.length === 0) {
      return NextResponse.json({ error: 'Author not found' }, { status: 404 });
    }
    
    return NextResponse.json({ author: authors[0] });
  } catch (error) {
    console.error('Error fetching author:', error);
    return NextResponse.json(
      { error: 'Error fetching author' },
      { status: 500 }
    );
  }
}

// PUT - Update author
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getAuthenticatedUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    const body = await request.json();
    const { name, bio, image_url, born_date, died_date, nationality } = body;
    
    if (!name) {
      return NextResponse.json(
        { error: 'Author name is required' },
        { status: 400 }
      );
    }
    
    const result = await sql`
      UPDATE authors
      SET 
        name = ${name},
        bio = ${bio || null},
        image_url = ${image_url || null},
        born_date = ${born_date || null},
        died_date = ${died_date || null},
        nationality = ${nationality || null},
        updated_at = NOW()
      WHERE id = ${id} AND user_id = ${user.id}
      RETURNING *
    `;
    
    if (result.length === 0) {
      return NextResponse.json({ error: 'Author not found' }, { status: 404 });
    }
    
    return NextResponse.json({ author: result[0] });
  } catch (error) {
    console.error('Error updating author:', error);
    return NextResponse.json(
      { error: 'Error updating author' },
      { status: 500 }
    );
  }
}

// DELETE - Delete author
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getAuthenticatedUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    const result = await sql`
      DELETE FROM authors
      WHERE id = ${id} AND user_id = ${user.id}
      RETURNING *
    `;
    
    if (result.length === 0) {
      return NextResponse.json({ error: 'Author not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting author:', error);
    return NextResponse.json(
      { error: 'Error deleting author' },
      { status: 500 }
    );
  }
}
