"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Building2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { signIn, useSession } from "next-auth/react" // Import signIn and useSession
import { useToast } from "@/hooks/use-toast" // Import useToast
import Link from "next/link" // Import Link

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [credentials, setCredentials] = useState({ username: "", password: "" })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const { data: session, status } = useSession() // Get session status
  const { toast } = useToast() // Initialize useToast

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard")
    }
  }, [status, router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const result = await signIn("credentials", {
      redirect: false, // Prevent NextAuth from redirecting
      username: credentials.username,
      password: credentials.password,
    })

    setIsSubmitting(false)

    if (result?.error) {
      toast({
        title: "Erreur de connexion",
        description: "Nom d'utilisateur ou mot de passe incorrect.",
        variant: "destructive",
      })
    } else if (result?.ok) {
      // Success, useEffect will handle redirection
      toast({
        title: "Connexion réussie",
        description: "Bienvenue sur votre tableau de bord.",
      })
    }
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-green-50 flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-green-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">Gestion Immobilière CI</CardTitle>
          <p className="text-gray-600">Connectez-vous à votre tableau de bord</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Nom d'utilisateur</Label>
              <Input
                id="username"
                type="text"
                value={credentials.username}
                onChange={(e) => setCredentials((prev) => ({ ...prev, username: e.target.value }))}
                placeholder="Entrez votre nom d'utilisateur"
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={credentials.password}
                  onChange={(e) => setCredentials((prev) => ({ ...prev, password: e.target.value }))}
                  placeholder="Entrez votre mot de passe"
                  required
                  disabled={isSubmitting}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isSubmitting}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
              </div>
            </div>

            <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600" disabled={isSubmitting}>
              {isSubmitting ? "Connexion en cours..." : "Se connecter"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            <p>
              Pas encore de compte ?{" "}
              <Link href="/register" className="font-semibold text-green-500 hover:text-green-600">
                Inscrivez-vous
              </Link>
            </p>
            <p className="mt-4">Compte de démonstration :</p>
            <p>
              Utilisateur: <strong>agent</strong>
            </p>
            <p>
              Mot de passe: <strong>immobilier2024</strong>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
