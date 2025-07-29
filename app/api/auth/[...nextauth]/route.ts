import NextAuth, { type NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { getUserByUsername, updateUserLastLogin, updateUserVerificationStatus } from "@/lib/db"
import bcrypt from "bcryptjs"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Nom d'utilisateur", type: "text" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null
        }

        try {
          console.log("Tentative de connexion avec :", credentials)
          const user = await getUserByUsername(credentials.username)
          console.log("Utilisateur trouvé :", user)

          if (!user) {
            console.log("Utilisateur non trouvé")
            return null
          }

          const isValidPassword = await bcrypt.compare(credentials.password, user.password_hash)
          console.log("Mot de passe valide ?", isValidPassword)

          if (!isValidPassword) {
            console.log("Mot de passe invalide")
            return null
          }

          // Update last login
          await updateUserLastLogin(user.username)

          // Return user object to be stored in JWT
          return {
            id: user.id.toString(), // NextAuth expects string ID
            name: user.username,
            email: user.email,
          }
        } catch (error) {
          console.error("Authentication error:", error)
          return null
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.username = user.name
        token.email = user.email
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        // S'assurer que session.user existe et a la bonne forme
        if (!session.user) session.user = {} as any;
        (session.user as any).id = token.id as string;
        (session.user as any).username = token.username as string;
        (session.user as any).email = token.email as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/", // Redirect to home page for login
    error: "/", // Redirect to home page for errors
  },
  secret: process.env.NEXTAUTH_SECRET,
}


const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
