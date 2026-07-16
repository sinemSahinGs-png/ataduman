import { z } from 'zod';
import { isValidSlug, normalizeSlug } from './utils';

export const loginSchema = z.object({
  password: z.string().min(1, 'Şifre gerekli'),
});

export const inviteUpsertSchema = z.object({
  name: z.string().trim().min(1).max(80),
  honorific: z.string().trim().min(1).max(40).default('Hanım'),
  male_name: z.string().trim().min(1).max(80).default('Ata Duman'),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(64)
    .transform(normalizeSlug)
    .refine(isValidSlug, 'Geçersiz veya rezerve slug'),
  custom_question: z
    .string()
    .trim()
    .max(280)
    .nullish()
    .transform((v) => (v && v.length ? v : null)),
  is_active: z.boolean().default(true),
});

export const invitePatchSchema = z
  .object({
    name: z.string().trim().min(1).max(80).optional(),
    honorific: z.string().trim().min(1).max(40).optional(),
    male_name: z.string().trim().min(1).max(80).optional(),
    slug: z
      .string()
      .trim()
      .min(2)
      .max(64)
      .transform(normalizeSlug)
      .refine(isValidSlug, 'Geçersiz veya rezerve slug')
      .optional(),
    custom_question: z
      .string()
      .trim()
      .max(280)
      .nullish()
      .transform((v) => (v && v.length ? v : null))
      .optional(),
    is_active: z.boolean().optional(),
  })
  .refine((v) => Object.keys(v).length > 0, 'Güncellenecek alan yok');

export const respondSchema = z.object({
  slug: z.string().trim().min(2).max(64),
  selected_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Geçersiz tarih'),
  session_id: z.string().uuid(),
  source: z.string().max(40).optional(),
});

export const viewSchema = z.object({
  slug: z.string().trim().min(2).max(64),
});
