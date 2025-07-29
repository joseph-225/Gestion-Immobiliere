"use client"

import { useEffect, useState } from "react"
import { useToast } from "@/hooks/use-toast"

export function OfflineStatus() {
  const { toast } = useToast()
  const [isOnline, setIsOnline] = useState(true) // Assume online initially

  useEffect(() => {
    // Set initial status
    setIsOnline(navigator.onLine)

    const handleOnline = () => {
      setIsOnline(true)
      toast({
        title: "Connexion rétablie",
        description: "Vous êtes de nouveau en ligne.",
        variant: "default",
      })
    }

    const handleOffline = () => {
      setIsOnline(false)
      toast({
        title: "Hors ligne",
        description: "Vous êtes actuellement hors ligne. Certaines fonctionnalités peuvent être limitées.",
        variant: "destructive",
        duration: 5000, // Keep the toast visible longer
      })
    }

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [toast])

  // Optionally, you can render a small indicator if needed
  return null
}
