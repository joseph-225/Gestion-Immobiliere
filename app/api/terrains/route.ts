import { type NextRequest, NextResponse } from "next/server"
import { getAllTerrains, createTerrain } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]/route"
import { validateTerrainData } from "@/lib/middleware"

// GET /api/terrains - Get all terrains
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
  }
  try {
    const { searchParams } = new URL(request.url)

    // Get query parameters for filtering and pagination
    const ville = searchParams.get("ville") || undefined
    const commune = searchParams.get("commune") || undefined
    const statut = (searchParams.get("statut") as "Disponible" | "Vendu" | "all") || undefined
    const superficieMin = searchParams.get("superficieMin")
      ? Number.parseInt(searchParams.get("superficieMin")!)
      : undefined
    const superficieMax = searchParams.get("superficieMax")
      ? Number.parseInt(searchParams.get("superficieMax")!)
      : undefined
    const prixAchatMin = searchParams.get("prixAchatMin")
      ? Number.parseInt(searchParams.get("prixAchatMin")!)
      : undefined
    const prixAchatMax = searchParams.get("prixAchatMax")
      ? Number.parseInt(searchParams.get("prixAchatMax")!)
      : undefined
    const dateFrom = searchParams.get("dateFrom") || undefined // Récupération du filtre dateFrom
    const dateTo = searchParams.get("dateTo") || undefined // Récupération du filtre dateTo
    const searchTerm = searchParams.get("searchTerm") || undefined

    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    const sortKey = searchParams.get("sortKey") || undefined
    const sortDirection = (searchParams.get("sortDirection") as "asc" | "desc") || undefined

    const filters = {
      ville,
      commune,
      statut,
      superficieMin,
      superficieMax,
      prixAchatMin,
      prixAchatMax,
      dateFrom, // Passage du filtre dateFrom
      dateTo, // Passage du filtre dateTo
      searchTerm,
    }

    const sortConfig = sortKey && sortDirection ? { key: sortKey, direction: sortDirection } : null

    const { terrains, total } = await getAllTerrains(filters, sortConfig, page, limit)

    return NextResponse.json({
      terrains: terrains,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching terrains:", error)
    return NextResponse.json({ error: "Erreur lors de la récupération des terrains" }, { status: 500 })
  }
}

// POST /api/terrains - Create new terrain
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
  }
  try {
    const data = await request.json()

    // Validate data
    const errors = validateTerrainData(data)
    if (errors.length > 0) {
      return NextResponse.json({ error: "Données invalides", details: errors }, { status: 400 })
    }

    const terrain = await createTerrain(data)

    return NextResponse.json(
      {
        success: true,
        terrain,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating terrain:", error)
    return NextResponse.json({ error: "Erreur lors de la création du terrain" }, { status: 500 })
  }
}
