'use server';

import fetch from 'node-fetch';

const API_KEY = process.env.NEXT_PUBLIC_WEATHER_API_KEY;
const GEOCODING_API_URL = 'http://api.openweathermap.org/geo/1.0/direct';

interface GeocodingResponse {
  name: string;
  lat: number;
  lon: number;
  country: string;
}

/**
 * Get coordinates for a given city and country.
 * @param city The city name.
 * @param country The country name.
 * @returns The coordinates { lat, lon } or null if not found.
 */
export async function getCoordinates(city: string, country: string): Promise<{ lat: number; lon: number } | null> {
  if (!API_KEY) {
    console.error('Weather API key is not configured.');
    // Return null instead of throwing an error on the server
    return null;
  }

  const queryParts = [city, country].filter(Boolean).join(',');
  const url = `${GEOCODING_API_URL}?q=${encodeURIComponent(queryParts)}&limit=1&appid=${API_KEY}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`Geocoding API request failed with status ${response.status}`);
      return null;
    }
    const data = (await response.json()) as GeocodingResponse[];
    
    if (data.length > 0) {
      return { lat: data[0].lat, lon: data[0].lon };
    }
    
    console.warn(`Geocoding: Location not found for query: ${queryParts}`);
    return null;

  } catch (error: any) {
    console.error('Error fetching coordinates:', error);
    return null;
  }
}
