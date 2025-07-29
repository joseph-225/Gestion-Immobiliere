import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]/route"
import { getUserById, getUserByUsername, getUserByEmail, updateUser } from "@/lib/db"
import { hashPassword } from "@/lib/auth"

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
  }

  try {
    const user = await getUserById(session.user.id)
    if (!user) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 })
    }

    // Return user data, but omit password hash for security
    const { password_hash, ...userData } = user
    return NextResponse.json({ user: userData })
  } catch (error) {
    console.error("Error fetching user profile:", error)
    return NextResponse.json({ error: "Erreur lors de la récupération du profil utilisateur" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
  }

  try {
    const { username, email, password } = await request.json()
    const userId = session.user.id

    const currentUser = await getUserById(userId)
    if (!currentUser) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 })
    }

    const updateData: { username?: string; email?: string; password_hash?: string } = {}

    if (username !== undefined && username !== currentUser.username) {
      const existingUser = await getUserByUsername(username)
      if (existingUser && existingUser.id !== userId) {
        return NextResponse.json({ error: "Ce nom d'utilisateur est déjà pris" }, { status: 409 })
      }
      updateData.username = username
    }

    if (email !== undefined && email !== currentUser.email) {
      const existingUser = await getUserByEmail(email)
      if (existingUser && existingUser.id !== userId) {
        return NextResponse.json({ error: "Cet email est déjà enregistré" }, { status: 409 })
      }
      updateData.email = email
    }

    if (password) {
      updateData.password_hash = await hashPassword(password)
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ success: true, message: "Aucune modification à enregistrer" })
    }

    const updatedUser = await updateUser(userId, updateData)

    // Invalidate session if username/password/email changes for security
    // NextAuth will require re-login.
    return NextResponse.json({
      success: true,
      message: "Profil mis à jour avec succès. Veuillez vous reconnecter.",
      user: updatedUser,
    })
  } catch (error) {
    console.error("Error updating user profile:", error)
    return NextResponse.json({ error: "Erreur lors de la mise à jour du profil" }, { status: 500 })
  }
}
