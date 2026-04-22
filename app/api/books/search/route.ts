
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query) {
    return NextResponse.json({ items: [] });
  }

  try {
    const response = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=8`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Unknown error");
      console.error("Google Books API Error Status:", response.status);
      
      // If Google fails (e.g. quota exceeded), try Open Library as fallback
      if (response.status === 429 || response.status >= 500) {
        console.log("Attempting fallback to Open Library...");
        return await fetchOpenLibrary(query);
      }

      return NextResponse.json(
        { error: "Failed to fetch from Google Books", status: response.status, details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Server-side Google Books Search Error:", error);
    // Try fallback on network error too
    return await fetchOpenLibrary(query);
  }
}

async function fetchOpenLibrary(query: string) {
  try {
    const response = await fetch(
      `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=8`
    );

    if (!response.ok) {
      return NextResponse.json({ error: "All search services failed" }, { status: 502 });
    }

    const data = await response.json();
    
    // Map Open Library format to a Google-like format for the client
    const mappedItems = (data.docs || []).map((doc: any) => ({
      id: doc.key.replace("/works/", ""),
      volumeInfo: {
        title: doc.title,
        authors: doc.author_name,
        publisher: doc.publisher?.[0],
        publishedDate: doc.first_publish_year?.toString() || doc.publish_date?.[0],
        description: doc.first_sentence?.[0] || "",
        pageCount: doc.number_of_pages_median || doc.number_of_pages,
        categories: doc.subject?.slice(0, 5),
        imageLinks: doc.cover_i ? {
          thumbnail: `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`,
          smallThumbnail: `https://covers.openlibrary.org/b/id/${doc.cover_i}-S.jpg`
        } : undefined
      }
    }));

    return NextResponse.json({ items: mappedItems });
  } catch (error) {
    console.error("Open Library Fallback Error:", error);
    return NextResponse.json({ error: "Internal Server Error during fallback" }, { status: 500 });
  }
}
