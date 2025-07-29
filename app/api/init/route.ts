import { type NextRequest, NextResponse } from "next/server"
import { initializeDatabase, createUser } from "@/lib/db"
import { hashPassword } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    // Initialize database
    await initializeDatabase()

    // Create default admin user (if not exists)
    const defaultPassword = await hashPassword("immobilier2024")

    try {
      // Check if user 'agent' exists
      const existingUser = await createUser("agent", defaultPassword, "agent@immobilier.ci")
      if (existingUser) {
        console.log("Default user 'agent' created or already exists.")
      }
    } catch (error) {
      // If user 'agent' already exists due to unique constraint, log it but don't fail
      if (error.message.includes("duplicate key value violates unique constraint")) {
        console.log("Default user 'agent' already exists.")
      } else {
        console.error("Error creating default user:", error)
      }
    }

    return NextResponse.json({
      success: true,
      message: "Base de données initialisée avec succès",
    })
  } catch (error) {
    console.error("Database initialization error:", error)
    return NextResponse.json({ error: "Erreur lors de l'initialisation de la base de données" }, { status: 500 })
  }
}
