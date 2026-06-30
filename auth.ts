import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";

const ownerLogins = new Set(
  (process.env.MINDREPLY_OWNER_GITHUB_USERS ?? "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean),
);

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/sign-in",
    error: "/sign-in",
  },
  providers: [
    GitHub({
      clientId: process.env.GITHUB_ID ?? "",
      clientSecret: process.env.GITHUB_SECRET ?? "",
    }),
  ],
  callbacks: {
    async signIn({ profile }) {
      const login = typeof profile?.login === "string" ? profile.login.toLowerCase() : "";
      return ownerLogins.has(login);
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.name = session.user.name ?? token.name ?? "Owner";
      }
      return session;
    },
  },
});
