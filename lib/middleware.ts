/**
 * ----------------------------------------------------------
 *  shared validation helpers for Terrain payloads
 * ----------------------------------------------------------
 */
export function validateTerrainData(data: any) {
  const errors: string[] = []

  if (!data.ville || typeof data.ville !== "string") errors.push("Ville requise")
  if (!data.commune || typeof data.commune !== "string") errors.push("Commune requise")
  if (!data.quartier || typeof data.quartier !== "string") errors.push("Quartier requis")

  if (typeof data.superficie !== "number" || data.superficie <= 0) errors.push("Superficie valide requise")

  if (typeof data.prix_achat !== "number" || data.prix_achat <= 0) errors.push("Prix d'achat valide requis")

  if (!isValidDate(data.date_achat)) errors.push("Date d'achat valide requise")
  if (!data.vendeur_initial || typeof data.vendeur_initial !== "string") errors.push("Vendeur initial requis")

  // statut
  if (data.statut && !["Disponible", "Vendu"].includes(data.statut)) errors.push("Statut invalide")

  if (data.statut === "Vendu") {
    if (typeof data.prix_vente !== "number" || data.prix_vente <= 0)
      errors.push("Prix de vente requis pour un terrain vendu")
    if (!isValidDate(data.date_vente)) errors.push("Date de vente requise pour un terrain vendu")
    if (!data.acheteur_final || typeof data.acheteur_final !== "string")
      errors.push("Acheteur final requis pour un terrain vendu")
  }

  return errors
}

function isValidDate(dateString: string): boolean {
  const d = new Date(dateString)
  return !isNaN(d.getTime())
}

/**
 * ----------------------------------------------------------
 *  Fallback `withAuth` – NO-OP wrapper
 * ----------------------------------------------------------
 *  NextAuth fournit déjà son propre middleware (voir /middleware.ts).
 *  Ce stub ne sert qu’à satisfaire d’anciens imports éventuels
 *  depuis "@/lib/middleware" afin d'éviter l’erreur
 *  « doesn’t provide an export named: 'withAuth' ».
 * ----------------------------------------------------------
 */
export function withAuth<T extends (...args: any[]) => any>(handler: T): T {
  return (async (...args: Parameters<T>) => handler(...args)) as T
}
