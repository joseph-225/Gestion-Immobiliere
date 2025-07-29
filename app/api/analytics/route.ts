import { type NextRequest, NextResponse } from "next/server"
import { getAnalyticsData } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]/route"

// GET /api/analytics - Get analytics data
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
  }
  try {
    const { searchParams } = new URL(request.url)
    const dateFrom = searchParams.get("dateFrom")
    const dateTo = searchParams.get("dateTo")
    const ville = searchParams.get("ville")

    const analyticsData = await getAnalyticsData()

    // Calculate additional metrics
    const { kpis } = analyticsData
    const beneficeBrut = kpis.totalVentes - kpis.totalAchats
    const margeMovenne = kpis.totalAchats > 0 ? (beneficeBrut / kpis.totalAchats) * 100 : 0

    const response = {
      kpis: {
        ...kpis,
        beneficeBrut,
        margeMovenne,
      },
      charts: {
        performanceParVille: analyticsData.performanceParVille,
        evolutionMensuelle: analyticsData.evolutionMensuelle,
        repartitionStatut: [
          { name: "Disponible", value: kpis.terrainsDisponibles },
          { name: "Vendu", value: kpis.terrainsVendus },
        ],
      },
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Error fetching analytics:", error)
    return NextResponse.json({ error: "Erreur lors de la récupération des analyses" }, { status: 500 })
  }
}
