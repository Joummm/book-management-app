import { NextResponse } from "next/server";
import { sql } from "@/lib/db/client";
import { getAuthenticatedUser } from "@/lib/auth/auth";

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { bookId } = await request.json();

    if (!bookId) {
      return NextResponse.json({ error: "Book ID is required" }, { status: 400 });
    }

    // Get the original book
    const originalBooks = await sql`
      SELECT * FROM books WHERE id = ${bookId}
    `;

    if (originalBooks.length === 0) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    const original = originalBooks[0];

    // Clone the book to the new user without specific personal state
    const newBookResult = await sql`
      INSERT INTO books (
        user_id,
        title,
        author,
        cover_image,
        pages,
        genres,
        publisher,
        format,
        characters
      ) VALUES (
        ${user.id},
        ${original.title},
        ${original.author},
        ${original.cover_image || null},
        ${original.pages || null},
        ${original.genres || null},
        ${original.publisher || null},
        ${original.format || 'physical'},
        ${original.characters || null}
      )
      RETURNING *
    `;

    return NextResponse.json({ book: newBookResult[0] });
  } catch (error) {
    console.error("Error cloning community book:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
