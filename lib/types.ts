export interface Book {
  id: string
  user_id: string
  title: string
  author: string
  cover_image?: string | null
  rating?: number | null
  review?: string | null
  release_date?: string | null
  start_reading_date?: string | null
  finish_reading_date?: string | null
  pages?: number | null
  genres?: string[] | null
  publisher?: string | null
  format: "physical" | "digital"
  characters?: string[] | null
  quotes?: string[] | null
  would_read_again?: "yes" | "no" | "maybe" | null
  would_recommend?: boolean | null
  created_at: string
  updated_at: string
}

export interface Profile {
  id: string
  name: string
  email: string
  created_at: string
  updated_at: string
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
] as const

export type Genre = (typeof GENRES)[number]
