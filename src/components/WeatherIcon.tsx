"use client";
import React, { useState, useEffect } from 'react';
import { Cloud, Sun, CloudRain, CloudSnow, CloudDrizzle, Zap } from 'lucide-react';

interface WeatherData {
  condition: string;
  temperature_c: number;
  temperature_f: number;
  location: string;
}

const WeatherIcon: React.FC = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCelsius, setIsCelsius] = useState(true);

  useEffect(() => {
    // Only fetch weather on client side
    if (typeof window === 'undefined') return;
    
    const fetchWeather = async () => {
      try {
        // Skip fetching when offline to avoid noisy console errors
        if (typeof navigator !== 'undefined' && navigator && navigator.onLine === false) {
          setLoading(false);
          return;
        }

        // Get user's IP location first
        const locationResponse = await fetch('https://ipapi.co/json/', {
          method: 'GET',
        });
        
        if (!locationResponse.ok) {
          throw new Error('Failed to get location');
        }
        
        const locationData = await locationResponse.json();
        const { city, country, latitude, longitude } = locationData;
        
        // Use WeatherAPI.com for accurate weather data
        const API_KEY = process.env.NEXT_PUBLIC_WEATHER_API_KEY || 'demo'; // You'll need to add your API key
        const weatherResponse = await fetch(
          `https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${latitude},${longitude}&aqi=no`,
          {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
            },
          }
        );
        
        if (weatherResponse.ok) {
          const weatherData = await weatherResponse.json();
          const current = weatherData.current;
          const location = weatherData.location;
          
          setWeather({
            condition: getConditionFromWeatherAPI(current.condition.text, current.is_day),
            temperature_c: Math.round(current.temp_c),
            temperature_f: Math.round(current.temp_f),
            location: `${location.name}, ${location.country}`
          });
        } else {
          // Fallback to a simpler IP-based weather service
          const fallbackResponse = await fetch(`https://wttr.in/${city}?format=j1`);
          if (fallbackResponse.ok) {
            const data = await fallbackResponse.json();
            const current = data.current_condition[0];
            
            setWeather({
              condition: getConditionFromCode(current.weatherCode),
              temperature_c: parseInt(current.temp_C),
              temperature_f: Math.round(parseInt(current.temp_C) * 9/5 + 32),
              location: `${city}, ${country}`
            });
          }
        }
      } catch (error) {
        // Non-critical: if any of the external services fail, just hide the widget
        console.warn('Weather fetch failed (non-critical):', error);
      } finally {
        setLoading(false);
      }
    };

    // Add a small delay to ensure component is mounted
    const timer = setTimeout(fetchWeather, 100);
    return () => clearTimeout(timer);
  }, []);

  // Convert WeatherAPI.com condition to our condition
  const getConditionFromWeatherAPI = (conditionText: string, isDay: number): string => {
    const text = conditionText.toLowerCase();
    
    if (text.includes('sunny') || text.includes('clear')) return 'clear';
    if (text.includes('partly cloudy') || text.includes('cloudy') || text.includes('overcast')) return 'clouds';
    if (text.includes('rain') || text.includes('shower')) return 'rain';
    if (text.includes('drizzle') || text.includes('light rain')) return 'drizzle';
    if (text.includes('snow') || text.includes('blizzard')) return 'snow';
    if (text.includes('thunder') || text.includes('storm')) return 'thunderstorm';
    
    return isDay ? 'clear' : 'clouds';
  };

  // Convert weather code to condition (fallback)
  const getConditionFromCode = (code: string): string => {
    const weatherCode = parseInt(code);
    if (weatherCode === 113) return 'clear';
    if ([116, 119, 122].includes(weatherCode)) return 'clouds';
    if ([296, 299, 302, 305, 308, 311, 314, 317, 320, 323, 326, 329, 332, 335, 338, 350, 353, 356, 359, 362, 365, 368, 371, 374, 377, 386, 389, 392, 395].includes(weatherCode)) return 'rain';
    if ([263, 266, 281, 284].includes(weatherCode)) return 'drizzle';
    if ([227, 230, 323, 326, 329, 332, 335, 338, 350, 353, 356, 359, 362, 365, 368, 371, 374, 377].includes(weatherCode)) return 'snow';
    if ([200, 386, 389, 392, 395].includes(weatherCode)) return 'thunderstorm';
    return 'clouds';
  };

  const getWeatherIcon = (condition: string) => {
    switch (condition) {
      case 'clear':
        return <Sun className="w-3.5 h-3.5" />;
      case 'clouds':
        return <Cloud className="w-3.5 h-3.5" />;
      case 'rain':
        return <CloudRain className="w-3.5 h-3.5" />;
      case 'drizzle':
        return <CloudDrizzle className="w-3.5 h-3.5" />;
      case 'snow':
        return <CloudSnow className="w-3.5 h-3.5" />;
      case 'thunderstorm':
        return <Zap className="w-3.5 h-3.5" />;
      default:
        return <Cloud className="w-3.5 h-3.5" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-1">
        <div className="w-3.5 h-3.5 animate-pulse bg-zinc-300 dark:bg-zinc-600 rounded"></div>
      </div>
    );
  }

  if (!weather) {
    return null;
  }

  const handleToggleUnit = () => {
    setIsCelsius(!isCelsius);
  };

  const currentTemp = isCelsius ? weather.temperature_c : weather.temperature_f;
  const unit = isCelsius ? 'C' : 'F';

  return (
    <div 
      className="flex items-center gap-1 text-zinc-700 dark:text-zinc-300 cursor-pointer hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
      title={`${currentTemp}°${unit} in ${weather.location} - Click to toggle °C/°F`}
      onClick={handleToggleUnit}
    >
      {getWeatherIcon(weather.condition)}
      <span className="text-xs font-medium">{currentTemp}°</span>
    </div>
  );
};

export default WeatherIcon;
