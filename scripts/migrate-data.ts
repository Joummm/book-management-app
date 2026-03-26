import { createClient } from '@supabase/supabase-js';
import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const neonSql = neon(process.env.DATABASE_URL!);

async function migrateUsers() {
  // Buscar usuários do Supabase
  const { data: supabaseUsers } = await supabase.auth.admin.listUsers();
  
  for (const user of supabaseUsers?.users || []) {
    // Hash temporário (você precisará que os usuários resetem a senha)
    const tempHash = await bcrypt.hash('temp-password-change-me', 10);
    
    // Inserir no Neon
    await neonSql`
      INSERT INTO users (id, email, password_hash, name, created_at, updated_at)
      VALUES (
        ${user.id}, 
        ${user.email}, 
        ${tempHash}, 
        ${user.user_metadata.name || user.email}, 
        ${user.created_at},
        ${user.updated_at || user.created_at}
      )
      ON CONFLICT (id) DO NOTHING
    `;
    
    // Migrar profile
    await neonSql`
      INSERT INTO profiles (id, name, email, created_at, updated_at)
      VALUES (
        ${user.id},
        ${user.user_metadata.name || user.email},
        ${user.email},
        ${user.created_at},
        ${user.updated_at || user.created_at}
      )
      ON CONFLICT (id) DO NOTHING
    `;
  }
}

async function migrateBooks() {
  const { data: books } = await supabase.from('books').select('*');
  
  for (const book of books || []) {
    await neonSql`
      INSERT INTO books (
        id, user_id, title, author, cover_image, rating, review,
        release_date, start_reading_date, finish_reading_date, pages,
        genres, publisher, format, characters, quotes, would_read_again,
        would_recommend, created_at, updated_at
      ) VALUES (
        ${book.id}, ${book.user_id}, ${book.title}, ${book.author},
        ${book.cover_image}, ${book.rating}, ${book.review},
        ${book.release_date}, ${book.start_reading_date},
        ${book.finish_reading_date}, ${book.pages}, ${book.genres},
        ${book.publisher}, ${book.format}, ${book.characters},
        ${book.quotes}, ${book.would_read_again}, ${book.would_recommend},
        ${book.created_at}, ${book.updated_at}
      )
      ON CONFLICT (id) DO NOTHING
    `;
  }
}

async function main() {
  console.log('Migrating users...');
  await migrateUsers();
  console.log('Migrating books...');
  await migrateBooks();
  console.log('Migration complete!');
}

main().catch(console.error);