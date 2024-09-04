'use client'

import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Rectangle, Polyline } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { findShortestPath } from '@/components/mapcomponent/pathfinder'
import { RouteMetaData } from '@/components/mapcomponent/RouteMetaData'
import Papa from 'papaparse'
import './map.css'  // Import the new CSS file

const delhiCenter = { lat: 28.6139, lng: 77.2090 }
const delhiBounds = [
  [28.4, 76.8], 
  [28.9, 77.6]
] as L.LatLngBoundsExpression

interface Location {
  id: number;
  name: string;
  lat: number;
  lng: number;
}

export default function InteractiveMap() {
  const [locations, setLocations] = useState<Location[]>([])
  const [selectedLocations, setSelectedLocations] = useState<Location[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isMapLoaded, setIsMapLoaded] = useState(false)
  const [route, setRoute] = useState<L.LatLngExpression[]>([])
  const [isGeneratingRoute, setIsGeneratingRoute] = useState(false)
  const [routeDistance, setRouteDistance] = useState(0)
  const [routeBaseTime, setRouteBaseTime] = useState(0)

  useEffect(() => {
    // @ts-ignore
    delete L.Icon.Default.prototype._getIconUrl
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-shadow.png',
    })

    fetch('locationdata.csv')
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch CSV file');
        }
        return response.text();
      })
      .then(csvData => {
        const parsedData = Papa.parse<{name: string; lat: string; lng: string}>(csvData, { header: true }).data;
        const validData = parsedData.filter(location => location.name && location.lat && location.lng);
        setLocations(validData.map((location, index) => ({
          id: index + 1,
          name: location.name,
          lat: parseFloat(location.lat),
          lng: parseFloat(location.lng)
        })));
      })
      .catch(error => {
        console.error('Error loading CSV:', error);
      });
  }, []);

  const handleLocationSelect = (location: Location) => {
    setSelectedLocations(prev => {
      const isAlreadySelected = prev.some(loc => loc.id === location.id)
      if (isAlreadySelected) {
        return prev.filter(loc => loc.id !== location.id)
      } else {
        return [...prev, location]
      }
    })
    setRoute([]) 
    setRouteDistance(0)
    setRouteBaseTime(0)
  }

  const generateRoute = async () => {
    if (selectedLocations.length < 2) return
    setIsGeneratingRoute(true)
    const routeCoordinates = await findShortestPath(selectedLocations)
    if (routeCoordinates) {
      setRoute(routeCoordinates)
      const distance = calculateRouteDistance(routeCoordinates)
      setRouteDistance(distance)
      setRouteBaseTime(Math.round(distance * 3))
    } else {
      alert('Unable to generate route. Please try again.')
    }
    setIsGeneratingRoute(false)
  }

  

  const calculateRouteDistance = (coordinates: L.LatLngExpression[]) => {
    let distance = 0
    for (let i = 1; i < coordinates.length; i++) {
      distance += L.latLng(coordinates[i-1]).distanceTo(L.latLng(coordinates[i]))
    }
    return distance / 1000
  }

  const filteredLocations = locations.filter(location =>
    location.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="container">
      <div className="map-container">
        <MapContainer 
          center={[delhiCenter.lat, delhiCenter.lng]} 
          zoom={11} 
          style={{ height: '400px', width: '100%' }}
          maxBounds={delhiBounds}
          minZoom={10}
          whenReady={() => setIsMapLoaded(true)}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            bounds={delhiBounds}
          />
          <Rectangle bounds={delhiBounds} />
          {isMapLoaded && selectedLocations.map(location => (
            <Marker key={location.id} position={[location.lat, location.lng]}>
              <Popup>{location.name}</Popup>
            </Marker>
          ))}
          {route.length > 0 && (
            <Polyline positions={route} />
          )}
        </MapContainer>
      </div>
      <div className="controls">
        <h2>Delhi Locations</h2>
        <div className="search">
          <input
            type="text"
            placeholder="Search locations"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button
          onClick={generateRoute}
          disabled={isGeneratingRoute || selectedLocations.length < 2}
        >
          {isGeneratingRoute ? 'Generating...' : 'Generate Route'}
        </button>
      </div>
      <div className="location-list">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Coordinates</th>
            </tr>
          </thead>
          <tbody>
            {filteredLocations.map(location => (
              <tr 
                key={location.id} 
                onClick={() => handleLocationSelect(location)}
              >
                <td>{location.name}</td>
                <td>{`${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="route-metadata">
        <RouteMetaData 
          distance={routeDistance} 
          baseTime={routeBaseTime} 
          selectedLocations={selectedLocations}
        />
      </div>
    </div>
  )
}

