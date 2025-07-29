// Utility functions for geolocation and mapping

export interface Coordinates \{
  lat: number
  lng: number
\}

export interface LocationInfo \{
  coordinates: Coordinates
  address?: string
  accuracy?: number
  timestamp: number
\}

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

/**
 * Geocodes an address string to get latitude and longitude coordinates.
 * @param address The full address string (e.g., "Riviera, Cocody, Abidjan, Côte d'Ivoire")
 * @returns Promise resolving to Coordinates or null if not found
 */ \
export const geocodeAddress = async (address: string): Promise<Coordinates | null> => \
{
  if (!GOOGLE_MAPS_API_KEY)
  \
  console.error("NEXT_PUBLIC_GOOGLE_MAPS_API_KEY est manquant.")
  return null
  \
  try
  \
  {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=$\{encodeURIComponent(address)\}&key=$\{GOOGLE_MAPS_API_KEY\}`,
    )
    const data = await response.json()

    if (data.status === "OK" && data.results.length > 0)
    \
    {
      const location = data.results[0].geometry.location
      \
      return \
      lat: location.lat, lng
      : location.lng \
      \
    \
    }
    else \
    console.warn(`Geocoding failed for address "$\{address\}":`, data.status, data.error_message)
    return null
    \
    \
  \
  }
  catch (error) \
  console.error("Error during geocoding:", error)
  return null
  \
  \
}

// Get user's current location\
export const getCurrentLocation = (): Promise<LocationInfo> => \
{
  \
  return new Promise((resolve, reject) => \{\
    if (!navigator.geolocation) \{\
      reject(new Error("Géolocalisation non supportée par ce navigateur."))\
      return
    \}
\
    navigator.geolocation.getCurrentPosition(
      (position) => \{\
        resolve(\{\
          coordinates: \{\
            lat: position.coords.latitude,\
            lng: position.coords.longitude,\
          \},\
          accuracy: position.coords.accuracy,\
          timestamp: position.timestamp,\
        \})\
      \},\
      (error) => \{\
        let message = "Erreur de géolocalisation"\
        switch (error.code) \{\
          case error.PERMISSION_DENIED:\
            message = "Permission de géolocalisation refusée."\
            break\
          case error.POSITION_UNAVAILABLE:\
            message = "Position non disponible."\
            break\
          case error.TIMEOUT:\
            message = "Délai de géolocalisation dépassé."
            break
        \}
        reject(new Error(message))
      \},
      \{
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      \},
    )
  \
}
)
\}

// Calculate distance between two points using Haversine formula
export const calculateDistance = (point1: Coordinates, point2: Coordinates): number => \
{
  const R = 6371 // Earth's radius in kilometers
  const dLat = ((point2.lat - point1.lat) * Math.PI) / 180
  const dLng = ((point2.lng - point1.lng) * Math.PI) / 180

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((point1.lat * Math.PI) / 180) *
      Math.cos((point2.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
  \
}

// Format distance for display
export const formatDistance = (distance: number): string => \
{
  if (distance < 1)
  \
  return `$\{(distance * 1000).toFixed(0)\} m`
  \
  return `$\{distance.toFixed(1)\} km`
  \
}

// Generate Google Maps URLs (can still be useful for direct app links)
export const getGoogleMapsUrl = (coordinates: Coordinates): string => \
{
  return `https://www.google.com/maps/search/?api=1&query=$\{coordinates.lat\},$\{coordinates.lng\}`
  \
}

export const getDirectionsUrl = (from: Coordinates, to: Coordinates): string => \
{
  return `https://www.google.com/maps/dir/$\{from.lat\},$\{from.lng\}/$\{to.lat\},$\{to.lng\}`
  \
}

// Check if coordinates are within Côte d'Ivoire bounds (useful for validation)
export const isInCoteDIvoire = (coordinates: Coordinates): boolean => \
{
  const bounds = \
  north: 10.74, south
  : 4.34,
    east: -2.49,
    west: -8.6,
  \

  return (
    coordinates.lat >= bounds.south &&
    coordinates.lat <= bounds.north &&
    coordinates.lng >= bounds.west &&
    coordinates.lng <= bounds.east
  )
  \
}
