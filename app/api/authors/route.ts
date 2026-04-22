import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db/client';
import { getAuthenticatedUser } from '@/lib/auth/auth';

// GET - List all authors for the user
export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    const authors = await sql`
      SELECT a.*, COUNT(ba.book_id) as books_count
      FROM authors a
      LEFT JOIN book_authors ba ON a.id = ba.author_id
      WHERE a.user_id = ${user.id}
      GROUP BY a.id
      ORDER BY a.name ASC
    `;
    
    return NextResponse.json({ authors });
  } catch (error) {
    console.error('Error fetching authors:', error);
    return NextResponse.json(
      { error: 'Error fetching authors' },
      { status: 500 }
    );
  }
}

// POST - Create new author
export async function POST(request: NextRequest) {
  try {
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
      INSERT INTO authors (
        user_id, name, bio, image_url, born_date, died_date, nationality, created_at, updated_at
      )
      VALUES (
        ${user.id}, ${name}, ${bio || null}, ${image_url || null}, 
        ${born_date || null}, ${died_date || null}, ${nationality || null}, 
        NOW(), NOW()
      )
      RETURNING *
    `;
    
    return NextResponse.json({ author: result[0] }, { status: 201 });
  } catch (error) {
    console.error('Error creating author:', error);
    return NextResponse.json(
      { error: 'Error creating author' },
      { status: 500 }
    );
  }
}
