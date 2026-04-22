import { sql } from "../lib/db/client";

async function migrate() {
  try {
    console.log("Starting migration...");
    await sql`
      ALTER TABLE books 
      ALTER COLUMN would_recommend TYPE text 
      USING (
        CASE 
          WHEN would_recommend = true THEN 'yes' 
          WHEN would_recommend = false THEN 'no' 
          ELSE 'maybe' 
        END
      );
    `;
    console.log("Migration successful!");
  } catch (err) {
    console.error("Migration failed:", err);
  }
}

migrate();
