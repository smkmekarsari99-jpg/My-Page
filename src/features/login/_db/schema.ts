import {
  pgTable,
  serial,
  text,
  timestamp,
  integer,
  boolean,
  pgEnum,
  date,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// --- 1. ENUMS (Agar data konsisten) ---
export const roleEnum = pgEnum("role", ["admin", "guru", "siswa", "staff"]);
export const attendanceStatusEnum = pgEnum("attendance_status", [
  "hadir",
  "sakit",
  "izin",
  "alpha",
]);

// --- 2. AUTHENTICATION & USERS ---
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password"), // Nullable jika nanti login via Google
  role: roleEnum("role").default("siswa").notNull(),
  image: text("image"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// --- 3. ACADEMIC STRUCTURE (Kelas & Mapel) ---
export const classes = pgTable("classes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(), // Contoh: "X RPL 1"
  grade: integer("grade").notNull(), // 10, 11, 12
  academicYear: text("academic_year").notNull(), // "2024/2025"
});

export const subjects = pgTable("subjects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(), // Contoh: "Matematika Wajib"
  code: text("code").unique(), // "MTK-01"
});

// --- 4. PROFILES (Data Detail) ---
// Profile Guru
export const teacherProfiles = pgTable("teacher_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  nip: text("nip").unique(),
  specialization: text("specialization"), // Bidang studi
});

// Profile Siswa
export const studentProfiles = pgTable("student_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  classId: integer("class_id").references(() => classes.id), // Relasi ke Kelas
  nisn: text("nisn").unique(),
  address: text("address"),
  gender: text("gender"), // "L" or "P"
});

// --- 5. OPERATIONAL (Absensi) ---
export const attendance = pgTable("attendance", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id")
    .references(() => studentProfiles.id)
    .notNull(),
  date: date("date").defaultNow().notNull(),
  status: attendanceStatusEnum("status").notNull(),
  notes: text("notes"), // Keterangan tambahan
  recordedBy: integer("recorded_by").references(() => users.id), // Siapa yg input (Guru/Admin)
});

// --- 6. RELATIONS (Untuk Query Drizzle API) ---
// Ini mempermudah query: db.query.users.findMany({ with: { studentProfile: true } })

export const usersRelations = relations(users, ({ one }) => ({
  teacherProfile: one(teacherProfiles, {
    fields: [users.id],
    references: [teacherProfiles.userId],
  }),
  studentProfile: one(studentProfiles, {
    fields: [users.id],
    references: [studentProfiles.userId],
  }),
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
