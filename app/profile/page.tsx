"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Home, User, Lock, Eye, EyeOff, Save, Loader2, LogOut, CheckCircle, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { apiClient } from "@/lib/api-client"

interface UserProfile {
  id: string
  username: string
  email: string
  email_verified: boolean
  created_at: string
  last_login?: string
}

export default function ProfilePage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const { toast } = useToast()

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [loadingProfile, setLoadingProfile] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/")
    } else if (status === "authenticated") {
      fetchUserProfile()
    }
  }, [status, router])

  const fetchUserProfile = async () => {
    setLoadingProfile(true)
    try {
      const response = await apiClient.getUserProfile()
      setUserProfile(response.user)
      setFormData({
        username: response.user.username,
        email: response.user.email,
        password: "",
        confirmPassword: "",
      })
    } catch (error: any) {
      console.error("Error fetching profile:", error)
      toast({
        title: "Erreur de chargement du profil",
        description: error.message || "Impossible de charger votre profil.",
        variant: "destructive",
      })
    } finally {
      setLoadingProfile(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value })
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    if (formData.password && formData.password !== formData.confirmPassword) {
      toast({
        title: "Erreur de mot de passe",
        description: "Les mots de passe ne correspondent pas.",
        variant: "destructive",
      })
      setIsSubmitting(false)
      return
    }

    const updateData: { username?: string; email?: string; password?: string } = {}
    if (formData.username !== userProfile?.username) {
      updateData.username = formData.username
    }
    if (formData.email !== userProfile?.email) {
      updateData.email = formData.email
    }
    if (formData.password) {
      updateData.password = formData.password
    }

    if (Object.keys(updateData).length === 0) {
      toast({
        title: "Aucune modification",
        description: "Aucune modification à enregistrer.",
        variant: "default",
      })
      setIsSubmitting(false)
      return
    }

    try {
      const response = await apiClient.updateProfile(updateData)
      toast({
        title: "Profil mis à jour",
        description: "Votre profil a été mis à jour avec succès. Veuillez vous reconnecter.",
        variant: "default",
      })
      await signOut({ callbackUrl: "/" }) // Force re-login after profile update for security
    } catch (error: any) {
      console.error("Profile update error:", error)
      toast({
        title: "Erreur de mise à jour",
        description: error.message || "Impossible de mettre à jour votre profil.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" })
  }

  if (status === "loading" || loadingProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 text-center">
        <p className="text-lg text-gray-600">Impossible de charger les données du profil.</p>
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
              <User className="h-8 w-8 text-orange-500 mr-3" />
              <h1 className="text-xl font-bold text-gray-900">Mon Profil</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Connecté en tant que: {userProfile.username}</span>
              <Button variant="outline" size="sm" onClick={handleLogout} className="flex items-center bg-transparent">
                <LogOut className="h-4 w-4 mr-2" />
                Déconnexion
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Paramètres du Compte</h2>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Informations Personnelles</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Nom d'utilisateur</Label>
                  <Input
                    id="username"
                    type="text"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled={isSubmitting}
                  />
                  {userProfile.email_verified ? (
                    <p className="text-sm text-green-600 flex items-center">
                      <CheckCircle className="h-4 w-4 mr-1" /> Email vérifié
                    </p>
                  ) : (
                    <p className="text-sm text-yellow-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" /> Email non vérifié. Vérifiez votre boîte de réception.
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <h3 className="text-md font-semibold flex items-center">
                  <Lock className="h-4 w-4 mr-2" /> Changer le mot de passe
                </h3>
                <p className="text-sm text-gray-600">Laissez les champs vides si vous ne souhaitez pas changer de mot de passe.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Nouveau mot de passe</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Nouveau mot de passe"
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
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmer le nouveau mot de passe</Label>
                    <Input
                      id="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirmer le mot de passe"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button type="submit" className="bg-orange-500 hover:bg-orange-600" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Save className="h-4 w-4 mr-2" />
                  Enregistrer les modifications
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Informations du compte</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-gray-700">
            <p>
              <strong>ID Utilisateur:</strong> {userProfile.id}
            </p>
            <p>
              <strong>Compte créé le:</strong> {new Date(userProfile.created_at).toLocaleDateString("fr-FR", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
            {userProfile.last_login && (
              <p>
                <strong>Dernière connexion:</strong> {new Date(userProfile.last_login).toLocaleDateString("fr-FR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
