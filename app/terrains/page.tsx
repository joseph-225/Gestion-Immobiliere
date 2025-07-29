"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Building2, Plus, Search, Edit, Trash2, Download, ArrowUpDown, Home, Grid, List } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { PhotoGallery } from "@/components/photo-gallery"
import { TerrainCard } from "@/components/terrain-card"
import { apiClient } from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast" // Import useToast

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

const villes = [
  "Abidjan",
  "Bouaké",
  "Daloa",
  "Yamoussoukro",
  "San-Pédro",
  "Korhogo",
  "Man",
  "Divo",
  "Gagnoa",
  "Abengourou",
]

const communesParVille: Record<string, string[]> = {
  Abidjan: [
    "Cocody",
    "Plateau",
    "Marcory",
    "Treichville",
    "Adjamé",
    "Yopougon",
    "Abobo",
    "Koumassi",
    "Port-Bouët",
    "Attécoubé",
  ],
  Bouaké: ["Bouaké Centre", "Gonfreville", "Koko", "Belleville", "Air France"],
  Daloa: ["Daloa Centre", "Tazibouo", "Gbeleban", "Lobia"],
  Yamoussoukro: ["Yamoussoukro Centre", "Habitat", "Millionnaire", "N'Zuessy"],
  "San-Pédro": ["San-Pédro Centre", "Balmer", "Bardot", "Wharf"],
  Korhogo: ["Korhogo Centre", "Petit Paris", "Résidentiel", "Commerce"],
  Man: ["Man Centre", "Libreville", "Gbangbégouiné", "Zadépleu"],
  Divo: ["Divo Centre", "Hiré", "Zégo", "Didizo"],
  Gagnoa: ["Gagnoa Centre", "Dignago", "Guibéroua", "Bayota"],
  Abengourou: ["Abengourou Centre", "Aniassué", "Zaranou", "Ebilassokro"],
}

export default function TerrainsPage() {
  const [terrains, setTerrains] = useState<Terrain[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid")
  const [filters, setFilters] = useState({
    statut: "all",
    ville: "all",
    commune: "all",
    superficieMin: "",
    superficieMax: "",
    prixAchatMin: "",
    prixAchatMax: "",
    dateFrom: "", // Ajout du filtre dateFrom
    dateTo: "", // Ajout du filtre dateTo
  })
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" } | null>(null)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingTerrain, setEditingTerrain] = useState<Terrain | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalTerrains, setTotalTerrains] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const itemsPerPage = viewMode === "grid" ? 12 : 10
  const router = useRouter()
  const { data: session, status } = useSession()
  const { toast } = useToast() // Initialize useToast

  // Fetch terrains from API
  const fetchTerrains = useCallback(async () => {
    setLoading(true)
    try {
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        ville: filters.ville,
        commune: filters.commune,
        statut: filters.statut,
        superficieMin: filters.superficieMin,
        superficieMax: filters.superficieMax,
        prixAchatMin: filters.prixAchatMin,
        prixAchatMax: filters.prixAchatMax,
        dateFrom: filters.dateFrom, // Passage du filtre dateFrom
        dateTo: filters.dateTo, // Passage du filtre dateTo
        searchTerm: searchTerm,
        sortKey: sortConfig?.key,
        sortDirection: sortConfig?.direction,
      }
      const response = await apiClient.getTerrains(params)
      setTerrains(response.terrains)
      setTotalTerrains(response.pagination.total)
      setTotalPages(response.pagination.totalPages)
    } catch (error: any) {
      console.error("Error fetching terrains:", error)
      toast({
        title: "Erreur de chargement",
        description: `Impossible de charger les terrains: ${error.message || "Erreur inconnue"}`,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [currentPage, itemsPerPage, filters, searchTerm, sortConfig, toast])

  // Trigger fetch when filters, search, sort, or pagination changes
  useEffect(() => {
    fetchTerrains()
  }, [fetchTerrains])

  // Check authentication
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/")
    }
  }, [status, router])

  const handleSort = (key: string) => {
    setSortConfig((current) => ({
      key,
      direction: current?.key === key && current.direction === "asc" ? "desc" : "asc",
    }))
    setCurrentPage(1) // Reset to first page on sort change
  }

  const handleAddTerrain = async (newTerrain: Omit<Terrain, "id">) => {
    try {
      await apiClient.createTerrain(newTerrain)
      setShowAddDialog(false)
      fetchTerrains() // Re-fetch data after adding
      toast({
        title: "Succès",
        description: "Terrain ajouté avec succès.",
      })
    } catch (error: any) {
      console.error("Error adding terrain:", error)
      toast({
        title: "Erreur d'ajout",
        description: `Impossible d'ajouter le terrain: ${error.message || "Erreur inconnue"}`,
        variant: "destructive",
      })
    }
  }

  const handleEditTerrain = async (updatedTerrain: Terrain) => {
    try {
      await apiClient.updateTerrain(updatedTerrain.id, updatedTerrain)
      setEditingTerrain(null)
      fetchTerrains() // Re-fetch data after editing
      toast({
        title: "Succès",
        description: "Terrain modifié avec succès.",
      })
    } catch (error: any) {
      console.error("Error editing terrain:", error)
      toast({
        title: "Erreur de modification",
        description: `Impossible de modifier le terrain: ${error.message || "Erreur inconnue"}`,
        variant: "destructive",
      })
    }
  }

  const handleDeleteTerrain = async (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce terrain ?")) {
      try {
        await apiClient.deleteTerrain(id)
        fetchTerrains() // Re-fetch data after deleting
        toast({
          title: "Succès",
          description: "Terrain supprimé avec succès.",
        })
      } catch (error: any) {
        console.error("Error deleting terrain:", error)
        toast({
          title: "Erreur de suppression",
          description: `Impossible de supprimer le terrain: ${error.message || "Erreur inconnue"}`,
          variant: "destructive",
        })
      }
    }
  }

  const exportToCSV = () => {
    // For CSV export, we might want to fetch all data without pagination/limit
    // Or just export the currently filtered/sorted data.
    // For simplicity, let's export the currently displayed `terrains` array.
    const headers = [
      "ID",
      "Ville",
      "Commune",
      "Quartier",
      "Superficie (m²)",
      "Prix Achat (FCFA)",
      "Date Achat",
      "Vendeur Initial",
      "Statut",
      "Prix Vente (FCFA)",
      "Date Vente",
      "Acheteur Final",
    ]

    const csvContent = [
      headers.join(","),
      ...terrains.map(
        (
          terrain, // Use `terrains` (currently displayed)
        ) =>
          [
            terrain.id,
            terrain.ville,
            terrain.commune,
            terrain.quartier,
            terrain.superficie,
            terrain.prixAchat,
            terrain.dateAchat,
            terrain.vendeurInitial,
            terrain.statut,
            terrain.prixVente || "",
            terrain.dateVente || "",
            terrain.acheteurFinal || "",
          ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "terrains.csv"
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR").format(amount) + " FCFA"
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/dashboard" className="flex items-center mr-4">
                <Home className="h-5 w-5 text-gray-500 hover:text-orange-500" />
              </Link>
              <Building2 className="h-8 w-8 text-orange-500 mr-3" />
              <h1 className="text-xl font-bold text-gray-900">Gestion des Terrains</h1>
            </div>
            <div className="flex items-center space-x-4">
              {/* View Mode Toggle */}
              <div className="flex border rounded-lg">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="rounded-r-none"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "table" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("table")}
                  className="rounded-l-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>

              <Button onClick={exportToCSV} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exporter CSV
              </Button>
              <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-orange-500 hover:bg-orange-600">
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter Terrain
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Ajouter un Nouveau Terrain</DialogTitle>
                  </DialogHeader>
                  <TerrainForm onSubmit={handleAddTerrain} />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Search className="h-5 w-5 mr-2" />
              Recherche et Filtres
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div>
                <Label htmlFor="search">Recherche globale</Label>
                <Input
                  id="search"
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="statut">Statut</Label>
                <Select
                  value={filters.statut}
                  onValueChange={(value) => setFilters((prev) => ({ ...prev, statut: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Tous les statuts" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="Disponible">Disponible</SelectItem>
                    <SelectItem value="Vendu">Vendu</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="ville">Ville</Label>
                <Select
                  value={filters.ville}
                  onValueChange={(value) => setFilters((prev) => ({ ...prev, ville: value, commune: "all" }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Toutes les villes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les villes</SelectItem>
                    {villes.map((ville) => (
                      <SelectItem key={ville} value={ville}>
                        {ville}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="commune">Commune</Label>
                <Select
                  value={filters.commune}
                  onValueChange={(value) => setFilters((prev) => ({ ...prev, commune: value }))}
                  disabled={filters.ville === "all"}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Toutes les communes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les communes</SelectItem>
                    {filters.ville !== "all" &&
                      communesParVille[filters.ville]?.map((commune) => (
                        <SelectItem key={commune} value={commune}>
                          {commune}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="superficieMin">Superficie min (m²)</Label>
                <Input
                  id="superficieMin"
                  type="number"
                  placeholder="Min"
                  value={filters.superficieMin}
                  onChange={(e) => setFilters((prev) => ({ ...prev, superficieMin: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="superficieMax">Superficie max (m²)</Label>
                <Input
                  id="superficieMax"
                  type="number"
                  placeholder="Max"
                  value={filters.superficieMax}
                  onChange={(e) => setFilters((prev) => ({ ...prev, superficieMax: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="prixMin">Prix min (FCFA)</Label>
                <Input
                  id="prixMin"
                  type="number"
                  placeholder="Prix minimum"
                  value={filters.prixAchatMin}
                  onChange={(e) => setFilters((prev) => ({ ...prev, prixAchatMin: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="prixMax">Prix max (FCFA)</Label>
                <Input
                  id="prixMax"
                  type="number"
                  placeholder="Prix maximum"
                  value={filters.prixAchatMax}
                  onChange={(e) => setFilters((prev) => ({ ...prev, prixAchatMax: e.target.value }))}
                />
              </div>
            </div>

            {/* Nouvelle ligne pour les filtres de date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <Label htmlFor="dateFrom">Date d'achat (Début)</Label>
                <Input
                  id="dateFrom"
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters((prev) => ({ ...prev, dateFrom: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="dateTo">Date d'achat (Fin)</Label>
                <Input
                  id="dateTo"
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => setFilters((prev) => ({ ...prev, dateTo: e.target.value }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <Card>
          <CardHeader>
            <CardTitle>
              Terrains ({totalTerrains} résultat{totalTerrains !== 1 ? "s" : ""})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-48">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
                <span className="ml-4 text-lg text-gray-600">Chargement des terrains...</span>
              </div>
            ) : terrains.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>Aucun terrain trouvé avec les filtres actuels.</p>
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {terrains.map((terrain) => (
                  <TerrainCard
                    key={terrain.id}
                    terrain={terrain}
                    onEdit={setEditingTerrain}
                    onDelete={handleDeleteTerrain}
                  />
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">
                        <Button variant="ghost" size="sm" onClick={() => handleSort("id")}>
                          ID <ArrowUpDown className="h-4 w-4 ml-1" />
                        </Button>
                      </th>
                      <th className="text-left p-2">
                        <Button variant="ghost" size="sm" onClick={() => handleSort("ville")}>
                          Localisation <ArrowUpDown className="h-4 w-4 ml-1" />
                        </Button>
                      </th>
                      <th className="text-left p-2">
                        <Button variant="ghost" size="sm" onClick={() => handleSort("superficie")}>
                          Superficie <ArrowUpDown className="h-4 w-4 ml-1" />
                        </Button>
                      </th>
                      <th className="text-left p-2">
                        <Button variant="ghost" size="sm" onClick={() => handleSort("prixAchat")}>
                          Prix Achat <ArrowUpDown className="h-4 w-4 ml-1" />
                        </Button>
                      </th>
                      <th className="text-left p-2">
                        <Button variant="ghost" size="sm" onClick={() => handleSort("statut")}>
                          Statut <ArrowUpDown className="h-4 w-4 ml-1" />
                        </Button>
                      </th>
                      <th className="text-left p-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {terrains.map((terrain) => (
                      <tr
                        key={terrain.id}
                        className={`border-b ${
                          terrain.statut === "Vendu" ? "bg-green-50 hover:bg-green-100" : "hover:bg-gray-50"
                        }`}
                      >
                        <td className="p-2 font-mono text-sm">{terrain.id}</td>
                        <td className="p-2">
                          <div className="text-sm">
                            <div className="font-medium">{terrain.ville}</div>
                            <div className="text-gray-500">
                              {terrain.commune}, {terrain.quartier}
                            </div>
                          </div>
                        </td>
                        <td className="p-2">{terrain.superficie} m²</td>
                        <td className="p-2">{formatCurrency(terrain.prixAchat)}</td>
                        <td className="p-2">
                          <Badge className={terrain.statut === "Disponible" ? "badge-disponible" : "badge-vendu"}>
                            {terrain.statut}
                          </Badge>
                        </td>
                        <td className="p-2">
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm" onClick={() => setEditingTerrain(terrain)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteTerrain(terrain.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 mt-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Précédent
                </Button>
                <span className="text-sm text-gray-600">
                  Page {currentPage} sur {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Suivant
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Dialog */}
      {editingTerrain && (
        <Dialog open={!!editingTerrain} onOpenChange={() => setEditingTerrain(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Modifier le Terrain {editingTerrain.id}</DialogTitle>
            </DialogHeader>
            <TerrainForm terrain={editingTerrain} onSubmit={handleEditTerrain} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

// Terrain Form Component
function TerrainForm({
  terrain,
  onSubmit,
}: {
  terrain?: Terrain
  onSubmit: (terrain: any) => void
}) {
  const [formData, setFormData] = useState({
    ville: terrain?.ville || "Abidjan",
    commune: terrain?.commune || "",
    quartier: terrain?.quartier || "",
    superficie: terrain?.superficie?.toString() || "",
    prixAchat: terrain?.prixAchat?.toString() || "",
    dateAchat: terrain?.dateAchat || "",
    vendeurInitial: terrain?.vendeurInitial || "",
    statut: terrain?.statut || "Disponible",
    prixVente: terrain?.prixVente?.toString() || "",
    dateVente: terrain?.dateVente || "",
    acheteurFinal: terrain?.acheteurFinal || "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const terrainData = {
      ...formData,
      superficie: Number.parseInt(formData.superficie),
      prixAchat: Number.parseInt(formData.prixAchat),
      prixVente: formData.prixVente ? Number.parseInt(formData.prixVente) : undefined,
      ...(terrain && { id: terrain.id }),
    }

    onSubmit(terrainData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="ville">Ville *</Label>
          <Select
            value={formData.ville}
            onValueChange={(value) => setFormData((prev) => ({ ...prev, ville: value, commune: "" }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner une ville" />
            </SelectTrigger>
            <SelectContent>
              {villes.map((ville) => (
                <SelectItem key={ville} value={ville}>
                  {ville}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="commune">Commune *</Label>
          <Select
            value={formData.commune}
            onValueChange={(value) => setFormData((prev) => ({ ...prev, commune: value }))}
            disabled={!formData.ville}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner une commune" />
            </SelectTrigger>
            <SelectContent>
              {formData.ville &&
                communesParVille[formData.ville]?.map((commune) => (
                  <SelectItem key={commune} value={commune}>
                    {commune}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="quartier">Quartier *</Label>
          <Input
            id="quartier"
            value={formData.quartier}
            onChange={(e) => setFormData((prev) => ({ ...prev, quartier: e.target.value }))}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="superficie">Superficie (m²) *</Label>
          <Input
            id="superficie"
            type="number"
            value={formData.superficie}
            onChange={(e) => setFormData((prev) => ({ ...prev, superficie: e.target.value }))}
            required
          />
        </div>

        <div>
          <Label htmlFor="prixAchat">Prix d'Achat (FCFA) *</Label>
          <Input
            id="prixAchat"
            type="number"
            value={formData.prixAchat}
            onChange={(e) => setFormData((prev) => ({ ...prev, prixAchat: e.target.value }))}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="dateAchat">Date d'Achat *</Label>
          <Input
            id="dateAchat"
            type="date"
            value={formData.dateAchat}
            onChange={(e) => setFormData((prev) => ({ ...prev, dateAchat: e.target.value }))}
            required
          />
        </div>

        <div>
          <Label htmlFor="vendeurInitial">Vendeur Initial *</Label>
          <Input
            id="vendeurInitial"
            value={formData.vendeurInitial}
            onChange={(e) => setFormData((prev) => ({ ...prev, vendeurInitial: e.target.value }))}
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="statut">Statut *</Label>
        <Select
          value={formData.statut}
          onValueChange={(value) => setFormData((prev) => ({ ...prev, statut: value as "Disponible" | "Vendu" }))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Disponible">Disponible</SelectItem>
            <SelectItem value="Vendu">Vendu</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {formData.statut === "Vendu" && (
        <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium">Informations de Vente</h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="prixVente">Prix de Vente (FCFA) *</Label>
              <Input
                id="prixVente"
                type="number"
                value={formData.prixVente}
                onChange={(e) => setFormData((prev) => ({ ...prev, prixVente: e.target.value }))}
                required={formData.statut === "Vendu"}
              />
            </div>

            <div>
              <Label htmlFor="dateVente">Date de Vente *</Label>
              <Input
                id="dateVente"
                type="date"
                value={formData.dateVente}
                onChange={(e) => setFormData((prev) => ({ ...prev, dateVente: e.target.value }))}
                required={formData.statut === "Vendu"}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="acheteurFinal">Acheteur Final *</Label>
            <Input
              id="acheteurFinal"
              value={formData.acheteurFinal}
              onChange={(e) => setFormData((prev) => ({ ...prev, acheteurFinal: e.target.value }))}
              required={formData.statut === "Vendu"}
            />
          </div>
        </div>
      )}

      <div className="flex justify-end space-x-2">
        <Button type="submit" className="bg-orange-500 hover:bg-orange-600">
          {terrain ? "Modifier" : "Ajouter"}
        </Button>
      </div>

      {/* Ajouter cette section pour les photos si on modifie un terrain existant */}
      {terrain && (
        <div className="mt-6 pt-6 border-t">
          <PhotoGallery terrainId={terrain.id} />
        </div>
      )}
    </form>
  )
}
