"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { ImageIcon } from "lucide-react"
import { apiClient } from "@/lib/api-client"

interface PhotoIndicatorProps {
  terrainId: string
}

export function PhotoIndicator({ terrainId }: PhotoIndicatorProps) {
  const [photoCount, setPhotoCount] = useState<number>(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPhotoCount()
  }, [terrainId])

  const loadPhotoCount = async () => {
    try {
      const response = await apiClient.getTerrainPhotos(terrainId)
      setPhotoCount(response.photos.length)
    } catch (error) {
      console.error("Error loading photo count:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="w-4 h-4 animate-pulse bg-gray-200 rounded"></div>
  }

  return (
    <Badge variant={photoCount > 0 ? "default" : "secondary"} className="flex items-center">
      <ImageIcon className="h-3 w-3 mr-1" />
      {photoCount}
    </Badge>
  )
}
