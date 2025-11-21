
'use server';

import fetch from 'node-fetch';
import { format, subDays } from 'date-fns';

const API_KEY = process.env.NEXT_PUBLIC_WEATHER_API_KEY;
const ONE_CALL_API_URL = 'https://api.openweathermap.org/data/3.0/onecall';
const HISTORY_API_URL = `${ONE_CALL_API_URL}/timemachine`;

interface DailyForecast {
  dt: number;
  summary: string;
  temp: {
    day: number;
  };
  wind_speed: number;
  wind_deg: number;
  weather: {
    description: string;
  }[];
}

/**
 * Get the weather for a specific past date.
 * @param lat Latitude
 * @param lon Longitude
 * @param date The date for the weather data.
 * @returns A string describing the weather on that day.
 */
export async function getWeatherForDate(lat: number, lon: number, date: Date): Promise<string> {
  if (!API_KEY) {
    return 'Weather API key is not configured.';
  }
  const timestamp = Math.floor(date.getTime() / 1000);
  const url = `${HISTORY_API_URL}?lat=${lat}&lon=${lon}&dt=${timestamp}&appid=${API_KEY}&units=metric`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
        console.error(`Historical weather API request failed with status ${response.status}`);
        return 'Could not retrieve historical weather.';
    }
    const data = (await response.json()) as { data: any[] };
    if (data.data && data.data.length > 0) {
      const weatherData = data.data[0];
      const windDirection = getWindDirection(weatherData.wind_deg);
      const avgTemp = weatherData.temp; // Temp is often a single value for historical, not a day/night object
      const description = weatherData.weather[0].description;
      return `Avg temp of ${Math.round(avgTemp)}°C, wind ${Math.round(weatherData.wind_speed * 2.237)} mph from the ${windDirection}, with ${description}.`;
    }
    return 'Weather data for the selected date is not available.';
  } catch (error) {
    console.error('Error fetching weather for date:', error);
    return 'Failed to retrieve historical weather data.';
  }
}

/**
 * Get a formatted weather forecast for a specific day.
 * @param lat Latitude
 * @param lon Longitude
 * @param playDate The date of play in YYYY-MM-DD format.
 * @returns A string describing the forecast.
 */
export async function getTodaysForecast(lat: number, lon: number, playDate: string): Promise<string> {
  if (!API_KEY) {
    return 'Weather API key is not configured.';
  }

  const url = `${ONE_CALL_API_URL}?lat=${lat}&lon=${lon}&exclude=minutely,hourly,alerts,current&appid=${API_KEY}&units=metric`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`Weather forecast API request failed with status ${response.status}`);
      return 'Could not retrieve weather forecast.';
    }
    const data = (await response.json()) as { daily: DailyForecast[] };
    const targetTimestamp = new Date(playDate).setUTCHours(0, 0, 0, 0);

    const forecast = data.daily.find(day => {
        const dayTimestamp = new Date(day.dt * 1000).setUTCHours(0,0,0,0);
        return dayTimestamp === targetTimestamp;
    });

    if (forecast) {
      const windDirection = getWindDirection(forecast.wind_deg);
      return `${Math.round(forecast.temp.day)}°C, wind ${Math.round(forecast.wind_speed * 2.237)} mph from the ${windDirection}, ${forecast.weather[0].description}.`;
    }
    return 'Forecast for the selected date is not available.';

  } catch (error) {
    console.error('Error fetching today\'s forecast:', error);
    return 'Failed to retrieve weather forecast.';
  }
}

/**
 * Get a summary of historical weather for the past 5 days.
 * @param lat Latitude
 * @param lon Longitude
 * @returns A string summarizing the past weather.
 */
export async function getHistoricalWeather(lat: number, lon: number): Promise<string> {
  if (!API_KEY) {
    return 'Weather API key is not configured.';
  }

  const today = new Date();
  const promises = [];
  for (let i = 1; i <= 5; i++) {
    const date = subDays(today, i);
    const timestamp = Math.floor(date.getTime() / 1000);
    const url = `${HISTORY_API_URL}?lat=${lat}&lon=${lon}&dt=${timestamp}&appid=${API_KEY}&units=metric`;
    promises.push(fetch(url).then(res => res.json()));
  }

  try {
    const results = await Promise.all(promises);
    let totalRain = 0;
    const rainDays: string[] = [];

    results.forEach((dayData, index) => {
        if (dayData.data && dayData.data[0] && dayData.data[0].weather[0].main.toLowerCase() === 'rain') {
            const dayRain = dayData.data.reduce((acc: number, hour: any) => acc + (hour.rain?.['1h'] || 0), 0);
            if (dayRain > 0) {
                totalRain += dayRain;
                rainDays.push(format(subDays(today, index + 1), 'eeee'));
            }
        }
    });

    if (totalRain > 0) {
      return `Total rainfall of ${totalRain.toFixed(1)}mm over the past 5 days, with rain on ${[...new Set(rainDays)].join(', ')}.`;
    }
    return 'Dry conditions for the past 5 days.';

  } catch (error) {
    console.error('Error fetching historical weather:', error);
    return 'Failed to retrieve historical weather summary.';
  }
}

function getWindDirection(deg: number): string {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(deg / 22.5) % 16;
    return directions[index];
}
