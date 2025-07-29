import type { Metadata } from "next"
import type React from "react"
import ClientLayout from "./clientLayout"

export const metadata: Metadata = {
  title: "Gestion Immobilière CI - Tableau de Bord",
  description: "Application de gestion immobilière pour agents en Côte d'Ivoire",
  manifest: "/manifest.json", // Add manifest for PWA capabilities
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ClientLayout>{children}</ClientLayout>
}


import './globals.css'