"use client"
import { Inter } from "next/font/google"
import "./globals.css"
import { SessionProvider } from "next-auth/react"
import { Toaster } from "@/components/ui/toaster"
import { OfflineStatus } from "@/components/offline-status"
import React from "react"
import { LoadScript } from "@react-google-maps/api" // Import LoadScript

const inter = Inter({ subsets: ["latin"] })

// Define the libraries to load with Google Maps, e.g., 'places' for POIs
const libraries = ["places"]

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  // Register Service Worker on client-side
  React.useEffect(() => {
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/service-worker.js")
          .then((registration) => {
            console.log("Service Worker enregistré avec succès:", registration)
          })
          .catch((error) => {
            console.error("Échec de l'enregistrement du Service Worker:", error)
          })
      })
    }
  }, [])

  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

  if (!googleMapsApiKey) {
    console.error("NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is not defined. Google Maps will not load.")
    // Optionally render a fallback or error message if the key is missing
    return (
      <html lang="fr">
        <body className={inter.className}>
          <SessionProvider>
            {children}
            <Toaster />
            <OfflineStatus />
          </SessionProvider>
        </body>
      </html>
    )
  }

  return (
    <html lang="fr">
      <body className={inter.className}>
        <SessionProvider>
          <LoadScript googleMapsApiKey={googleMapsApiKey} libraries={libraries}>
            {children}
          </LoadScript>
          <Toaster />
          <OfflineStatus />
        </SessionProvider>
      </body>
    </html>
  )
}
