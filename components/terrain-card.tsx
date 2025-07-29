"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Edit, Trash2, ImageIcon } from "lucide-react"
import { TerrainMap } from "./terrain-map"

interface Terrain {
  id: string
  ville: string
  commune: string
  quartier: string
  superficie: number
  prixAchat: number
  dateAchat: string
  vendeurInitial: string
  statut: "Disponible" | "Vendu"
  prixVente?: number
  dateVente?: string
  acheteurFinal?: string
}

interface TerrainCardProps {
  terrain: Terrain
  onEdit?: (terrain: Terrain) => void
  onDelete?: (id: string) => void
  showActions?: boolean
}

export function TerrainCard({ terrain, onEdit, onDelete, showActions = true }: TerrainCardProps) {
  const [showMap, setShowMap] = useState(false)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR").format(amount) + " FCFA"
  }

  const calculateProfit = () => {
    if (terrain.statut === "Vendu" && terrain.prixVente) {
      return terrain.prixVente - terrain.prixAchat
    }
    return 0
  }

  const calculateMargin = () => {
    if (terrain.statut === "Vendu" && terrain.prixVente) {
      return ((terrain.prixVente - terrain.prixAchat) / terrain.prixAchat) * 100
    }
    return 0
  }

  return (
    <>
      <Card
        className={`hover:shadow-lg transition-shadow ${
          terrain.statut === "Vendu" ? "border-green-300 bg-green-50" : ""
        }`}
      >
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg font-semibold">{terrain.id}</CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                {terrain.ville}, {terrain.commune}
              </p>
              <p className="text-xs text-gray-500">{terrain.quartier}</p>
            </div>
            <Badge className={terrain.statut === "Disponible" ? "badge-disponible" : "badge-vendu"}>
              {terrain.statut}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Informations principales */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Superficie</p>
              <p className="font-medium">{terrain.superficie} m²</p>
            </div>
            <div>
              <p className="text-gray-600">Prix d'achat</p>
              <p className="font-medium">{formatCurrency(terrain.prixAchat)}</p>
            </div>
            <div>
              <p className="text-gray-600">Date d'achat</p>
              <p className="font-medium">{new Date(terrain.dateAchat).toLocaleDateString("fr-FR")}</p>
            </div>
            <div>
              <p className="text-gray-600">Vendeur</p>
              <p className="font-medium text-xs">{terrain.vendeurInitial}</p>
            </div>
          </div>

          {/* Informations de vente si vendu */}
          {terrain.statut === "Vendu" && terrain.prixVente && (
            <div className="border-t pt-4 space-y-2">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Prix de vente</p>
                  <p className="font-medium text-green-600">{formatCurrency(terrain.prixVente)}</p>
                </div>
                <div>
                  <p className="text-gray-600">Date de vente</p>
                  <p className="font-medium">{new Date(terrain.dateVente!).toLocaleDateString("fr-FR")}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Bénéfice</p>
                  <p className={`font-medium ${calculateProfit() > 0 ? "text-green-600" : "text-red-600"}`}>
                    {formatCurrency(calculateProfit())}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Marge</p>
                  <p className={`font-medium ${calculateMargin() > 0 ? "text-green-600" : "text-red-600"}`}>
                    {calculateMargin().toFixed(1)}%
                  </p>
                </div>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Acheteur</p>
                <p className="font-medium text-sm">{terrain.acheteurFinal}</p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-2 pt-4 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowMap(true)}
              className="flex items-center bg-orange-50 hover:bg-orange-100 text-orange-700 border-orange-200"
            >
              <MapPin className="h-4 w-4 mr-2" />
              Voir sur la carte
            </Button>

            {showActions && (
              <>
                <Button variant="outline" size="sm" onClick={() => onEdit?.(terrain)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Modifier
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDelete?.(terrain.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Supprimer
                </Button>
              </>
            )}

            <Button variant="outline" size="sm" className="ml-auto bg-transparent">
              <ImageIcon className="h-4 w-4 mr-2" />
              Photos
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Modal de la carte */}
      <TerrainMap terrain={terrain} isOpen={showMap} onClose={() => setShowMap(false)} />
    </>
  )
}
