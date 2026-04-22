import { get, set } from 'idb-keyval';
import type { Book } from '@/lib/types';

const BOOKS_KEY = 'bookmanager_offline_books';
const LAST_SYNC_KEY = 'bookmanager_last_sync';

export async function saveBooksToIndexedDB(books: Book[]) {
  try {
    await set(BOOKS_KEY, books);
    await set(LAST_SYNC_KEY, new Date().toISOString());
    console.log('Books saved to IndexedDB for offline access');
  } catch (error) {
    console.error('Failed to save books to IndexedDB:', error);
  }
}

export async function getBooksFromIndexedDB(): Promise<Book[]> {
  try {
    const books = await get<Book[]>(BOOKS_KEY);
    return books || [];
  } catch (error) {
    console.error('Failed to get books from IndexedDB:', error);
    return [];
  }
}

export async function getLastSyncDate(): Promise<Date | null> {
  try {
    const dateStr = await get<string>(LAST_SYNC_KEY);
    return dateStr ? new Date(dateStr) : null;
  } catch (error) {
    return null;
  }
}
