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
  time, // [NEW] Penting untuk menyimpan jam (misal: "07:00")
} from "drizzle-orm/pg-core";
import {
  relations,
  type InferSelectModel,
  type InferInsertModel,
} from "drizzle-orm";

// =========================================
// 1. ENUMS & AUTH (LOGIN & USERS)
// =========================================

export const roleEnum = pgEnum("role", ["admin", "guru", "siswa", "staff"]);
export const attendanceStatusEnum = pgEnum("attendance_status", [
  "hadir", // Siswa datang
  "sakit", // Input manual admin
  "izin", // Input manual admin
  "alpha", // Default jika tidak scan
  "terlambat", // Otomatis jika scan > batas waktu
]);

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
// 2. SETTING SEKOLAH (BARU - UNTUK LOGIC QR)
// =========================================
// Tabel ini hanya akan punya 1 baris data yang di-update oleh Admin
export const schoolSettings = pgTable("school_settings", {
  id: serial("id").primaryKey(),
  // Jam mulai scan masuk (misal 06:00)
  checkInStart: time("check_in_start").notNull().default("06:00:00"),
  // Batas toleransi terlambat (misal 07:15) -> Lewat ini jadi MERAH
  lateThreshold: time("late_threshold").notNull().default("07:15:00"),
  // Jam mulai scan pulang (misal 15:00) -> Scan sebelum ini ditolak/warning
  checkOutStart: time("check_out_start").notNull().default("15:00:00"),

  updatedAt: timestamp("updated_at").defaultNow(),
});

// =========================================
// 3. AKADEMIK (DASHBOARD SEKOLAH)
// =========================================

export const gradeEnum = pgEnum("grade_enum", ["X", "XI", "XII"]);

export const classes = pgTable("classes", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 50 }).notNull(),
  grade: gradeEnum("grade").notNull(),
  major: varchar("major", { length: 50 }).notNull(),
  academicYear: varchar("academic_year", { length: 20 }).notNull(),
  teacherId: uuid("teacher_id")
    .references(() => users.id, { onDelete: "set null" })
    .notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
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

  // [UPDATED] NIS Wajib Unique untuk QR Code
  nis: varchar("nis", { length: 20 }).unique().notNull(),
  nisn: text("nisn").unique(),

  // [UPDATED] Foto Wajib untuk Feedback saat Scan
  photoUrl: text("photo_url"),

  address: text("address"),
  gender: text("gender"),
});

// [UPDATED] LOGIC ABSENSI YANG LEBIH PINTAR
export const attendance = pgTable("attendance", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id")
    .references(() => studentProfiles.id)
    .notNull(),

  // Tanggal Absensi (Penting untuk query per hari)
  date: date("date").defaultNow().notNull(),

  // Waktu spesifik Scan Masuk
  checkIn: timestamp("check_in"),

  // Waktu spesifik Scan Pulang
  checkOut: timestamp("check_out"),

  // Status kehadiran
  status: attendanceStatusEnum("status").notNull().default("alpha"),

  // Penanda keterlambatan (Logic Merah/Kuning)
  isLate: boolean("is_late").default(false),

  notes: text("notes"),
  recordedBy: uuid("recorded_by").references(() => users.id),
});

// =========================================
// 4. KONTEN LANDING PAGE
// =========================================
// (Bagian ini tidak berubah dari kode Anda sebelumnya)

export const categories = pgTable("categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 50 }).notNull(),
  slug: varchar("slug", { length: 50 }).notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

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

export const programs = pgTable("programs", {
  id: uuid("id").defaultRandom().primaryKey(),
  level: varchar("level", { length: 10 }).notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  description: text("description"),
  icon: varchar("icon", { length: 50 }),
  image: text("image"),
  active: boolean("active").default(true).notNull(),
});

// =========================================
// 5. RELASI DATABASE (RELATIONS)
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
  posts: many(posts),
  homeroomClass: one(classes, {
    fields: [users.id],
    references: [classes.teacherId],
  }),
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

export const classRelations = relations(classes, ({ one, many }) => ({
  students: many(studentProfiles),
  homeroomTeacher: one(users, {
    fields: [classes.teacherId],
    references: [users.id],
  }),
}));

export const attendanceRelations = relations(attendance, ({ one }) => ({
  student: one(studentProfiles, {
    fields: [attendance.studentId],
    references: [studentProfiles.id],
  }),
}));

// =========================================
// 6. EXPORT TYPES (HELPER)
// =========================================

// Tipe dasar tabel (Raw Data)
export type Class = InferSelectModel<typeof classes>;
export type NewClass = InferInsertModel<typeof classes>;
export type Student = InferSelectModel<typeof studentProfiles>;

// Tipe Helper untuk Absensi & Setting
export type Attendance = InferSelectModel<typeof attendance>;
export type SchoolSettings = InferSelectModel<typeof schoolSettings>;

// Tipe KOMPLEKS (Data + Relasi) - KEMBALIKAN INI
// Gunakan ini saat fetch data di halaman Dashboard untuk Table
export type ClassWithDetails = Class & {
  homeroomTeacher: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  } | null;
  // Nanti kita bisa tambah count siswa di sini
  studentCount?: number;
};

export type StudentWithDetails = Student & {
  user: {
    name: string;
    email: string;
  };
  class: {
    name: string;
  } | null;
};
