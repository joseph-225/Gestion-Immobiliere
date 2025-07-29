import { NextRequest, NextResponse } from "next/server"
import { getVerificationToken, deleteVerificationToken, updateUserVerificationStatus } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get("token")

    if (!token) {
      return NextResponse.json(
        { error: "Token de vérification manquant" },
        { status: 400 }
      )
    }

    // Récupérer le token de vérification
    const verificationToken = await getVerificationToken(token)
    if (!verificationToken) {
      return NextResponse.json(
        { error: "Token de vérification invalide ou expiré" },
        { status: 400 }
      )
    }

    // Vérifier si le token n'a pas expiré
    if (new Date() > new Date(verificationToken.expires_at)) {
      // Supprimer le token expiré
      await deleteVerificationToken(verificationToken.id)
      return NextResponse.json(
        { error: "Token de vérification expiré" },
        { status: 400 }
      )
    }

    // Marquer l'utilisateur comme vérifié
    await updateUserVerificationStatus(verificationToken.user_id, true)

    // Supprimer le token utilisé
    await deleteVerificationToken(verificationToken.id)

    return NextResponse.json({
      success: true,
      message: "Email vérifié avec succès. Vous pouvez maintenant vous connecter.",
    })
  } catch (error) {
    console.error("Error during email verification:", error)
    return NextResponse.json(
      { error: "Erreur lors de la vérification de l'email" },
      { status: 500 }
    )
  }
}
