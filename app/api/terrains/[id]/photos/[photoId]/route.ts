import { type NextRequest, NextResponse } from "next/server"
import { del } from "@vercel/blob"
import { deleteTerrainPhoto, setPrimaryPhoto } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "../../../../auth/[...nextauth]/route"

// DELETE /api/terrains/[id]/photos/[photoId] - Delete a photo
export async function DELETE(request: NextRequest, { params }: { params: { id: string; photoId: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
  }
  try {
    const deletedPhoto = await deleteTerrainPhoto(params.photoId)

    if (!deletedPhoto) {
      return NextResponse.json({ error: "Photo non trouvée" }, { status: 404 })
    }

    // Delete from Vercel Blob
    try {
      await del(deletedPhoto.photo_url)
    } catch (error) {
      console.warn("Could not delete blob:", error)
    }

    return NextResponse.json({
      success: true,
      message: "Photo supprimée avec succès",
    })
  } catch (error) {
    console.error("Error deleting photo:", error)
    return NextResponse.json({ error: "Erreur lors de la suppression de la photo" }, { status: 500 })
  }
}

// PUT /api/terrains/[id]/photos/[photoId] - Set as primary photo
export async function PUT(request: NextRequest, { params }: { params: { id: string; photoId: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
  }
  try {
    const { action } = await request.json() // Corrected variable name from req to request

    if (action === "setPrimary") {
      await setPrimaryPhoto(params.photoId, params.id)
      return NextResponse.json({
        success: true,
        message: "Photo définie comme principale",
      })
    }

    return NextResponse.json({ error: "Action non reconnue" }, { status: 400 })
  } catch (error) {
    console.error("Error updating photo:", error)
    return NextResponse.json({ error: "Erreur lors de la mise à jour de la photo" }, { status: 500 })
  }
}
