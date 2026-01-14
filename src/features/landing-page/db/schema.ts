// src/db/schema.ts
import {
  pgTable,
  text,
  timestamp,
  boolean,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// Kita gunakan UUID untuk ID agar lebih aman dan skalabel
// Tabel untuk Kategori (Misal: Berita, Pengumuman, Prestasi)
export const categories = pgTable("categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 50 }).notNull(),
  slug: varchar("slug", { length: 50 }).notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Tabel untuk Artikel/Berita Sekolah
export const posts = pgTable("posts", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  excerpt: text("excerpt"), // Ringkasan untuk card di landing page
  content: text("content").notNull(), // Bisa HTML atau Markdown
  coverImage: text("cover_image"), // URL dari Uploadthing/Supabase Storage
  published: boolean("published").default(false).notNull(),
  featured: boolean("featured").default(false).notNull(), // Untuk ditampilkan di Hero/Highlight
  categoryId: uuid("category_id").references(() => categories.id),
  authorId: uuid("author_id").notNull(), // Referensi ke auth.users Supabase (jika perlu join manual nanti)
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Tabel untuk Program/Jurusan (Penting untuk SMK)
export const programs = pgTable("programs", {
  id: uuid("id").defaultRandom().primaryKey(),
  level: varchar("level", { length: 10 }).notNull(), // 'SMP' atau 'SMK'
  name: varchar("name", { length: 100 }).notNull(), // Misal: 'Teknik Komputer Jaringan'
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  description: text("description"),
  icon: varchar("icon", { length: 50 }), // Nama icon dari Lucide React
  image: text("image"),
  active: boolean("active").default(true).notNull(),
});
