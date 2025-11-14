// Local cache for book data overrides
// This allows users to correct incomplete Google Books data locally
// Data persists across refreshes but doesn't affect the database

export interface LocalBookOverride {
  title?: string;
  author?: string;
  total_pages?: number;
  genres?: string[];
  cover_url?: string;
}

const STORAGE_KEY = 'book_local_overrides';

export const getLocalBookOverrides = (): Record<string, LocalBookOverride> => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('Error reading local book overrides:', error);
    return {};
  }
};

export const getLocalBookOverride = (bookId: string): LocalBookOverride | null => {
  const overrides = getLocalBookOverrides();
  return overrides[bookId] || null;
};

export const setLocalBookOverride = (bookId: string, override: LocalBookOverride) => {
  try {
    const overrides = getLocalBookOverrides();
    overrides[bookId] = override;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
  } catch (error) {
    console.error('Error saving local book override:', error);
  }
};

export const clearLocalBookOverride = (bookId: string) => {
  try {
    const overrides = getLocalBookOverrides();
    delete overrides[bookId];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
  } catch (error) {
    console.error('Error clearing local book override:', error);
  }
};

export const mergeBookWithLocal = <T extends { id: string }>(book: T): T => {
  const override = getLocalBookOverride(book.id);
  if (!override) return book;
  
  return {
    ...book,
    ...override,
  };
};
