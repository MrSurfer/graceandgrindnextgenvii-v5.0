import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { env } from "./env";

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: env.AUTH_SECRET,
  session: { strategy: "jwt" },
  providers: [
    Google,
    GitHub,
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.password) return null;
        if (user.status === "BLOCKED") throw new Error("Account is blocked.");

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          status: user.status
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google' || account?.provider === 'github') {
        if (!user.email) return false;
        
        let dbUser = await prisma.user.findUnique({ where: { email: user.email } });
        if (!dbUser) {
          dbUser = await prisma.user.create({
            data: {
              email: user.email,
              name: user.name,
              image: user.image, // Sync profile picture from provider
              role: "CUSTOMER",
            }
          });
        } else if (!dbUser.image && user.image) {
          // Update existing user image if they don't have one
          await prisma.user.update({
            where: { id: dbUser.id },
            data: { image: user.image }
          });
        }
        
        if (dbUser.status === "BLOCKED") return false;
        
        // Attach db properties to the user object so jwt callback can use them
        (user as any).id = dbUser.id;
        (user as any).role = dbUser.role;
      }
      if (user?.email) {
        const whitelist = (process.env.SUPER_ADMIN_EMAILS || "").split(",");
        if (whitelist.includes(user.email)) {
          // FORCE sync database role to SUPER_ADMIN if whitelisted
          const dbUser = await prisma.user.findUnique({ where: { email: user.email } });
          if (dbUser && dbUser.role !== "SUPER_ADMIN") {
            await prisma.user.update({
              where: { email: user.email },
              data: { role: "SUPER_ADMIN" }
            });
          }
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }
      // Re-check DB occasionally or trust the token. We'll trust the token to avoid DB hit on every request.
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});
