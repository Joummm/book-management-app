import { NextResponse } from "next/server";
import { sql } from "@/lib/db/client";
import { getAuthenticatedUser } from "@/lib/auth/auth";

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { bookId, pagesRead, durationMinutes, date } = await request.json();

    if (!bookId || typeof pagesRead !== "number") {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    const targetDate = date || new Date().toISOString().split('T')[0];
    const duration = durationMinutes || 0;

    // Accumulate values instead of overwriting
    await sql`
      INSERT INTO reading_progress (user_id, book_id, date, pages_read, duration_minutes)
      VALUES (${user.id}, ${bookId}, ${targetDate}, ${pagesRead}, ${duration})
      ON CONFLICT (user_id, book_id, date) 
      DO UPDATE SET 
        pages_read = reading_progress.pages_read + ${pagesRead},
        duration_minutes = reading_progress.duration_minutes + ${duration},
        updated_at = NOW()
    `;

    // Check for new badges
    const { checkAndGrantBadges } = await import('@/lib/gamification');
    const newBadges = await checkAndGrantBadges(user.id);

    return NextResponse.json({ success: true, newBadges });
  } catch (error) {
    console.error("Error saving reading progress:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const user = await getAuthenticatedUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const bookId = searchParams.get("bookId");

    let progress;

    if (bookId) {
       progress = await sql`
         SELECT * FROM reading_progress 
         WHERE user_id = ${user.id} AND book_id = ${bookId}
         ORDER BY date ASC
       `;
    } else {
       progress = await sql`
         SELECT * FROM reading_progress 
         WHERE user_id = ${user.id}
         ORDER BY date ASC
       `;
    }

    return NextResponse.json({ progress });
  } catch (error) {
    console.error("Error fetching progress:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
