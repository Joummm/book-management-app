export interface Book {
  id: string;
  user_id: string;
  title: string;
  author: string;
  cover_image?: string | null;
  rating?: number | null;
  review?: string | null;
  release_date?: string | null;
  start_reading_date?: string | null;
  finish_reading_date?: string | null;
  pages?: number | null;
  genres?: string[] | null;
  publisher?: string | null;
  format: "physical" | "digital";
  characters?: string[] | null;
  quotes?: string[] | null;
  would_read_again?: "yes" | "no" | "maybe" | null;
  would_recommend?: "yes" | "no" | "maybe" | null;
  is_favorite?: boolean | null;
  collections?: Collection[] | string[]; // Can be full objects or just IDs
  authors?: Author[] | string[]; // Can be full objects or just IDs
  created_at: string;
  updated_at: string;
}

export interface ReadingProgress {
  id: string;
  user_id: string;
  book_id: string;
  date: string;
  pages_read: number;
  created_at: string;
}


export interface Author {
  id: string;
  user_id: string;
  name: string;
  bio?: string | null;
  image_url?: string | null;
  born_date?: string | null;
  died_date?: string | null;
  nationality?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Collection {
  id: string;
  user_id: string;
  name: string;
  description?: string | null;
  color?: string | null;
  emoji?: string | null;
  created_at: string;
  updated_at: string;
  books_count?: number;
}

export interface Profile {
  id: string;
  name: string;
  email: string;
  bio?: string | null;
  avatar_url?: string | null;
  favorite_book_id?: string | null;
  reading_goal?: number | null;
  reading_speed?: number | null;
  notifications_enabled?: boolean | null;
  reminder_time?: string | null;
  timezone?: string | null;
  language?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement_type: string;
  requirement_value: number;
  earned_at?: string;
}

export const GENRES = [
  "action",
  "adventure",
  "biography",
  "science",
  "classic",
  "comedy",
  "tales",
  "chronicle",
  "drama",
  "education",
  "fantasy",
  "fiction",
  "philosophy",
  "gastronomy",
  "war",
  "history",
  "horror",
  "children",
  "manga",
  "mystery",
  "narrative",
  "novel",
  "poetry",
  "detective",
  "psychology",
  "romance",
  "scifi",
  "suspense",
  "thriller",
  "other",
] as const;

export type Genre = (typeof GENRES)[number];
