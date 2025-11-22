import { z } from 'zod';

export const noteSchema = z.object({
  content: z.string()
    .trim()
    .min(1, 'Note cannot be empty')
    .max(5000, 'Note must be less than 5000 characters')
});

export const profileSchema = z.object({
  display_name: z.string()
    .trim()
    .min(1, 'Username is required')
    .max(50, 'Username must be less than 50 characters'),
  bio: z.string()
    .trim()
    .max(500, 'Bio must be less than 500 characters')
    .optional()
});

export const reviewSchema = z.object({
  review: z.string()
    .trim()
    .max(2000, 'Review must be less than 2000 characters')
    .optional()
});

export const bookSchema = z.object({
  title: z.string()
    .trim()
    .min(1, 'Title is required')
    .max(500, 'Title must be less than 500 characters'),
  author: z.string()
    .trim()
    .max(200, 'Author must be less than 200 characters')
    .optional(),
  total_pages: z.number()
    .positive('Page count must be positive')
    .nullable()
    .optional()
});
