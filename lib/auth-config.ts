import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { getDb } from "@/lib/db";
import { verifyPassword } from "@/lib/auth";

const db = getDb();

export const authOptions: any = {
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials: any) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const result = await db.query(
            "SELECT id, email, password_hash, name, provider FROM users WHERE email = $1",
            [credentials.email]
          );

          if (result.rows.length === 0) {
            return null;
          }

          const user = result.rows[0];

          if (!user.password_hash) {
            return null;
          }

          const isPasswordValid = await verifyPassword(
            credentials.password,
            user.password_hash
          );

          if (!isPasswordValid) {
            return null;
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      allowDangerousEmailAccountLinking: true,
    }),
  ],

  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60,
  },

  jwt: {
    maxAge: 7 * 24 * 60 * 60,
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },

  callbacks: {
    async jwt({ token, user, account, profile }: any) {
      console.log("JWT callback - user:", user?.email, "profile:", profile?.email, "token.email:", token.email, "token.sub:", token.sub);

      // For credentials provider: user.id comes directly from database
      if (account?.provider === "credentials" && user?.id && user?.email) {
        console.log("Credentials provider - setting token from user object");
        token.userId = user.id;
        token.email = user.email;
        token.name = user.name;
        return token;
      }

      // For OAuth (Google, etc): ALWAYS fetch from database by email
      // Never trust the user.id from OAuth as NextAuth replaces it with the provider's ID
      const email = user?.email || profile?.email || token.email;
      if (email && (!token.userId || token.userId.length > 15)) {
        console.log("OAuth flow - fetching user from DB for email:", email);
        try {
          const result = await db.query(
            "SELECT id, email, name FROM users WHERE email = $1",
            [email]
          );
          if (result.rows.length > 0) {
            const dbUser = result.rows[0];
            console.log("Found user in DB:", dbUser.id, dbUser.email);
            token.userId = dbUser.id;
            token.email = dbUser.email;
            token.name = dbUser.name || profile?.name || user?.name || token.name;
          } else {
            console.log("User not found in DB for email:", email);
          }
        } catch (error) {
          console.error("Error fetching user in JWT callback:", error);
        }
      }

      console.log("JWT callback returning token with userId:", token.userId, "token.email:", token.email);
      return token;
    },

    async session({ session, token }: any) {
      console.log("Session callback - token.userId:", token.userId, "session.user:", session.user?.email);
      if (session.user) {
        session.user.id = token.userId as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;

        if (token.userId && !token.userId.includes("-") && token.email) {
          try {
            const result = await db.query(
              "SELECT id FROM users WHERE email = $1",
              [token.email]
            );
            if (result.rows.length > 0) {
              session.user.id = result.rows[0].id;
            }
          } catch (error) {
            console.error("Error fixing user ID in session:", error);
          }
        }
      }
      console.log("Session callback returning - session.user.id:", session.user?.id);
      return session;
    },

    async signIn({ user, account, profile }: any) {
      console.log("signIn callback called - provider:", account?.provider, "email:", profile?.email || user?.email);

      if (account?.provider === "google") {
        console.log("Processing Google OAuth signin for:", profile?.email);
        try {
          const existingUser = await db.query(
            "SELECT id, email, name, provider FROM users WHERE email = $1",
            [profile?.email]
          );

          console.log("Database query result - rows found:", existingUser.rows.length);

          if (existingUser.rows.length > 0) {
            const existingUserData = existingUser.rows[0];
            console.log("Linking Google OAuth to existing user:", profile?.email, "Current provider:", existingUserData.provider, "User ID:", existingUserData.id);

            // Link the Google account to the existing user (works even if they had credentials provider)
            const updateResult = await db.query(
              "UPDATE users SET provider = $1, provider_id = $2, name = $3 WHERE id = $4",
              [
                "google",
                account.providerAccountId,
                profile?.name || existingUserData.name,
                existingUserData.id,
              ]
            );

            console.log("User updated successfully, ID:", existingUserData.id);
            return true;
          }

          // User doesn't exist, create new account
          console.log("User not found, creating new Google OAuth user");
          const result = await db.query(
            "INSERT INTO users (email, name, provider, provider_id) VALUES ($1, $2, $3, $4) RETURNING id, email, name",
            [profile?.email, profile?.name, "google", account.providerAccountId]
          );

          const newUser = result.rows[0];
          console.log("Created new Google OAuth user:", profile?.email, "with ID:", newUser.id);
          return true;
        } catch (error) {
          console.error("Google sign in error:", error);
          return false;
        }
      }

      console.log("Non-Google provider or returning from non-Google path");
      return true;
    },
  },

  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 7 * 24 * 60 * 60,
      },
    },
  },
};
