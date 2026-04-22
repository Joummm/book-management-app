
import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth/auth";
import { sql } from "@/lib/db/client";

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { goal } = await request.json();
    
    if (typeof goal !== 'number' || goal < 0) {
      return NextResponse.json({ error: "Invalid goal" }, { status: 400 });
    }

    await sql`
      UPDATE profiles 
      SET reading_goal = ${goal}, updated_at = NOW()
      WHERE id = ${user.id}
    `;

    return NextResponse.json({ success: true, goal });
  } catch (error) {
    console.error("Error updating reading goal:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
