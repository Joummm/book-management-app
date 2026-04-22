import { sql } from "../lib/db/client";

async function checkSchema() {
  try {
    const result = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'books' AND column_name IN ('would_read_again', 'would_recommend');
    `;
    console.log(JSON.stringify(result, null, 2));
  } catch (err) {
    console.error(err);
  }
}

checkSchema();
