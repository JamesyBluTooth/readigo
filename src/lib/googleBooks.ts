export interface GoogleBook {
  title: string;
  authors?: string[];
  categories?: string[];
  imageLinks?: {
    thumbnail?: string;
  };
  pageCount?: number;
}

export interface GoogleBooksResponse {
  items?: Array<{
    volumeInfo: GoogleBook;
  }>;
}

export async function fetchBookByISBN(isbn: string): Promise<GoogleBook | null> {
  try {
    // Validate and sanitize ISBN
    const cleanISBN = isbn.replace(/[^0-9X]/gi, '');
    if (!/^(\d{10}|\d{13})$/.test(cleanISBN)) {
      throw new Error('Invalid ISBN format. Please enter a valid 10 or 13 digit ISBN.');
    }
    
    const response = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=isbn:${encodeURIComponent(cleanISBN)}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch book data');
    }

    const data: GoogleBooksResponse = await response.json();
    
    if (!data.items || data.items.length === 0) {
      return null;
    }

    return data.items[0].volumeInfo;
  } catch (error) {
    console.error('Error fetching book:', error);
    return null;
  }
}
