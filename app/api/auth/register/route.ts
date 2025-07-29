import { NextResponse } from "next/server"
import { createUser, getUserByUsername, getUserByEmail, createEmailVerificationToken } from "@/lib/db"
import { hashPassword } from "@/lib/auth"
import { sendEmail, getVerificationEmailTemplate } from "@/lib/email"

export async function POST(request: Request) {
  try {
    const { username, email, password } = await request.json()

    if (!username || !email || !password) {
      return NextResponse.json(
        { error: "Nom d'utilisateur, email et mot de passe sont requis" },
        { status: 400 }
      )
    }

    // Check if username or email already exists
    const existingUserByUsername = await getUserByUsername(username)
    if (existingUserByUsername) {
      return NextResponse.json(
        { error: "Ce nom d'utilisateur est déjà pris" },
        { status: 409 }
      )
    }

    const existingUserByEmail = await getUserByEmail(email)
    if (existingUserByEmail) {
      return NextResponse.json(
        { error: "Cet email est déjà enregistré" },
        { status: 409 }
      )
    }

    const hashedPassword = await hashPassword(password)
    const newUser = await createUser(username, hashedPassword, email)

    // Vérification que l'email de l'utilisateur existe
    if (!newUser.email) {
      return NextResponse.json(
        { error: "Erreur interne: l'email de l'utilisateur n'a pas été défini." },
        { status: 500 }
      )
    }

    // Generate and send email verification token
    const verificationToken = await createEmailVerificationToken(newUser.id)
    const verificationLink = `${process.env.NEXTAUTH_URL}/api/auth/verify-email?token=${verificationToken.token}`
    const { html, text } = getVerificationEmailTemplate(newUser.username, verificationLink)

    await sendEmail({
      to: newUser.email,
      subject: "Vérification de votre compte Immobilier CI",
      html,
      text,
    })

    return NextResponse.json(
      {
        success: true,
        message: "Compte créé avec succès. Veuillez vérifier votre e-mail pour activer votre compte.",
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error during registration:", error)
    return NextResponse.json(
      { error: "Erreur lors de l'inscription", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
