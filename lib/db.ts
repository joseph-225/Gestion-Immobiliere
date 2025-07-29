import { sql } from "@vercel/postgres"
import { hash } from "bcryptjs"

export interface Terrain {
  id: string
  ville: string
  commune: string
  quartier: string
  superficie: number
  prix_achat: number
  date_achat: string
  vendeur_initial: string
  statut: "Disponible" | "Vendu"
  prix_vente?: number
  date_vente?: string
  acheteur_final?: string
  created_at: string
  updated_at: string
}

export interface TerrainPhoto {
  id: string
  terrain_id: string
  photo_url: string
  photo_name: string
  description?: string
  is_primary: boolean
  created_at: string
}

export interface User {
  id: string
  username: string
  password_hash: string
  email?: string
  email_verified: boolean // Nouveau champ
  created_at: string
  last_login?: string
}

export interface EmailVerificationToken {
  id: string
  user_id: string
  token: string
  expires_at: string
  created_at: string
}

// Database initialization
export async function initializeDatabase() {
  try {
    // Create users table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        email VARCHAR(100) UNIQUE,
        email_verified BOOLEAN DEFAULT FALSE, -- Nouveau champ
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP
      )
    `

    // Create terrains table
    await sql`
      CREATE TABLE IF NOT EXISTS terrains (
        id VARCHAR(10) PRIMARY KEY,
        ville VARCHAR(100) NOT NULL,
        commune VARCHAR(100) NOT NULL,
        quartier VARCHAR(100) NOT NULL,
        superficie INTEGER NOT NULL,
        prix_achat BIGINT NOT NULL,
        date_achat DATE NOT NULL,
        vendeur_initial VARCHAR(200) NOT NULL,
        statut VARCHAR(20) CHECK (statut IN ('Disponible', 'Vendu')) DEFAULT 'Disponible',
        prix_vente BIGINT,
        date_vente DATE,
        acheteur_final VARCHAR(200),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Create terrain_photos table
    await sql`
      CREATE TABLE IF NOT EXISTS terrain_photos (
        id SERIAL PRIMARY KEY,
        terrain_id VARCHAR(10) REFERENCES terrains(id) ON DELETE CASCADE,
        photo_url TEXT NOT NULL,
        photo_name VARCHAR(255) NOT NULL,
        description TEXT,
        is_primary BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Create email_verification_tokens table
    await sql`
      CREATE TABLE IF NOT EXISTS email_verification_tokens (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token VARCHAR(255) UNIQUE NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Create index for better performance
    await sql`
      CREATE INDEX IF NOT EXISTS idx_terrain_photos_terrain_id ON terrain_photos(terrain_id)
    `
    await sql`
      CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_token ON email_verification_tokens(token)
    `

    // Create trigger for updated_at
    await sql`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql'
    `

    await sql`
      DROP TRIGGER IF EXISTS update_terrains_updated_at ON terrains
    `

    await sql`
      CREATE TRIGGER update_terrains_updated_at
        BEFORE UPDATE ON terrains
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column()
    `

    console.log("Database initialized successfully")
  } catch (error) {
    console.error("Database initialization error:", error)
    throw error
  }
}

// Terrain operations
export async function getAllTerrains(
  filters: {
    ville?: string
    commune?: string
    statut?: "Disponible" | "Vendu" | "all"
    superficieMin?: number
    superficieMax?: number
    prixAchatMin?: number
    prixAchatMax?: number
    dateFrom?: string
    dateTo?: string
    searchTerm?: string
  },
  sortConfig: { key: string; direction: "asc" | "desc" } | null,
  page: number,
  limit: number,
): Promise<{ terrains: Terrain[]; total: number }> {
  try {
    const whereClauses: string[] = []
    const queryParams: any[] = []
    let paramIndex = 1

    // Global search term
    if (filters.searchTerm) {
      const searchPattern = `%${filters.searchTerm.toLowerCase()}%`
      whereClauses.push(`(
        LOWER(ville) ILIKE $${paramIndex++} OR
        LOWER(commune) ILIKE $${paramIndex++} OR
        LOWER(quartier) ILIKE $${paramIndex++} OR
        LOWER(vendeur_initial) ILIKE $${paramIndex++} OR
        LOWER(id) ILIKE $${paramIndex++}
      )`)
      queryParams.push(searchPattern, searchPattern, searchPattern, searchPattern, searchPattern)
    }

    // Specific filters
    if (filters.ville && filters.ville !== "all") {
      whereClauses.push(`ville = $${paramIndex++}`)
      queryParams.push(filters.ville)
    }
    if (filters.commune && filters.commune !== "all") {
      whereClauses.push(`commune = $${paramIndex++}`)
      queryParams.push(filters.commune)
    }
    if (filters.statut && filters.statut !== "all") {
      whereClauses.push(`statut = $${paramIndex++}`)
      queryParams.push(filters.statut)
    }
    if (filters.superficieMin) {
      whereClauses.push(`superficie >= $${paramIndex++}`)
      queryParams.push(filters.superficieMin)
    }
    if (filters.superficieMax) {
      whereClauses.push(`superficie <= $${paramIndex++}`)
      queryParams.push(filters.superficieMax)
    }
    if (filters.prixAchatMin) {
      whereClauses.push(`prix_achat >= $${paramIndex++}`)
      queryParams.push(filters.prixAchatMin)
    }
    if (filters.prixAchatMax) {
      whereClauses.push(`prix_achat <= $${paramIndex++}`)
      queryParams.push(filters.prixAchatMax)
    }
    // Filtres par date d'achat
    if (filters.dateFrom) {
      whereClauses.push(`date_achat >= $${paramIndex++}`)
      queryParams.push(filters.dateFrom)
    }
    if (filters.dateTo) {
      whereClauses.push(`date_achat <= $${paramIndex++}`)
      queryParams.push(filters.dateTo)
    }

    const whereClauseString = whereClauses.length > 0 ? ` WHERE ${whereClauses.join(" AND ")}` : ""

    let orderByClause = `ORDER BY created_at DESC` // Default sort
    if (sortConfig) {
      // Map frontend keys to database column names if they differ
      const dbKeyMap: Record<string, string> = {
        id: "id",
        ville: "ville",
        superficie: "superficie",
        prixAchat: "prix_achat",
        statut: "statut",
        // Add other sortable keys if needed
      }
      const dbKey = dbKeyMap[sortConfig.key] || sortConfig.key // Use mapped key or original if no map
      orderByClause = `ORDER BY ${dbKey} ${sortConfig.direction.toUpperCase()}`
    }

    const offset = (page - 1) * limit

    const fullQuery = `
      SELECT * FROM terrains
      ${whereClauseString}
      ${orderByClause}
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `
    queryParams.push(limit, offset)

    const countQuery = `
      SELECT COUNT(*) as total FROM terrains
      ${whereClauseString}
    `
    // For the count query, we use the same parameters as the main query,
    // but without the LIMIT and OFFSET parameters.
    const countQueryParams = queryParams.slice(0, queryParams.length - 2)

    const [terrainsResult, countResult] = await Promise.all([
      sql.query(fullQuery, queryParams),
      sql.query(countQuery, countQueryParams),
    ])

    return {
      terrains: terrainsResult.rows as Terrain[],
      total: Number.parseInt(countResult.rows[0].total),
    }
  } catch (error) {
    console.error("Error fetching terrains:", error)
    throw error
  }
}

export async function getTerrainById(id: string): Promise<Terrain | null> {
  try {
    const { rows } = await sql`
      SELECT * FROM terrains 
      WHERE id = ${id}
    `
    return (rows[0] as Terrain) || null
  } catch (error) {
    console.error("Error fetching terrain:", error)
    throw error
  }
}

export async function createTerrain(terrain: Omit<Terrain, "id" | "created_at" | "updated_at">): Promise<Terrain> {
  try {
    // Generate ID
    const { rows: countRows } = await sql`SELECT COUNT(*) as count FROM terrains`
    const count = Number.parseInt(countRows[0].count) + 1
    const id = `T${count.toString().padStart(3, "0")}`

    const { rows } = await sql`
      INSERT INTO terrains (
        id, ville, commune, quartier, superficie, prix_achat, 
        date_achat, vendeur_initial, statut, prix_vente, 
        date_vente, acheteur_final
      ) VALUES (
        ${id}, ${terrain.ville}, ${terrain.commune}, ${terrain.quartier},
        ${terrain.superficie}, ${terrain.prix_achat}, ${terrain.date_achat},
        ${terrain.vendeur_initial}, ${terrain.statut}, ${terrain.prix_vente},
        ${terrain.date_vente}, ${terrain.acheteur_final}
      )
      RETURNING *
    `
    return rows[0] as Terrain
  } catch (error) {
    console.error("Error creating terrain:", error)
    throw error
  }
}

export async function updateTerrain(id: string, terrain: Partial<Terrain>): Promise<Terrain> {
  try {
    const { rows } = await sql`
      UPDATE terrains SET
        ville = COALESCE(${terrain.ville}, ville),
        commune = COALESCE(${terrain.commune}, commune),
        quartier = COALESCE(${terrain.quartier}, quartier),
        superficie = COALESCE(${terrain.superficie}, superficie),
        prix_achat = COALESCE(${terrain.prix_achat}, prix_achat),
        date_achat = COALESCE(${terrain.date_achat}, date_achat),
        vendeur_initial = COALESCE(${terrain.vendeur_initial}, vendeur_initial),
        statut = COALESCE(${terrain.statut}, statut),
        prix_vente = ${terrain.prix_vente},
        date_vente = ${terrain.date_vente},
        acheteur_final = ${terrain.acheteur_final}
      WHERE id = ${id}
      RETURNING *
    `
    return rows[0] as Terrain
  } catch (error) {
    console.error("Error updating terrain:", error)
    throw error
  }
}

export async function deleteTerrain(id: string): Promise<boolean> {
  try {
    const { rowCount } = await sql`
      DELETE FROM terrains WHERE id = ${id}
    `
    return rowCount > 0
  } catch (error) {
    console.error("Error deleting terrain:", error)
    throw error
  }
}

// User operations
export async function getUserByUsername(username: string): Promise<User | null> {
  try {
    const { rows } = await sql`
      SELECT * FROM users WHERE username = ${username}
    `
    return (rows[0] as User) || null
  } catch (error) {
    console.error("Error fetching user:", error)
    throw error
  }
}

export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const { rows } = await sql`
      SELECT * FROM users WHERE email = ${email}
    `
    return (rows[0] as User) || null
  } catch (error) {
    console.error("Error fetching user by email:", error)
    throw error
  }
}

export async function getUserById(id: string): Promise<User | null> {
  try {
    const { rows } = await sql`
      SELECT * FROM users WHERE id = ${id}
    `
    return (rows[0] as User) || null
  } catch (error) {
    console.error("Error fetching user by ID:", error)
    throw error
  }
}

export async function createUser(username: string, passwordHash: string, email: string): Promise<User> {
  try {
    const { rows } = await sql`
      INSERT INTO users (username, password_hash, email, email_verified)
      VALUES (${username}, ${passwordHash}, ${email}, FALSE) -- email_verified starts false
      RETURNING *
    `
    return rows[0] as User
  } catch (error) {
    console.error("Error creating user:", error)
    throw error
  }
}

export async function updateUserLastLogin(username: string): Promise<void> {
  try {
    await sql`
      UPDATE users SET last_login = CURRENT_TIMESTAMP
      WHERE username = ${username}
    `
  } catch (error) {
    console.error("Error updating last login:", error)
    throw error
  }
}

export async function updateUserVerificationStatus(userId: string, verified: boolean): Promise<User> {
  try {
    const { rows } = await sql`
      UPDATE users SET email_verified = ${verified}
      WHERE id = ${userId}
      RETURNING *
    `
    return rows[0] as User
  } catch (error) {
    console.error("Error updating email verification status:", error)
    throw error
  }
}

export async function updateUser(
  userId: string,
  data: { username?: string; email?: string; password_hash?: string },
): Promise<User> {
  try {
    const updates: string[] = []
    const params: any[] = []
    let paramIndex = 1

    if (data.username !== undefined) {
      updates.push(`username = $${paramIndex++}`)
      params.push(data.username)
    }
    if (data.email !== undefined) {
      updates.push(`email = $${paramIndex++}`)
      params.push(data.email)
      updates.push(`email_verified = FALSE`) // Mark as unverified if email changes
    }
    if (data.password_hash !== undefined) {
      updates.push(`password_hash = $${paramIndex++}`)
      params.push(data.password_hash)
    }

    if (updates.length === 0) {
      throw new Error("No update data provided.")
    }

    params.push(userId) // Add userId as the last parameter for WHERE clause

    const { rows } = await sql.query(
      `
      UPDATE users SET
        ${updates.join(", ")},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramIndex}
      RETURNING *
    `,
      params,
    )

    return rows[0] as User
  } catch (error) {
    console.error("Error updating user:", error)
    throw error
  }
}

// Email Verification Token Operations
export async function createEmailVerificationToken(userId: string): Promise<EmailVerificationToken> {
  try {
    const token = await hash(Math.random().toString(), 10) // Generate unique token
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 24) // Token valid for 24 hours

    const { rows } = await sql`
      INSERT INTO email_verification_tokens (user_id, token, expires_at)
      VALUES (${userId}, ${token}, ${expiresAt.toISOString()})
      RETURNING *
    `
    return rows[0] as EmailVerificationToken
  } catch (error) {
    console.error("Error creating email verification token:", error)
    throw error
  }
}

export async function getVerificationToken(token: string): Promise<EmailVerificationToken | null> {
  try {
    const { rows } = await sql`
      SELECT * FROM email_verification_tokens
      WHERE token = ${token} AND expires_at > CURRENT_TIMESTAMP
    `
    return (rows[0] as EmailVerificationToken) || null
  } catch (error) {
    console.error("Error fetching verification token:", error)
    throw error
  }
}

export async function deleteVerificationToken(id: string): Promise<boolean> {
  try {
    const { rowCount } = await sql`
      DELETE FROM email_verification_tokens WHERE id = ${id}
    `
    return rowCount > 0
  } catch (error) {
    console.error("Error deleting verification token:", error)
    throw error
  }
}

// Analytics operations
export async function getAnalyticsData() {
  try {
    const [
      terrainsCount,
      terrainsVendus,
      terrainsDisponibles,
      totalAchats,
      totalVentes,
      performanceParVille,
      evolutionMensuelle,
    ] = await Promise.all([
      sql`SELECT COUNT(*) as total FROM terrains`,
      sql`SELECT COUNT(*) as vendus FROM terrains WHERE statut = 'Vendu'`,
      sql`SELECT COUNT(*) as disponibles FROM terrains WHERE statut = 'Disponible'`,
      sql`SELECT SUM(prix_achat) as total_achats FROM terrains`,
      sql`SELECT SUM(prix_vente) as total_ventes FROM terrains WHERE statut = 'Vendu'`,
      sql`
        SELECT
          ville,
          COUNT(*) as nombre_terrains,
          SUM(prix_achat) as total_achats,
          SUM(CASE WHEN statut = 'Vendu' THEN prix_vente ELSE 0 END) as total_ventes,
          SUM(CASE WHEN statut = 'Vendu' THEN prix_vente - prix_achat ELSE 0 END) as benefice
        FROM terrains
        GROUP BY ville
        ORDER BY benefice DESC
      `,
      sql`
        SELECT
          TO_CHAR(date_achat, 'YYYY-MM') as mois,
          SUM(prix_achat) as achats,
          SUM(CASE WHEN statut = 'Vendu' THEN prix_vente ELSE 0 END) as ventes
        FROM terrains
        GROUP BY TO_CHAR(date_achat, 'YYYY-MM')
        ORDER BY mois
      `,
    ])

    return {
      kpis: {
        totalTerrains: Number.parseInt(terrainsCount.rows[0].total),
        terrainsVendus: Number.parseInt(terrainsVendus.rows[0].vendus),
        terrainsDisponibles: Number.parseInt(terrainsDisponibles.rows[0].disponibles),
        totalAchats: Number.parseInt(totalAchats.rows[0].total_achats || "0"),
        totalVentes: Number.parseInt(totalVentes.rows[0].total_ventes || "0"),
      },
      performanceParVille: performanceParVille.rows,
      evolutionMensuelle: evolutionMensuelle.rows,
    }
  } catch (error) {
    console.error("Error fetching analytics:", error)
    throw error
  }
}

// Photo operations
export async function getTerrainPhotos(terrainId: string): Promise<TerrainPhoto[]> {
  try {
    const { rows } = await sql`
      SELECT * FROM terrain_photos
      WHERE terrain_id = ${terrainId}
      ORDER BY is_primary DESC, created_at ASC
    `
    return rows as TerrainPhoto[]
  } catch (error) {
    console.error("Error fetching terrain photos:", error)
    throw error
  }
}

export async function addTerrainPhoto(
  terrainId: string,
  photoUrl: string,
  photoName: string,
  description?: string,
  isPrimary = false,
): Promise<TerrainPhoto> {
  try {
    // If this is set as primary, unset other primary photos
    if (isPrimary) {
      await sql`
        UPDATE terrain_photos
        SET is_primary = FALSE
        WHERE terrain_id = ${terrainId}
      `
    }

    const { rows } = await sql`
      INSERT INTO terrain_photos (terrain_id, photo_url, photo_name, description, is_primary)
      VALUES (${terrainId}, ${photoUrl}, ${photoName}, ${description || null}, ${isPrimary})
      RETURNING *
    `
    return rows[0] as TerrainPhoto
  } catch (error) {
    console.error("Error adding terrain photo:", error)
    throw error
  }
}

export async function deleteTerrainPhoto(photoId: string): Promise<TerrainPhoto | null> {
  try {
    const { rows } = await sql`
      DELETE FROM terrain_photos
      WHERE id = ${photoId}
      RETURNING *
    `
    return (rows[0] as TerrainPhoto) || null
  } catch (error) {
    console.error("Error deleting terrain photo:", error)
    throw error
  }
}

export async function setPrimaryPhoto(photoId: string, terrainId: string): Promise<void> {
  try {
    // Unset all primary photos for this terrain
    await sql`
      UPDATE terrain_photos
      SET is_primary = FALSE
      WHERE terrain_id = ${terrainId}
    `

    // Set the selected photo as primary
    await sql`
      UPDATE terrain_photos
      SET is_primary = TRUE
      WHERE id = ${photoId}
    `
  } catch (error) {
    console.error("Error setting primary photo:", error)
    throw error
  }
}
