import { type NextRequest, NextResponse } from "next/server"
import { getTerrainById, updateTerrain, deleteTerrain } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"

// GET /api/terrains/[id] - Get terrain by ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
  }
  try {
    const terrain = await getTerrainById(params.id)

    if (!terrain) {
      return NextResponse.json({ error: "Terrain non trouvé" }, { status: 404 })
    }

    return NextResponse.json({ terrain })
  } catch (error) {
    console.error("Error fetching terrain:", error)
    return NextResponse.json({ error: "Erreur lors de la récupération du terrain" }, { status: 500 })
  }
}

// PUT /api/terrains/[id] - Update terrain
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
  }
  try {
    const data = await request.json()

    // Check if terrain exists
    const existingTerrain = await getTerrainById(params.id)
    if (!existingTerrain) {
      return NextResponse.json({ error: "Terrain non trouvé" }, { status: 404 })
    }

    // Validate data (partial validation for updates)
    const mergedData = { ...existingTerrain, ...data }
    // const errors = validateTerrainData(mergedData)
    // if (errors.length > 0) {
    //   return NextResponse.json({ error: "Données invalides", details: errors }, { status: 400 })
    // }

    const updatedTerrain = await updateTerrain(params.id, data)

    return NextResponse.json({
      success: true,
      terrain: updatedTerrain,
    })
  } catch (error) {
    console.error("Error updating terrain:", error)
    return NextResponse.json({ error: "Erreur lors de la mise à jour du terrain" }, { status: 500 })
  }
}

// DELETE /api/terrains/[id] - Delete terrain
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
  }
  try {
    const success = await deleteTerrain(params.id)

    if (!success) {
      return NextResponse.json({ error: "Terrain non trouvé" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Terrain supprimé avec succès",
    })
  } catch (error) {
    console.error("Error deleting terrain:", error)
    return NextResponse.json({ error: "Erreur lors de la suppression du terrain" }, { status: 500 })
  }
}
