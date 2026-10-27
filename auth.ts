import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { getDb } from "@/db";
import { checkPassword, findUserByEmail } from "@/lib/users";

/**
 * Login with email and password (what Laravel Breeze did).
 * The session is a signed cookie that only holds the user id;
 * everything else is read fresh from the database (see lib/auth-user.ts).
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { type: "email" },
        password: { type: "password" },
      },
      async authorize(credentials) {
        const email = typeof credentials?.email === "string" ? credentials.email : "";
        const password = typeof credentials?.password === "string" ? credentials.password : "";

        if (!email || !password) {
          return null;
        }

        const user = await findUserByEmail(await getDb(), email);

        if (!user || !(await checkPassword(password, user.password))) {
          return null;
        }

        return { id: String(user.id), name: user.name, email: user.email };
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    // The token keeps the user id as "sub"; hand it on to the session, where currentUser() reads it
    session({ session, token }) {
      if (token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
  pages: { signIn: "/login" },
  trustHost: true,
});
