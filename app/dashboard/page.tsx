"use client"

import { useEffect } from "react"
import { useSession, signOut } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Building2, TrendingUp, MapPin, DollarSign, BarChart3, LogOut, User } from "lucide-react" // Import User icon
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function Dashboard() {
  const router = useRouter()
  const { data: session, status } = useSession()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/")
    }
  }, [status, router])

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" })
  }

  const stats = [
    {
      title: "Terrains Disponibles",
      value: "12",
      icon: Building2,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Terrains Vendus",
      value: "8",
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Bénéfice Total",
      value: "45M FCFA",
      icon: DollarSign,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
    {
      title: "Villes Couvertes",
      value: "5",
      icon: MapPin,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
  ]

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
              <Building2 className="h-8 w-8 text-orange-500 mr-3" />
              <h1 className="text-xl font-bold text-gray-900">Gestion Immobilière CI</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Bienvenue, {session?.user?.username || "Agent"}</span>
              <Link href="/profile">
                <Button variant="outline" size="sm" className="flex items-center bg-transparent">
                  <User className="h-4 w-4 mr-2" />
                  Profil
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={handleLogout} className="flex items-center bg-transparent">
                <LogOut className="h-4 w-4 mr-2" />
                Déconnexion
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Tableau de Bord Principal</h2>
          <p className="text-gray-600">Vue d'overview de votre portefeuille immobilier en Côte d'Ivoire</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className={`p-2 rounded-lg ${stat.bgColor} mr-4`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building2 className="h-6 w-6 text-orange-500 mr-2" />
                Gestion des Terrains
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Gérez votre portefeuille de terrains : ajout, modification, suppression et suivi des transactions.
              </p>
              <ul className="text-sm text-gray-500 mb-6 space-y-1">
                <li>• Ajouter de nouveaux terrains</li>
                <li>• Modifier les informations existantes</li>
                <li>• Suivre les statuts (Disponible/Vendu)</li>
                <li>• Recherche et filtrage avancés</li>
              </ul>
              <Link href="/terrains">
                <Button className="w-full bg-orange-500 hover:bg-orange-600">Accéder à la Gestion</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-6 w-6 text-green-500 mr-2" />
                Analyse des Performances
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Analysez vos performances commerciales avec des graphiques et indicateurs détaillés.
              </p>
              <ul className="text-sm text-gray-500 mb-6 space-y-1">
                <li>• KPIs et métriques clés</li>
                <li>• Graphiques de performance</li>
                <li>• Analyse par localisation</li>
                <li>• Évolution temporelle</li>
              </ul>
              <Link href="/analytics">
                <Button className="w-full bg-green-500 hover:bg-green-600">Voir les Analyses</Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Actions Rapides</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/terrains?action=add">
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <Building2 className="h-4 w-4 mr-2" />
                  Ajouter un Terrain
                </Button>
              </Link>
              <Link href="/analytics?view=kpis">
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Voir les KPIs
                </Button>
              </Link>
              <Link href="/terrains?status=available">
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <MapPin className="h-4 w-4 mr-2" />
                  Terrains Disponibles
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
