// @/components/pathfinder.ts

interface Location {
    lat: number;
    lng: number;
  }
  
  export async function findShortestPath(locations: Location[]): Promise<[number, number][] | null> {
    if (locations.length < 2) return null;
  
    const coordinatesString = locations.map(loc => `${loc.lng},${loc.lat}`).join(';')
    const url = `https://router.project-osrm.org/route/v1/driving/${coordinatesString}?overview=full&geometries=geojson`
    
    try {
      const response = await fetch(url)
      const data = await response.json()
      if (data.code !== 'Ok') {
        throw new Error('Unable to fetch route')
      }
      return data.routes[0].geometry.coordinates.map((coord: any[]) => [coord[1], coord[0]])
    } catch (error) {
      console.error('Error fetching route:', error)
      return null
    }
  }