// Client-side API utilities
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || ""

class ApiClient {
  // No need for token management here, NextAuth handles cookies automatically

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}/api${endpoint}`

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    }

    // No need to manually add Authorization header, NextAuth sends session cookie

    const response = await fetch(url, {
      ...options,
      headers,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Erreur réseau ou réponse non JSON" }))
      throw new Error(errorData.error || "Une erreur inconnue est survenue")
    }
    return response.json()
  }

  // Auth methods (these will now interact with NextAuth's API routes)
  // The actual login/register logic is handled by NextAuth's signIn/signUp functions
  // on the client side, and the [...nextauth] route on the server side.
  // These methods are kept for consistency if direct API calls are still desired
  // for specific auth flows not covered by NextAuth's client functions.
  async login(username: string, password: string) {
    // This method is typically replaced by NextAuth's signIn client function
    // but if you need a direct API call for some reason, it would look like this:
    return this.request("/auth/login", {
      // This endpoint will be removed, replaced by NextAuth
      method: "POST",
      body: JSON.stringify({ username, password }),
    })
  }

  // New registration method
  async registerUser(username: string, email: string, password: string) {
    return this.request("/auth/register", {
      method: "POST",
      body: JSON.stringify({ username, email, password }),
    })
  }

  // New email verification method (client-side usually handled by direct link click)
  async verifyEmail(token: string) {
    return this.request(`/auth/verify-email?token=${token}`, { method: "GET" })
  }

  async register(username: string, password: string, email?: string) {
    // This method is typically replaced by a custom registration API route
    // if NextAuth's register is not used.
    return this.request("/auth/register", {
      // This endpoint will be removed, replaced by NextAuth
      method: "POST",
      body: JSON.stringify({ username, password, email }),
    })
  }

  // Terrain methods
  async getTerrains(params?: {
    page?: number
    limit?: number
    ville?: string
    commune?: string
    statut?: string
    superficieMin?: string
    superficieMax?: string
    prixAchatMin?: string
    prixAchatMax?: string
    dateFrom?: string
    dateTo?: string
    searchTerm?: string
    sortKey?: string
    sortDirection?: "asc" | "desc"
  }) {
    const searchParams = new URLSearchParams()

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          searchParams.append(key, value.toString())
        }
      })
    }

    const query = searchParams.toString()
    return this.request(`/terrains${query ? `?${query}` : ""}`)
  }

  async getTerrain(id: string) {
    return this.request(`/terrains/${id}`)
  }

  async createTerrain(terrain: any) {
    return this.request("/terrains", {
      method: "POST",
      body: JSON.stringify(terrain),
    })
  }

  async updateTerrain(id: string, terrain: any) {
    return this.request(`/terrains/${id}`, {
      method: "PUT",
      body: JSON.stringify(terrain),
    })
  }

  async deleteTerrain(id: string) {
    return this.request(`/terrains/${id}`, {
      method: "DELETE",
    })
  }

  // Photo methods
  async getTerrainPhotos(terrainId: string) {
    return this.request(`/terrains/${terrainId}/photos`)
  }

  async uploadTerrainPhoto(terrainId: string, file: File, description?: string, isPrimary?: boolean) {
    const formData = new FormData()
    formData.append("photo", file)
    if (description) formData.append("description", description)
    if (isPrimary) formData.append("isPrimary", "true")

    const url = `${API_BASE_URL}/api/terrains/${terrainId}/photos`

    const response = await fetch(url, {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Upload failed" }))
      throw new Error(errorData.error || "Erreur lors de l'upload de la photo")
    }

    return response.json()
  }

  async deleteTerrainPhoto(terrainId: string, photoId: string) {
    return this.request(`/terrains/${terrainId}/photos/${photoId}`, {
      method: "DELETE",
    })
  }

  async setPrimaryPhoto(terrainId: string, photoId: string) {
    return this.request(`/terrains/${terrainId}/photos/${photoId}`, {
      method: "PUT",
      body: JSON.stringify({ action: "setPrimary" }),
    })
  }

  // Analytics methods
  async getAnalytics(params?: {
    dateFrom?: string
    dateTo?: string
    ville?: string
  }) {
    const searchParams = new URLSearchParams()

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value)
        }
      })
    }

    const query = searchParams.toString()
    return this.request(`/analytics${query ? `?${query}` : ""}`)
  }

  // Database initialization
  async initializeDatabase() {
    return this.request("/init", {
      method: "POST",
    })
  }

  // New profile methods
  async getUserProfile() {
    return this.request("/profile", { method: "GET" })
  }

  async updateProfile(data: { username?: string; email?: string; password?: string }) {
    return this.request("/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    })
  }
}

export const apiClient = new ApiClient()
// </merged_code>
