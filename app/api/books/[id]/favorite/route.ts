import { NextResponse } from "next/server";
import { sql } from "@/lib/db/client";
import { getAuthenticatedUser } from "@/lib/auth/auth";

export async function PATCH(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await props.params;
    const user = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { is_favorite } = await request.json();

    if (typeof is_favorite !== "boolean") {
      return NextResponse.json(
        { error: "Invalid boolean value for is_favorite" },
        { status: 400 }
      );
    }

    // Toggle favorite state
    const result = await sql`
      UPDATE books
      SET 
        is_favorite = ${is_favorite},
        updated_at = NOW()
      WHERE 
        id = ${id} AND user_id = ${user.id}
      RETURNING *
    `;

    if (result.length === 0) {
      return NextResponse.json(
        { error: "Book not found or unauthorized" },
        { status: 404 }
      );
    }

    return NextResponse.json({ book: result[0] });
  } catch (error) {
    console.error("Error updating favorite status:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
