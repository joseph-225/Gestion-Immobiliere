"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { TrendingUp, DollarSign, Building2, MapPin, Home, Calendar, Target, Percent } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useSession } from "next-auth/react"

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

const COLORS = ["#f97316", "#22c55e", "#3b82f6", "#8b5cf6", "#ef4444", "#06b6d4"]

export default function AnalyticsPage() {
  const [terrains, setTerrains] = useState<Terrain[]>([])
  const [dateFilter, setDateFilter] = useState("all")
  const [locationFilter, setLocationFilter] = useState("all")
  const router = useRouter()
  const { data: session, status } = useSession()

  // Check authentication
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/")
    }
  }, [status, router])

  // Initialize with sample data
  useEffect(() => {
    const sampleData: Terrain[] = [
      {
        id: "T001",
        ville: "Abidjan",
        commune: "Cocody",
        quartier: "Riviera",
        superficie: 500,
        prixAchat: 25000000,
        dateAchat: "2023-01-15",
        vendeurInitial: "Kouassi Jean",
        statut: "Vendu",
        prixVente: 35000000,
        dateVente: "2023-06-20",
        acheteurFinal: "Société IMMOCI",
      },
      {
        id: "T002",
        ville: "Abidjan",
        commune: "Marcory",
        quartier: "Zone 4",
        superficie: 300,
        prixAchat: 15000000,
        dateAchat: "2023-03-10",
        vendeurInitial: "Traoré Aminata",
        statut: "Disponible",
      },
      {
        id: "T003",
        ville: "Bouaké",
        commune: "Bouaké Centre",
        quartier: "Commerce",
        superficie: 800,
        prixAchat: 12000000,
        dateAchat: "2023-02-28",
        vendeurInitial: "Famille Bamba",
        statut: "Disponible",
      },
      {
        id: "T004",
        ville: "Abidjan",
        commune: "Plateau",
        quartier: "Centre",
        superficie: 400,
        prixAchat: 30000000,
        dateAchat: "2023-04-15",
        vendeurInitial: "Kone Mariam",
        statut: "Vendu",
        prixVente: 42000000,
        dateVente: "2023-08-10",
        acheteurFinal: "Banque BACI",
      },
      {
        id: "T005",
        ville: "Yamoussoukro",
        commune: "Yamoussoukro Centre",
        quartier: "Habitat",
        superficie: 600,
        prixAchat: 8000000,
        dateAchat: "2023-05-20",
        vendeurInitial: "Ouattara Ibrahim",
        statut: "Vendu",
        prixVente: 11000000,
        dateVente: "2023-09-15",
        acheteurFinal: "Famille Diabaté",
      },
      {
        id: "T006",
        ville: "Daloa",
        commune: "Daloa Centre",
        quartier: "Tazibouo",
        superficie: 1000,
        prixAchat: 6000000,
        dateAchat: "2023-06-01",
        vendeurInitial: "Société AGRO",
        statut: "Disponible",
      },
    ]
    setTerrains(sampleData)
  }, [])

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  // Calculate KPIs
  const kpis = useMemo(() => {
    const terrainsVendus = terrains.filter((t) => t.statut === "Vendu")
    const terrainsDisponibles = terrains.filter((t) => t.statut === "Disponible")

    const totalAchats = terrains.reduce((sum, t) => sum + t.prixAchat, 0)
    const totalVentes = terrainsVendus.reduce((sum, t) => sum + (t.prixVente || 0), 0)
    const beneficeBrut = totalVentes - terrainsVendus.reduce((sum, t) => sum + t.prixAchat, 0)

    const margeMovenne =
      terrainsVendus.length > 0
        ? terrainsVendus.reduce((sum, t) => {
            const marge = ((t.prixVente! - t.prixAchat) / t.prixAchat) * 100
            return sum + marge
          }, 0) / terrainsVendus.length
        : 0

    return {
      totalAchats,
      totalVentes,
      beneficeBrut,
      nombreAcquis: terrains.length,
      nombreVendus: terrainsVendus.length,
      nombreDisponibles: terrainsDisponibles.length,
      margeMovenne,
    }
  }, [terrains])

  // Prepare chart data
  const evolutionData = useMemo(() => {
    const monthlyData: Record<string, { achats: number; ventes: number; month: string }> = {}

    terrains.forEach((terrain) => {
      const achatMonth = new Date(terrain.dateAchat).toLocaleDateString("fr-FR", {
        year: "numeric",
        month: "short",
      })

      if (!monthlyData[achatMonth]) {
        monthlyData[achatMonth] = { achats: 0, ventes: 0, month: achatMonth }
      }
      monthlyData[achatMonth].achats += terrain.prixAchat

      if (terrain.statut === "Vendu" && terrain.dateVente) {
        const venteMonth = new Date(terrain.dateVente).toLocaleDateString("fr-FR", {
          year: "numeric",
          month: "short",
        })

        if (!monthlyData[venteMonth]) {
          monthlyData[venteMonth] = { achats: 0, ventes: 0, month: venteMonth }
        }
        monthlyData[venteMonth].ventes += terrain.prixVente || 0
      }
    })

    return Object.values(monthlyData).sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime())
  }, [terrains])

  const repartitionVilleData = useMemo(() => {
    const villeStats: Record<string, { ville: string; ventes: number; count: number }> = {}

    terrains
      .filter((t) => t.statut === "Vendu")
      .forEach((terrain) => {
        if (!villeStats[terrain.ville]) {
          villeStats[terrain.ville] = { ville: terrain.ville, ventes: 0, count: 0 }
        }
        villeStats[terrain.ville].ventes += terrain.prixVente || 0
        villeStats[terrain.ville].count += 1
      })

    return Object.values(villeStats)
  }, [terrains])

  const repartitionStatutData = useMemo(() => {
    const disponibles = terrains.filter((t) => t.statut === "Disponible").length
    const vendus = terrains.filter((t) => t.statut === "Vendu").length

    return [
      { name: "Disponible", value: disponibles, color: COLORS[0] },
      { name: "Vendu", value: vendus, color: COLORS[1] },
    ]
  }, [terrains])

  const performanceVilleData = useMemo(() => {
    const villePerf: Record<string, { ville: string; benefice: number; achats: number; ventes: number }> = {}

    terrains.forEach((terrain) => {
      if (!villePerf[terrain.ville]) {
        villePerf[terrain.ville] = { ville: terrain.ville, benefice: 0, achats: 0, ventes: 0 }
      }

      villePerf[terrain.ville].achats += terrain.prixAchat

      if (terrain.statut === "Vendu") {
        const vente = terrain.prixVente || 0
        villePerf[terrain.ville].ventes += vente
        villePerf[terrain.ville].benefice += vente - terrain.prixAchat
      }
    })

    return Object.values(villePerf)
  }, [terrains])

  const topTerrainsData = useMemo(() => {
    return terrains
      .filter((t) => t.statut === "Vendu")
      .map((t) => ({
        id: t.id,
        localisation: `${t.ville} - ${t.commune}`,
        benefice: (t.prixVente || 0) - t.prixAchat,
        marge: (((t.prixVente || 0) - t.prixAchat) / t.prixAchat) * 100,
      }))
      .sort((a, b) => b.benefice - a.benefice)
      .slice(0, 5)
  }, [terrains])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR").format(amount) + " FCFA"
  }

  const formatCurrencyShort = (amount: number) => {
    if (amount >= 1000000) {
      return (amount / 1000000).toFixed(1) + "M FCFA"
    }
    return new Intl.NumberFormat("fr-FR").format(amount) + " FCFA"
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
              <BarChart className="h-8 w-8 text-green-500 mr-3" />
              <h1 className="text-xl font-bold text-gray-900">Analyse des Performances</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes périodes</SelectItem>
                  <SelectItem value="2023">2023</SelectItem>
                  <SelectItem value="2024">2024</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 rounded-lg bg-blue-100 mr-4">
                  <DollarSign className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Achats</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrencyShort(kpis.totalAchats)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 rounded-lg bg-green-100 mr-4">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Ventes</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrencyShort(kpis.totalVentes)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 rounded-lg bg-orange-100 mr-4">
                  <Target className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Bénéfice Brut</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrencyShort(kpis.beneficeBrut)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 rounded-lg bg-purple-100 mr-4">
                  <Percent className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Marge Moyenne</p>
                  <p className="text-2xl font-bold text-gray-900">{kpis.margeMovenne.toFixed(1)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Secondary KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <Building2 className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-600 mb-1">Terrains Acquis</p>
              <p className="text-3xl font-bold text-gray-900">{kpis.nombreAcquis}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <TrendingUp className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-600 mb-1">Terrains Vendus</p>
              <p className="text-3xl font-bold text-gray-900">{kpis.nombreVendus}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <MapPin className="h-8 w-8 text-orange-500 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-600 mb-1">Terrains Disponibles</p>
              <p className="text-3xl font-bold text-gray-900">{kpis.nombreDisponibles}</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Evolution Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Évolution des Achats et Ventes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={evolutionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={formatCurrencyShort} />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Line type="monotone" dataKey="achats" stroke="#f97316" strokeWidth={2} name="Achats" />
                  <Line type="monotone" dataKey="ventes" stroke="#22c55e" strokeWidth={2} name="Ventes" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Répartition des Terrains par Statut</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={repartitionStatutData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {repartitionStatutData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Sales by City */}
          <Card>
            <CardHeader>
              <CardTitle>Répartition des Ventes par Ville</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={repartitionVilleData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="ville" />
                  <YAxis tickFormatter={formatCurrencyShort} />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Bar dataKey="ventes" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Performance by City */}
          <Card>
            <CardHeader>
              <CardTitle>Performance par Ville</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={performanceVilleData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="ville" />
                  <YAxis tickFormatter={formatCurrencyShort} />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Bar dataKey="achats" fill="#f97316" name="Achats" />
                  <Bar dataKey="ventes" fill="#22c55e" name="Ventes" />
                  <Bar dataKey="benefice" fill="#8b5cf6" name="Bénéfice" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Top Performing Lands */}
        <Card>
          <CardHeader>
            <CardTitle>Top 5 des Terrains les Plus Rentables</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">ID Terrain</th>
                    <th className="text-left p-2">Localisation</th>
                    <th className="text-left p-2">Bénéfice Brut</th>
                    <th className="text-left p-2">Marge (%)</th>
                  </tr>
                </thead>
                <tbody>
                  {topTerrainsData.map((terrain, index) => (
                    <tr key={terrain.id} className="border-b hover:bg-gray-50">
                      <td className="p-2 font-mono text-sm">{terrain.id}</td>
                      <td className="p-2">{terrain.localisation}</td>
                      <td className="p-2 font-medium text-green-600">{formatCurrency(terrain.benefice)}</td>
                      <td className="p-2">
                        <span
                          className={`px-2 py-1 rounded text-sm ${
                            terrain.marge > 30
                              ? "bg-green-100 text-green-800"
                              : terrain.marge > 15
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                          }`}
                        >
                          {terrain.marge.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
