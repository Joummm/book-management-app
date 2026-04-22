import { NextResponse } from "next/server";
import { sql } from "@/lib/db/client";
import { getAuthenticatedUser } from "@/lib/auth/auth";

export async function PATCH(request: Request) {
  try {
    const user = await getAuthenticatedUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name } = await request.json();

    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { error: "Invalid name" },
        { status: 400 }
      );
    }

    await sql`
      UPDATE users
      SET name = ${name}, updated_at = NOW()
      WHERE id = ${user.id}
    `;

    await sql`
      UPDATE profiles
      SET 
        name = ${name},
        updated_at = NOW()
      WHERE 
        id = ${user.id}
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
