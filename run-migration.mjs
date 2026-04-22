import { Pool } from '@neondatabase/serverless';
import fs from 'fs';

// Manually load .env.local
const envFile = fs.readFileSync('.env.local', 'utf8');
const dbUrlMatch = envFile.match(/DATABASE_URL=["']?([^"'\n]+)["']?/);
const DATABASE_URL = dbUrlMatch ? dbUrlMatch[1] : process.env.DATABASE_URL;

const pool = new Pool({ connectionString: DATABASE_URL });

async function run() {
  console.log('Running migration...');
  const query = fs.readFileSync('scripts/010_add_duration_to_progress.sql', 'utf8');
  await pool.query(query);
  console.log('Migration completed.');
  await pool.end();
}

run().catch(console.error);
