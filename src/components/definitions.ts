export interface Dog {
  id?: string
  img: string
  name: string
  age: number
  zip_code: string
  breed: string
  location?: Locations
}

export interface Locations {
  zip_code: string
  latitude: number
  longitude: number
  city: string
  state: string
  county: string
}

export interface Coordinates {
  lat: number
  lon: number
}

export interface LocationSearch {
  city?: string
  states?: string[]
  geoBoundingBox?: {
    top?: Coordinates
    left?: Coordinates
    bottom?: Coordinates
    right?: Coordinates
    bottom_left?: Coordinates
    top_left?: Coordinates
  }
  size?: number
  from?: number
}

export interface SearchQuery {
  breeds?: Array<string>
  ageMin?: number
  ageMax?: number
  size?: number
  sort?: string
}

export interface SearchResults {
  resultIds: string[]
  total: number
  next?: string
  prev?: string
}

export interface Match {
  match: string
}

export interface FoundLocations {
  results: Location[]
  total: number
}
