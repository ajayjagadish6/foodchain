import { useRef } from 'react'
import { TextField } from '@mui/material'
import { Autocomplete } from '@react-google-maps/api'
import { useMapsLoader, hasMapsKey } from '../lib/maps'

type Props = {
  label: string
  value: string
  onChange: (address: string, lat: number, lng: number) => void
}

export function AddressAutocomplete({ label, value, onChange }: Props) {
  const { isLoaded } = useMapsLoader()
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)

  function onPlaceChanged() {
    const place = autocompleteRef.current?.getPlace()
    if (!place?.geometry?.location) return
    const lat = place.geometry.location.lat()
    const lng = place.geometry.location.lng()
    const address = place.formatted_address ?? place.name ?? value
    onChange(address, lat, lng)
  }

  if (!hasMapsKey || !isLoaded) {
    // Fallback: plain text field — user still sees the address but no autocomplete
    return (
      <TextField
        label={label}
        value={value}
        onChange={e => {
          // Without API key we can't geocode, so lat/lng stays 0 unless user types coords
          onChange(e.target.value, 0, 0)
        }}
        helperText="Add VITE_GOOGLE_MAPS_API_KEY to enable address search"
        fullWidth
      />
    )
  }

  return (
    <Autocomplete
      onLoad={ref => { autocompleteRef.current = ref }}
      onPlaceChanged={onPlaceChanged}
    >
      <TextField
        label={label}
        defaultValue={value}
        fullWidth
        placeholder="Start typing an address…"
        InputLabelProps={{ shrink: true }}
      />
    </Autocomplete>
  )
}
