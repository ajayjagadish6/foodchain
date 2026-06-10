import { useJsApiLoader } from '@react-google-maps/api'

// Stable constant — passing a new array each render triggers re-load warnings
const LIBRARIES: ('geometry' | 'places')[] = ['geometry', 'places']

export function useMapsLoader() {
  const apiKey = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined) ?? ''
  return useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey,
    libraries: LIBRARIES,
  })
}

export const hasMapsKey = !!import.meta.env.VITE_GOOGLE_MAPS_API_KEY
