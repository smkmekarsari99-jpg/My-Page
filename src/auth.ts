import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import { db } from "@/src/db";
import { users } from "@/src/features/login/_db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const { auth, signIn, signOut, handlers } = NextAuth({
  ...authConfig,
  // HAPUS bagian 'cookies: { ... }' yang panjang tadi.
  // Biarkan Auth.js mengaturnya otomatis.

  trustHost: true, // TETAP PERTAHANKAN INI

  providers: [
    Credentials({
      async authorize(credentials) {
        // ... (kode authorize kamu yang ada console.log biarkan saja, tidak perlu diubah) ...
        const parsedCredentials = LoginSchema.safeParse(credentials);

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;
          const userResult = await db
            .select()
            .from(users)
            .where(eq(users.email, email))
            .limit(1);
          const user = userResult[0];
          if (!user || !user.password) return null;

          const passwordsMatch = await bcrypt.compare(password, user.password);

          if (passwordsMatch) {
            return {
              id: user.id.toString(),
              name: user.name,
              email: user.email,
              role: user.role,
            };
          }
        }
        return null;
      },
    }),
  ],
});
