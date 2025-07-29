"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Navigation, Locate, X, Phone, Navigation2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { GoogleMap, Marker, DirectionsRenderer, useJsApiLoader } from "@react-google-maps/api" // Import Google Maps components
import { getCurrentLocation, calculateDistance } from "@/lib/geolocation" // Import geocoding utilities

interface Terrain \{
  id: string
  ville: string
  commune: string
  quartier: string
  superficie: number
  prixAchat: number
  dateAchat: string
  vendeurInitial: string
  statut: "Disponible" | "Vendu"
  prixVente?: number
  dateVente?: string
  acheteurFinal?: string
\}

interface TerrainMapProps \{
  terrain: Terrain
  isOpen: boolean
  onClose: () => void
\}

// Default map options\
const mapContainerStyle = \
{
  width: "100%",\
  height: "400px",\
  borderRadius: "0.5rem",
\
}
\
const defaultCenter = \
{
  lat: 7.539989, // Center of Côte d'Ivoire\
    lng
  : -5.547087,
\
}

const defaultZoom = 7 // Zoom level for Côte d'Ivoire
\
export function TerrainMap(\{ terrain, isOpen, onClose \}: TerrainMapProps)
\
{
  \
  const \{ isLoaded, loadError \} = useJsApiLoader(\{\
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries: ["places"], // Load places library for future POI search\
  \})
  \
  const [terrainLocation, setTerrainLocation] = useState<\
  lat: number
  lng: number
  \
  | null>(null)\
  const [userLocation, setUserLocation] = useState<\
  lat: number
  lng: number
  \
  | null>(null)\
  const [mapCenter, setMapCenter] = useState<\
  lat: number
  lng: number
  \
  >(defaultCenter)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [isLoadingLocation, setIsLoadingLocation] = useState(false)
  const [distance, setDistance] = useState<string | null>(null)
  const [directionsResponse, setDirectionsResponse] = useState<google.maps.DirectionsResult | null>(null)
  const mapRef = useRef<google.maps.Map | null>(null)

  // Geocode terrain address when dialog opens or terrain changes\
  useEffect(() => \{\
    if (isOpen && isLoaded && terrain) \{\
      const fullAddress = `$\{terrain.quartier\}, $\{terrain.commune\}, $\{terrain.ville\}, Côte d'Ivoire`\
      geocodeAddress(fullAddress)\
        .then((coords) => \{\
          if (coords) \{\
            setTerrainLocation(coords)\
            setMapCenter(coords) // Center map on terrain\
          \} else \{
            // Fallback to default center if geocoding fails\
            setTerrainLocation(null)\
            setMapCenter(defaultCenter)\
            setLocationError("Impossible de géocoder l'adresse du terrain.")
          \}\
        \})\
        .catch((error) => \{\
          console.error("Error geocoding terrain:", error)\
          setLocationError(\"Erreur lors de la géolocalisation du terrain.")
        \})\
    \} else if (!isOpen) \{
      // Reset states when closing the dialog
      setTerrainLocation(null)
      setUserLocation(null)
      setLocationError(null)
      setIsLoadingLocation(false)
      setDistance(null)
      setDirectionsResponse(null)
    \}
  \}, [isOpen, isLoaded, terrain])

  const onMapLoad = useCallback((map: google.maps.Map) => \{
    mapRef.current = map
  \}, [])

  // Get user's current location
  const handleGetUserLocation = useCallback(async () => \{
    setIsLoadingLocation(true)
    setLocationError(null)
    try \{
      const location = await getCurrentLocation()
      setUserLocation(location.coordinates)
      if (terrainLocation) \{
        const dist = calculateDistance(location.coordinates, terrainLocation)
        setDistance(formatDistance(dist))
      \}
      setDirectionsResponse(null) // Clear directions when getting new location
  setMapCenter(location.coordinates) // Center map on user for better context
  \
}
catch (error: any) \
{
  setLocationError(error.message)
  setUserLocation(null)
  setDistance(null)
  \
}
finally \
{
  setIsLoadingLocation(false)
  \
}
\}, [terrainLocation])

// Get directions from user to terrain
const handleGetDirections = useCallback(() => \{
    if (userLocation && terrainLocation) \{
      setDirectionsResponse(null); // Clear previous directions
const directionsService = new google.maps.DirectionsService()
directionsService.route(
        \{
          origin: userLocation,
          destination: terrainLocation,
          travelMode: google.maps.TravelMode.DRIVING,
        \},
        (result, status) => \{
          if (status === google.maps.DirectionsStatus.OK && result) \{
            setDirectionsResponse(result)
// Fit map to directions route
if (mapRef.current)
\
{
  const bounds = new google.maps.LatLngBounds()
  result.routes[0].legs.forEach(leg => \{
                    leg.steps.forEach(step => \{
                        step.lat_lngs.forEach(latLng => \{
                            bounds.extend(latLng)
\
}
)
\})
\})
mapRef.current.fitBounds(bounds)
\}
          \} else \
{
  setLocationError(`Impossible d'obtenir l'itinéraire: $\{status\}`)
  \
}
\}
      )
\} else \
{
  setLocationError("Veuillez d'abord obtenir votre position et la position du terrain.")
  \
}
\}, [userLocation, terrainLocation])

const formatCurrency = (amount: number) => \
{
  return new Intl.NumberFormat("fr-FR").format(amount) + " FCFA"
  \
}

if (loadError) return <div>Erreur de chargement de Google Maps: \{loadError.message\}</div>
if (!isLoaded)
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
    </div>
  )

return (
    <Dialog open=\{isOpen\} onOpenChange=\{onClose\}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle className="flex items-center">
              <MapPin className="h-5 w-5 mr-2 text-orange-500" />
              Localisation du Terrain \{terrain.id\}
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick=\{onClose\}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          \{/* Informations du terrain */\}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informations du Terrain</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Localisation</p>
                  <p className="font-medium">
                    \{terrain.ville\}, \{terrain.commune\}
                  </p>
                  <p className="text-sm text-gray-500">\{terrain.quartier\}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Superficie</p>
                  <p className="font-medium">\{terrain.superficie\} m²</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Prix d'achat</p>
                  <p className="font-medium">\{formatCurrency(terrain.prixAchat)\}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Statut</p>
                  <Badge className=\{terrain.statut === "Disponible" ? "badge-disponible" : "badge-vendu"\}>
                    \{terrain.statut\}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          \{/* Carte interactive */\}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">Carte de Localisation</CardTitle>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick=\{handleGetUserLocation\} disabled=\{isLoadingLocation\}>
                    <Locate className="h-4 w-4 mr-2" />
                    \{isLoadingLocation ? "Localisation..." : "Ma Position"\}
                  </Button>
                  \{userLocation && terrainLocation && (
                    <Button variant="outline" size="sm" onClick=\{handleGetDirections\}>
                      <Navigation2 className="h-4 w-4 mr-2" />
                      Itinéraire
                    </Button>
                  )\}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg overflow-hidden relative">
                \{isLoaded && (
                  <GoogleMap
                    mapContainerStyle=\{mapContainerStyle\}
                    center=\{mapCenter\}
                    zoom=\{defaultZoom\}
                    onLoad=\{onMapLoad\}
                    options=\{\{
                        mapTypeControl: true,
                        streetViewControl: false,
                        fullscreenControl: false,
                        zoomControl: true,
                    \}\}
                  >
                    \{terrainLocation && (
                      <Marker
                        position=\{terrainLocation\}
                        label=\{\{
                          text: terrain.id,
                          className: terrain.statut === "Vendu" ? "text-green-800 font-bold" : "text-orange-800 font-bold",
                        \}\}
                        icon=\{\{
                            path: terrain.statut === "Vendu" ? "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" : "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z", // SVG path for CheckCircle or default pin
                            fillColor: terrain.statut === "Vendu" ? "#22c55e" : "#f97316",
                            fillOpacity: 1,
                            strokeWeight: 0,
                            scale: 2,
                            anchor: new google.maps.Point(12, 24), // Adjust anchor for icon
                        \}\}
                      />
                    )\}
                    \{userLocation && (
                      <Marker
                        position=\{userLocation\}
                        icon=\{\{
                            path: google.maps.SymbolPath.CIRCLE,
                            scale: 8,
                            fillColor: "#3b82f6",
                            fillOpacity: 0.8,
                            strokeWeight: 2,
                            strokeColor: "#1d4ed8",
                        \}\}
                        label=\{\{
                            text: "Vous",
                            className: "text-blue-800 font-bold",
                        \}\}
                      />
                    )\}
                    \{directionsResponse && (
                        <DirectionsRenderer directions=\{directionsResponse\} />
                    )\}
                  </GoogleMap>
                )\}
              </div>
              \{locationError && (
                <div className="text-red-600 text-sm mt-4">
                  <p>\{locationError\}</p>
                </div>
              )\}
            </CardContent>
          </Card>

          \{/* Informations de géolocalisation */\}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            \{/* Position du terrain */\}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-orange-500" />
                  Position du Terrain
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-gray-600">Coordonnées</p>
                    <p className="font-mono text-sm">
                      \{terrainLocation ? `$\{terrainLocation.lat.toFixed(4)\}, $\{terrainLocation.lng.toFixed(4)\}` : "Chargement..."\}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Adresse approximative</p>
                    <p className="text-sm">
                      \{terrain.quartier\}, \{terrain.commune\}, \{terrain.ville\}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            \{/* Position de l'utilisateur */\}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Navigation className="h-5 w-5 mr-2 text-blue-500" />
                  Votre Position
                </CardTitle>
              </CardHeader>
              <CardContent>
                \{isLoadingLocation && (
                  <div className="flex items-center justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                    <span className="ml-2 text-sm">Localisation en cours...</span>
                  </div>
                )\}

                \{locationError && (
                  <div className="text-red-600 text-sm py-2">
                    <p>\{locationError\}</p>
                    <Button variant="outline" size="sm" onClick=\{handleGetUserLocation\} className="mt-2 bg-transparent">
                      <Locate className="h-4 w-4 mr-2" />
                      Réessayer
                    </Button>
                  </div>
                )\}

                \{userLocation && (
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm text-gray-600">Vos coordonnées</p>
                      <p className="font-mono text-sm">
                        \{userLocation.lat.toFixed(4)\}, \{userLocation.lng.toFixed(4)\}
                      </p>
                    </div>
                    \{distance && (
                      <div>
                        <p className="text-sm text-gray-600">Distance approximative</p>
                        <p className="text-lg font-medium text-green-600">\{distance\}</p>
                      </div>
                    )\}
                  </div>
                )\}

                \{!isLoadingLocation && !userLocation && !locationError && (
                  <div className="text-center py-4">
                    <Button onClick=\{handleGetUserLocation\} className="bg-blue-500 hover:bg-blue-600">
                      <Locate className="h-4 w-4 mr-2" />
                      Obtenir ma position
                    </Button>
                  </div>
                )\}
              </CardContent>
            </Card>
          </div>

          \{/* Actions rapides */\}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Actions Rapides</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button
                  variant="outline"
                  onClick=\{() => terrainLocation && window.open(`https://www.google.com/maps/search/?api=1&query=$\{terrainLocation.lat\},$\{terrainLocation.lng\}`, "_blank")\}
                  className="flex items-center justify-center bg-transparent"
                  disabled=\{!terrainLocation\}
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  Voir sur Google Maps
                </Button>
                <Button
                  variant="outline"
                  onClick=\{handleGetDirections\}
                  className="flex items-center justify-center bg-transparent"
                  disabled=\{!userLocation || !terrainLocation\}
                >
                  <Navigation2 className="h-4 w-4 mr-2" />
                  Obtenir l'itinéraire
                </Button>
                <Button
                  variant="outline"
                  onClick=\{() => \{
                    const phoneNumber = "+2250123456789" // Numéro de l'agent
                    window.open(`tel:$\{phoneNumber\}`)
                  \}\}
                  className="flex items-center justify-center"
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Appeler l'agent
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
\}
