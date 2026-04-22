const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

function getDatabaseUrl() {
  const envPath = path.join(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const env = fs.readFileSync(envPath, 'utf8');
    const match = env.match(/DATABASE_URL=(.+)/);
    if (match) return match[1].trim().replace(/^["']|["']$/g, '');
  }
  return process.env.DATABASE_URL;
}

const dbUrl = getDatabaseUrl();

if (!dbUrl) {
  console.error('DATABASE_URL is not defined');
  process.exit(1);
}

const sql = neon(dbUrl);

async function migrate() {
  try {
    console.log("Starting migration...");
    // Use the tagged template syntax even for strings without variables
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
