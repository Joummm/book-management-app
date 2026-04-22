import { NextResponse } from 'next/server';
import { sql } from '@/lib/db/client';
import { getAuthenticatedUser } from '@/lib/auth/auth';

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }
    
    // Fetch profile
    const profileResult = await sql`
      SELECT * FROM profiles WHERE id = ${user.id}
    `;
    const profile = profileResult[0];

    // Fetch earned badges
    const earnedBadges = await sql`
      SELECT b.*, ub.earned_at
      FROM badges b
      JOIN user_badges ub ON b.id = ub.badge_id
      WHERE ub.user_id = ${user.id}
    `;

    // Fetch all badges to show progress
    const allBadges = await sql`
      SELECT * FROM badges ORDER BY requirement_value ASC
    `;

    // Fetch activity history (last 10 actions)
    // We can simulate this by looking at recently updated books and reading progress
    const recentBooks = await sql`
      SELECT id, title, updated_at, 'book_update' as action_type
      FROM books
      WHERE user_id = ${user.id}
      ORDER BY updated_at DESC
      LIMIT 5
    `;

    const recentProgress = await sql`
      SELECT p.*, b.title, 'reading_progress' as action_type
      FROM reading_progress p
      JOIN books b ON p.book_id = b.id
      WHERE p.user_id = ${user.id}
      ORDER BY p.created_at DESC
      LIMIT 5
    `;

    const activity = [...recentBooks, ...recentProgress]
      .sort((a, b) => new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime())
      .slice(0, 10);

    // Fetch all reading progress for statistics
    const readingProgress = await sql`
      SELECT * FROM reading_progress 
      WHERE user_id = ${user.id} 
      ORDER BY date ASC
    `;

    return NextResponse.json({
      profile,
      earnedBadges,
      allBadges,
      activity,
      readingProgress
    });
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar perfil' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

    const body = await request.json();
    const { 
      name, 
      bio, 
      avatar_url, 
      favorite_book_id,
      reading_speed,
      notifications_enabled,
      reminder_time,
      timezone,
      language
    } = body;

    const result = await sql`
      UPDATE profiles
      SET 
        name = COALESCE(${name}, name),
        bio = COALESCE(${bio}, bio),
        avatar_url = COALESCE(${avatar_url}, avatar_url),
        favorite_book_id = COALESCE(${favorite_book_id}, favorite_book_id),
        reading_speed = COALESCE(${reading_speed}, reading_speed),
        notifications_enabled = COALESCE(${notifications_enabled}, notifications_enabled),
        reminder_time = COALESCE(${reminder_time}, reminder_time),
        timezone = COALESCE(${timezone}, timezone),
        language = COALESCE(${language}, language),
        updated_at = NOW()
      WHERE id = ${user.id}
      RETURNING *
    `;

    return NextResponse.json({ profile: result[0] });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao atualizar perfil' }, { status: 500 });
  }
}
