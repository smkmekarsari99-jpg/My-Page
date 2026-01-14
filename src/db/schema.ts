import {
  pgTable,
  serial,
  text,
  timestamp,
  integer,
  boolean,
  pgEnum,
  date,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// =========================================
// 1. ENUMS & AUTH (LOGIN & USERS)
// =========================================

export const roleEnum = pgEnum("role", ["admin", "guru", "siswa", "staff"]);
export const attendanceStatusEnum = pgEnum("attendance_status", [
  "hadir",
  "sakit",
  "izin",
  "alpha",
]);

// Tabel Users (Login System)
export const users = pgTable("users", {
  id: uuid("id").primaryKey(), // ID dari Supabase Auth
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password"),
  role: roleEnum("role").default("siswa").notNull(),
  image: text("image"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// =========================================
// 2. AKADEMIK (DASHBOARD SEKOLAH)
// =========================================

export const classes = pgTable("classes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(), // Contoh: "X RPL 1"
  grade: integer("grade").notNull(),
  academicYear: text("academic_year").notNull(),
});

export const subjects = pgTable("subjects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  code: text("code").unique(),
});

export const teacherProfiles = pgTable("teacher_profiles", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  nip: text("nip").unique(),
  specialization: text("specialization"),
});

export const studentProfiles = pgTable("student_profiles", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  classId: integer("class_id").references(() => classes.id),
  nisn: text("nisn").unique(),
  address: text("address"),
  gender: text("gender"),
});

export const attendance = pgTable("attendance", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id")
    .references(() => studentProfiles.id)
    .notNull(),
  date: date("date").defaultNow().notNull(),
  status: attendanceStatusEnum("status").notNull(),
  notes: text("notes"),
  recordedBy: uuid("recorded_by").references(() => users.id),
});

// =========================================
// 3. KONTEN LANDING PAGE (BERITA & JURUSAN)
// =========================================

// Kategori Berita
export const categories = pgTable("categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 50 }).notNull(),
  slug: varchar("slug", { length: 50 }).notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Artikel / Berita
export const posts = pgTable("posts", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  excerpt: text("excerpt"),
  content: text("content").notNull(),
  coverImage: text("cover_image"),
  published: boolean("published").default(false).notNull(),
  featured: boolean("featured").default(false).notNull(),
  categoryId: uuid("category_id").references(() => categories.id),
  authorId: uuid("author_id")
    .references(() => users.id)
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Program / Jurusan Sekolah
export const programs = pgTable("programs", {
  id: uuid("id").defaultRandom().primaryKey(),
  level: varchar("level", { length: 10 }).notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  description: text("description"),
  icon: varchar("icon", { length: 50 }), // Nama icon (e.g., "Code", "PenTool")
  image: text("image"),
  active: boolean("active").default(true).notNull(),
});

// =========================================
// 4. RELASI DATABASE (RELATIONS)
// =========================================

export const usersRelations = relations(users, ({ one, many }) => ({
  teacherProfile: one(teacherProfiles, {
    fields: [users.id],
    references: [teacherProfiles.userId],
  }),
  studentProfile: one(studentProfiles, {
    fields: [users.id],
    references: [studentProfiles.userId],
  }),
  posts: many(posts), // User (Admin) bisa punya banyak berita
}));

export const postsRelations = relations(posts, ({ one }) => ({
  author: one(users, {
    fields: [posts.authorId],
    references: [users.id],
  }),
  category: one(categories, {
    fields: [posts.categoryId],
    references: [categories.id],
  }),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  posts: many(posts),
}));

export const studentRelations = relations(studentProfiles, ({ one, many }) => ({
  user: one(users, {
    fields: [studentProfiles.userId],
    references: [users.id],
  }),
  class: one(classes, {
    fields: [studentProfiles.classId],
    references: [classes.id],
  }),
  attendance: many(attendance),
}));

export const classRelations = relations(classes, ({ many }) => ({
  students: many(studentProfiles),
}));

export const attendanceRelations = relations(attendance, ({ one }) => ({
  student: one(studentProfiles, {
    fields: [attendance.studentId],
    references: [studentProfiles.id],
  }),
}));
