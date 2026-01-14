// src/lib/validators/schema.ts
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { posts, programs } from "../../db/schema";
import { z } from "zod";

// Schema untuk Insert Data (Validasi Form)
export const insertPostSchema = createInsertSchema(posts, {
  title: (schema) => schema.min(5, "Judul minimal 5 karakter"),
  slug: (schema) => schema.min(3, "Slug terlalu pendek"),
});

export const insertProgramSchema = createInsertSchema(programs, {
  name: (schema) => schema.min(3, "Nama jurusan harus jelas"),
  level: z.enum(["SMP", "SMK"]),
});

// Tipe TypeScript yang bisa dipakai di komponen UI
export type Post = z.infer<typeof insertPostSchema>;
export type Program = z.infer<typeof insertProgramSchema>;
