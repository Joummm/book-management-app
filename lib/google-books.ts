
export interface GoogleBookItem {
  id: string;
  volumeInfo: {
    title: string;
    authors?: string[];
    publisher?: string;
    publishedDate?: string;
    description?: string;
    industryIdentifiers?: { type: string; identifier: string }[];
    pageCount?: number;
    categories?: string[];
    averageRating?: number;
    imageLinks?: {
      thumbnail?: string;
      smallThumbnail?: string;
    };
  };
}

export async function searchGoogleBooks(query: string): Promise<GoogleBookItem[]> {
  if (!query) return [];
  
  try {
    const response = await fetch(`/api/books/search?q=${encodeURIComponent(query)}`);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to fetch from local API');
    }
    
    const data = await response.json();
    return data.items || [];
  } catch (error) {
    console.error('Google Books Search Error:', error);
    return [];
  }
}
