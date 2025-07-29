# API Documentation - Gestion Immobilière CI

## Base URL
\`\`\`
http://localhost:3000/api
\`\`\`

## Authentication

### POST /auth/login
Authenticate user and get access token.

**Request Body:**
\`\`\`json
{
  "username": "agent",
  "password": "immobilier2024"
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "id": "1",
    "username": "agent",
    "email": "agent@immobilier.ci"
  }
}
\`\`\`

### POST /auth/register
Register a new user.

**Request Body:**
\`\`\`json
{
  "username": "newuser",
  "password": "password123",
  "email": "user@example.com"
}
\`\`\`

## Terrains

All terrain endpoints require authentication. Include the JWT token in the Authorization header:
\`\`\`
Authorization: Bearer your_jwt_token_here
\`\`\`

### GET /terrains
Get all terrains with optional filtering and pagination.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)
- `ville` (string): Filter by city
- `commune` (string): Filter by commune
- `statut` (string): Filter by status (Disponible/Vendu)

**Response:**
\`\`\`json
{
  "terrains": [
    {
      "id": "T001",
      "ville": "Abidjan",
      "commune": "Cocody",
      "quartier": "Riviera",
      "superficie": 500,
      "prix_achat": 25000000,
      "date_achat": "2023-01-15",
      "vendeur_initial": "Kouassi Jean",
      "statut": "Vendu",
      "prix_vente": 35000000,
      "date_vente": "2023-06-20",
      "acheteur_final": "Société IMMOCI",
      "created_at": "2023-01-15T10:00:00Z",
      "updated_at": "2023-06-20T15:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
\`\`\`

### GET /terrains/[id]
Get a specific terrain by ID.

**Response:**
\`\`\`json
{
  "terrain": {
    "id": "T001",
    "ville": "Abidjan",
    // ... other fields
  }
}
\`\`\`

### POST /terrains
Create a new terrain.

**Request Body:**
\`\`\`json
{
  "ville": "Abidjan",
  "commune": "Cocody",
  "quartier": "Riviera",
  "superficie": 500,
  "prix_achat": 25000000,
  "date_achat": "2023-01-15",
  "vendeur_initial": "Kouassi Jean",
  "statut": "Disponible"
}
\`\`\`

### PUT /terrains/[id]
Update an existing terrain.

**Request Body:** (partial update supported)
\`\`\`json
{
  "statut": "Vendu",
  "prix_vente": 35000000,
  "date_vente": "2023-06-20",
  "acheteur_final": "Société IMMOCI"
}
\`\`\`

### DELETE /terrains/[id]
Delete a terrain.

**Response:**
\`\`\`json
{
  "success": true,
  "message": "Terrain supprimé avec succès"
}
\`\`\`

## Photos

All photo endpoints require authentication.

### GET /terrains/[id]/photos
Get all photos for a specific terrain.

**Response:**
\`\`\`json
{
  "photos": [
    {
      "id": "1",
      "terrain_id": "T001",
      "photo_url": "https://blob.vercel-storage.com/...",
      "photo_name": "terrain-T001-1234567890.jpg",
      "description": "Vue de face du terrain",
      "is_primary": true,
      "created_at": "2023-01-15T10:00:00Z"
    }
  ]
}
\`\`\`

### POST /terrains/[id]/photos
Upload a new photo for a terrain.

**Request:** Multipart form data
- `photo` (File): Image file (max 5MB)
- `description` (string, optional): Photo description
- `isPrimary` (boolean, optional): Set as primary photo

**Response:**
\`\`\`json
{
  "success": true,
  "photo": {
    "id": "1",
    "terrain_id": "T001",
    "photo_url": "https://blob.vercel-storage.com/...",
    "photo_name": "terrain-T001-1234567890.jpg",
    "description": "Vue de face du terrain",
    "is_primary": false,
    "created_at": "2023-01-15T10:00:00Z"
  }
}
\`\`\`

### DELETE /terrains/[id]/photos/[photoId]
Delete a photo.

**Response:**
\`\`\`json
{
  "success": true,
  "message": "Photo supprimée avec succès"
}
\`\`\`

### PUT /terrains/[id]/photos/[photoId]
Update photo properties (set as primary).

**Request Body:**
\`\`\`json
{
  "action": "setPrimary"
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "message": "Photo définie comme principale"
}
\`\`\`

## Analytics

### GET /analytics
Get analytics data and KPIs.

**Query Parameters:**
- `dateFrom` (string): Start date filter (YYYY-MM-DD)
- `dateTo` (string): End date filter (YYYY-MM-DD)
- `ville` (string): Filter by city

**Response:**
\`\`\`json
{
  "kpis": {
    "totalTerrains": 25,
    "terrainsVendus": 10,
    "terrainsDisponibles": 15,
    "totalAchats": 500000000,
    "totalVentes": 350000000,
    "beneficeBrut": 150000000,
    "margeMovenne": 42.5
  },
  "charts": {
    "performanceParVille": [
      {
        "ville": "Abidjan",
        "nombre_terrains": 15,
        "total_achats": 300000000,
        "total_ventes": 250000000,
        "benefice": 100000000
      }
    ],
    "evolutionMensuelle": [
      {
        "mois": "2023-01",
        "achats": 50000000,
        "ventes": 35000000
      }
    ],
    "repartitionStatut": [
      { "name": "Disponible", "value": 15 },
      { "name": "Vendu", "value": 10 }
    ]
  }
}
\`\`\`

## Database Initialization

### POST /init
Initialize the database with tables and default user.

**Response:**
\`\`\`json
{
  "success": true,
  "message": "Base de données initialisée avec succès"
}
\`\`\`

## Error Responses

All endpoints may return error responses in this format:

\`\`\`json
{
  "error": "Error message",
  "details": ["Additional error details"]
}
\`\`\`

Common HTTP status codes:
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (missing or invalid token)
- `404`: Not Found
- `409`: Conflict (duplicate data)
- `500`: Internal Server Error

## Rate Limiting

API endpoints are rate-limited to prevent abuse. Current limits:
- 100 requests per minute per IP
- 1000 requests per hour per authenticated user

## Data Validation

### Terrain Data Requirements

**Required fields:**
- `ville`: Non-empty string
- `commune`: Non-empty string  
- `quartier`: Non-empty string
- `superficie`: Positive number
- `prix_achat`: Positive number
- `date_achat`: Valid date (YYYY-MM-DD)
- `vendeur_initial`: Non-empty string

**Conditional fields (required when statut = "Vendu"):**
- `prix_vente`: Positive number
- `date_vente`: Valid date (YYYY-MM-DD)
- `acheteur_final`: Non-empty string

**Valid statut values:**
- "Disponible"
- "Vendu"
