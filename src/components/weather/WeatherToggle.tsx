"use client";

import React from 'react';
import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  Loader2,
  Moon,
  Sun,
  Wind,
} from 'lucide-react';
import useWeather, { WeatherKind } from './useWeather';
import WeatherEffects from './WeatherEffects';

const KIND_ICONS: Record<WeatherKind, React.ComponentType<{ className?: string }>> = {
  'clear-day': Sun,
  'clear-night': Moon,
  clouds: Cloud,
  fog: CloudFog,
  drizzle: CloudDrizzle,
  rain: CloudRain,
  snow: CloudSnow,
  thunder: CloudLightning,
  wind: Wind,
};

const WeatherToggle = () => {
  const { status, weather, message, toggle } = useWeather();

  const Icon =
    status === 'loading' ? Loader2 : weather ? KIND_ICONS[weather.kind] : Cloud;
  const label =
    status === 'active' ? 'Turn off weather effects' : 'Show local weather effects';

  return (
    <>
      {message && (
        <span className="text-[10px] text-zinc-500 dark:text-neutral-500 whitespace-nowrap">
          {message}
        </span>
      )}
      <button
        onClick={toggle}
        className={`flex items-center gap-1.5 text-zinc-700 dark:text-neutral-300 transition-opacity ${
          status === 'paused' ? 'opacity-40' : ''
        }`}
        aria-label={label}
        aria-pressed={status === 'active'}
        title={
          status === 'active' && weather
            ? `${weather.description} · ${weather.temperature}°C`
            : label
        }
      >
        <Icon className={`w-3.5 h-3.5 ${status === 'loading' ? 'animate-spin' : ''}`} />
      </button>
      {status === 'active' && weather && <WeatherEffects kind={weather.kind} />}
    </>
  );
};

export default WeatherToggle;
