import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login", // Pastikan route ini benar sesuai folder kamu
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");

      if (isOnDashboard) {
        // Kalau mau masuk dashboard tapi belum login -> tolak (return false = redirect ke login)
        if (isLoggedIn) return true;
        return false;
      } else if (isLoggedIn) {
        if (nextUrl.pathname.startsWith("/login")) {
          return Response.redirect(new URL("/dashboard", nextUrl));
        }
      }

      return true;
    },
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }
      if (token.role && session.user) {
        session.user.role = token.role as string;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
