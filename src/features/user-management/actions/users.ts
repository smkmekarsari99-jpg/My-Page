import { users } from "@/src/features/login/_db/schema";
import { InferSelectModel, InferInsertModel } from "drizzle-orm";

// Tipe untuk data yang DIAMBIL dari database (Select)
// Ini otomatis berisi: id, name, email, password, role, createdAt, dll.
export type User = InferSelectModel<typeof users>;

// Tipe untuk data yang mau DIINPUT ke database (Insert)
// Ini biasanya tidak butuh ID (karena auto-increment) atau createdAt
export type NewUser = InferInsertModel<typeof users>;
