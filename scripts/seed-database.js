// Script to seed the database with sample data
const { sql } = require("@vercel/postgres")

async function seedDatabase() {
  try {
    console.log("Seeding database with sample data...")

    // Sample terrains data
    const sampleTerrains = [
      {
        id: "T001",
        ville: "Abidjan",
        commune: "Cocody",
        quartier: "Riviera",
        superficie: 500,
        prix_achat: 25000000,
        date_achat: "2023-01-15",
        vendeur_initial: "Kouassi Jean",
        statut: "Vendu",
        prix_vente: 35000000,
        date_vente: "2023-06-20",
        acheteur_final: "Société IMMOCI",
      },
      {
        id: "T002",
        ville: "Abidjan",
        commune: "Marcory",
        quartier: "Zone 4",
        superficie: 300,
        prix_achat: 15000000,
        date_achat: "2023-03-10",
        vendeur_initial: "Traoré Aminata",
        statut: "Disponible",
      },
      {
        id: "T003",
        ville: "Bouaké",
        commune: "Bouaké Centre",
        quartier: "Commerce",
        superficie: 800,
        prix_achat: 12000000,
        date_achat: "2023-02-28",
        vendeur_initial: "Famille Bamba",
        statut: "Disponible",
      },
      {
        id: "T004",
        ville: "Abidjan",
        commune: "Plateau",
        quartier: "Centre",
        superficie: 400,
        prix_achat: 30000000,
        date_achat: "2023-04-15",
        vendeur_initial: "Kone Mariam",
        statut: "Vendu",
        prix_vente: 42000000,
        date_vente: "2023-08-10",
        acheteur_final: "Banque BACI",
      },
      {
        id: "T005",
        ville: "Yamoussoukro",
        commune: "Yamoussoukro Centre",
        quartier: "Habitat",
        superficie: 600,
        prix_achat: 8000000,
        date_achat: "2023-05-20",
        vendeur_initial: "Ouattara Ibrahim",
        statut: "Vendu",
        prix_vente: 11000000,
        date_vente: "2023-09-15",
        acheteur_final: "Famille Diabaté",
      },
    ]

    // Insert sample data
    for (const terrain of sampleTerrains) {
      await sql`
        INSERT INTO terrains (
          id, ville, commune, quartier, superficie, prix_achat, 
          date_achat, vendeur_initial, statut, prix_vente, 
          date_vente, acheteur_final
        ) VALUES (
          ${terrain.id}, ${terrain.ville}, ${terrain.commune}, ${terrain.quartier},
          ${terrain.superficie}, ${terrain.prix_achat}, ${terrain.date_achat},
          ${terrain.vendeur_initial}, ${terrain.statut}, ${terrain.prix_vente || null},
          ${terrain.date_vente || null}, ${terrain.acheteur_final || null}
        )
        ON CONFLICT (id) DO NOTHING
      `
    }

    console.log("Database seeded successfully!")

    // Seed some sample photos
    console.log("Seeding sample photos...")

    const samplePhotos = [
      {
        terrain_id: "T001",
        photo_url: "/placeholder.svg?height=400&width=600",
        photo_name: "facade-t001.jpg",
        description: "Vue de face du terrain",
        is_primary: true,
      },
      {
        terrain_id: "T001",
        photo_url: "/placeholder.svg?height=400&width=600",
        photo_name: "angle-t001.jpg",
        description: "Vue d'angle du terrain",
        is_primary: false,
      },
      {
        terrain_id: "T002",
        photo_url: "/placeholder.svg?height=400&width=600",
        photo_name: "vue-t002.jpg",
        description: "Vue générale",
        is_primary: true,
      },
    ]

    for (const photo of samplePhotos) {
      await sql`
        INSERT INTO terrain_photos (terrain_id, photo_url, photo_name, description, is_primary)
        VALUES (${photo.terrain_id}, ${photo.photo_url}, ${photo.photo_name}, ${photo.description}, ${photo.is_primary})
        ON CONFLICT DO NOTHING
      `
    }

    console.log("Sample photos seeded successfully!")
  } catch (error) {
    console.error("Error seeding database:", error)
  }
}

// Run the seed function
seedDatabase()
