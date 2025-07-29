"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Upload, Trash2, Star, StarOff, ImageIcon, X } from "lucide-react"
import { apiClient } from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast" // Import useToast

interface TerrainPhoto {
  id: string
  terrain_id: string
  photo_url: string
  photo_name: string
  description?: string
  is_primary: boolean
  created_at: string
}

interface PhotoGalleryProps {
  terrainId: string
  readonly?: boolean
}

export function PhotoGallery({ terrainId, readonly = false }: PhotoGalleryProps) {
  const [photos, setPhotos] = useState<TerrainPhoto[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [description, setDescription] = useState("")
  const [isPrimary, setIsPrimary] = useState(false)
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [selectedPhoto, setSelectedPhoto] = useState<TerrainPhoto | null>(null)
  const { toast } = useToast() // Initialize useToast

  useEffect(() => {
    loadPhotos()
  }, [terrainId])

  const loadPhotos = async () => {
    try {
      const response = await apiClient.getTerrainPhotos(terrainId)
      setPhotos(response.photos)
    } catch (error: any) {
      console.error("Error loading photos:", error)
      toast({
        title: "Erreur de chargement",
        description: `Impossible de charger les photos: ${error.message || "Erreur inconnue"}`,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setUploading(true)
    try {
      await apiClient.uploadTerrainPhoto(terrainId, selectedFile, description, isPrimary)
      await loadPhotos()
      setShowUploadDialog(false)
      setSelectedFile(null)
      setDescription("")
      setIsPrimary(false)
      toast({
        title: "Succès",
        description: "Photo ajoutée avec succès.",
      })
    } catch (error: any) {
      console.error("Error uploading photo:", error)
      toast({
        title: "Erreur d'upload",
        description: `Impossible d'uploader la photo: ${error.message || "Erreur inconnue"}`,
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (photoId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette photo ?")) return

    try {
      await apiClient.deleteTerrainPhoto(terrainId, photoId)
      await loadPhotos()
      toast({
        title: "Succès",
        description: "Photo supprimée avec succès.",
      })
    } catch (error: any) {
      console.error("Error deleting photo:", error)
      toast({
        title: "Erreur de suppression",
        description: `Impossible de supprimer la photo: ${error.message || "Erreur inconnue"}`,
        variant: "destructive",
      })
    }
  }

  const handleSetPrimary = async (photoId: string) => {
    try {
      await apiClient.setPrimaryPhoto(terrainId, photoId)
      await loadPhotos()
      toast({
        title: "Succès",
        description: "Photo définie comme principale.",
      })
    } catch (error: any) {
      console.error("Error setting primary photo:", error)
      toast({
        title: "Erreur",
        description: `Impossible de définir la photo principale: ${error.message || "Erreur inconnue"}`,
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center">
            <ImageIcon className="h-5 w-5 mr-2" />
            Photos du Terrain ({photos.length})
          </CardTitle>
          {!readonly && (
            <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
              <DialogTrigger asChild>
                <Button className="bg-orange-500 hover:bg-orange-600">
                  <Upload className="h-4 w-4 mr-2" />
                  Ajouter Photo
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Ajouter une Photo</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="photo">Sélectionner une image</Label>
                    <Input id="photo" type="file" accept="image/*" onChange={handleFileSelect} className="mt-1" />
                    <p className="text-sm text-gray-500 mt-1">Formats acceptés: JPG, PNG, GIF. Taille max: 5MB</p>
                  </div>

                  <div>
                    <Label htmlFor="description">Description (optionnel)</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Description de la photo..."
                      className="mt-1"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isPrimary"
                      checked={isPrimary}
                      onChange={(e) => setIsPrimary(e.target.checked)}
                      className="rounded"
                    />
                    <Label htmlFor="isPrimary">Définir comme photo principale</Label>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setShowUploadDialog(false)} disabled={uploading}>
                      Annuler
                    </Button>
                    <Button
                      onClick={handleUpload}
                      disabled={!selectedFile || uploading}
                      className="bg-orange-500 hover:bg-orange-600"
                    >
                      {uploading ? "Upload..." : "Ajouter"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {photos.length === 0 ? (
          <div className="text-center py-8">
            <ImageIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Aucune photo disponible</p>
            {!readonly && <p className="text-sm text-gray-400 mt-2">Cliquez sur "Ajouter Photo" pour commencer</p>}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {photos.map((photo) => (
              <div key={photo.id} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={photo.photo_url || "/placeholder.svg"}
                    alt={photo.description || "Photo du terrain"}
                    className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform"
                    onClick={() => setSelectedPhoto(photo)}
                  />
                </div>

                {/* Badges */}
                <div className="absolute top-2 left-2 flex space-x-1">
                  {photo.is_primary && (
                    <Badge className="bg-yellow-500 text-white">
                      <Star className="h-3 w-3 mr-1" />
                      Principale
                    </Badge>
                  )}
                </div>

                {/* Actions */}
                {!readonly && (
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex space-x-1">
                      {!photo.is_primary && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleSetPrimary(photo.id)}
                          className="h-8 w-8 p-0"
                        >
                          <StarOff className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(photo.id)}
                        className="h-8 w-8 p-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Description */}
                {photo.description && (
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2 text-sm">
                    {photo.description}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Photo Modal */}
        {selectedPhoto && (
          <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
            <DialogContent className="max-w-4xl max-h-[90vh]">
              <DialogHeader>
                <div className="flex justify-between items-center">
                  <DialogTitle>
                    {selectedPhoto.description || "Photo du terrain"}
                    {selectedPhoto.is_primary && <Badge className="ml-2 bg-yellow-500">Principale</Badge>}
                  </DialogTitle>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedPhoto(null)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </DialogHeader>
              <div className="flex justify-center">
                <img
                  src={selectedPhoto.photo_url || "/placeholder.svg"}
                  alt={selectedPhoto.description || "Photo du terrain"}
                  className="max-w-full max-h-[70vh] object-contain"
                />
              </div>
            </DialogContent>
          </Dialog>
        )}
      </CardContent>
    </Card>
  )
}
