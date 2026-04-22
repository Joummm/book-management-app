import { NextResponse } from "next/server";
import { sql } from "@/lib/db/client";
import { getAuthenticatedUser } from "@/lib/auth/auth";

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch books that DO NOT belong to the current user
    // In a real app we might paginate this or filter by "public" flag.
    const communityBooks = await sql`
      SELECT 
        b.id, b.title, b.author, b.cover_image, b.rating, b.genres, b.pages,
        p.name as owner_name
      FROM books b
      LEFT JOIN profiles p ON b.user_id = p.id
      WHERE b.user_id != ${user.id}
      ORDER BY b.created_at DESC
      LIMIT 20
    `;

    return NextResponse.json({ books: communityBooks });
  } catch (error) {
    console.error("Error fetching community books:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
