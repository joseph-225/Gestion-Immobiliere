import { type NextRequest, NextResponse } from "next/server"
import { put } from "@vercel/blob"
import { getTerrainPhotos, addTerrainPhoto, getTerrainById } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "../../../auth/[...nextauth]/route"

// GET /api/terrains/[id]/photos - Get all photos for a terrain
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
  }
  try {
    const photos = await getTerrainPhotos(params.id)
    return NextResponse.json({ photos })
  } catch (error) {
    console.error("Error fetching terrain photos:", error)
    return NextResponse.json({ error: "Erreur lors de la récupération des photos" }, { status: 500 })
  }
}

// POST /api/terrains/[id]/photos - Upload new photo
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
  }
  try {
    // Check if terrain exists
    const terrain = await getTerrainById(params.id)
    if (!terrain) {
      return NextResponse.json({ error: "Terrain non trouvé" }, { status: 404 })
    }

    const formData = await request.formData()
    const file = formData.get("photo") as File
    const description = formData.get("description") as string
    const isPrimary = formData.get("isPrimary") === "true"

    if (!file) {
      return NextResponse.json({ error: "Aucun fichier fourni" }, { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Le fichier doit être une image" }, { status: 400 })
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "La taille du fichier ne doit pas dépasser 5MB" }, { status: 400 })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const extension = file.name.split(".").pop()
    const filename = `terrain-${params.id}-${timestamp}.${extension}`

    // Upload to Vercel Blob
    const blob = await put(filename, file, {
      access: "public",
    })

    // Save to database
    const photo = await addTerrainPhoto(params.id, blob.url, filename, description, isPrimary)

    return NextResponse.json({
      success: true,
      photo,
    })
  } catch (error) {
    console.error("Error uploading photo:", error)
    return NextResponse.json({ error: "Erreur lors de l'upload de la photo" }, { status: 500 })
  }
}
