"use client";

import { useCallback, useEffect, useRef, useState } from 'react';

export type WeatherKind =
  | 'clear-day'
  | 'clear-night'
  | 'clouds'
  | 'fog'
  | 'drizzle'
  | 'rain'
  | 'snow'
  | 'thunder'
  | 'wind';

export interface WeatherInfo {
  kind: WeatherKind;
  temperature: number;
  description: string;
  fetchedAt: number;
}

export type WeatherStatus = 'idle' | 'loading' | 'active' | 'paused';

interface OpenMeteoResponse {
  current?: {
    temperature_2m?: number;
    weather_code?: number;
    is_day?: number;
    wind_speed_10m?: number;
  };
}

const CACHE_KEY = 'weather-effects-cache';
const ENABLED_KEY = 'weather-effects-enabled';
const CACHE_TTL = 20 * 60 * 1000;

const DESCRIPTIONS: Record<WeatherKind, string> = {
  'clear-day': 'Clear',
  'clear-night': 'Clear night',
  clouds: 'Cloudy',
  fog: 'Fog',
  drizzle: 'Drizzle',
  rain: 'Rain',
  snow: 'Snow',
  thunder: 'Thunderstorm',
  wind: 'Windy',
};

const kindFromWmo = (code: number, isDay: boolean, windKmh: number): WeatherKind => {
  if (code >= 95) return 'thunder';
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return 'snow';
  if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)) return 'rain';
  if (code >= 51 && code <= 57) return 'drizzle';
  if (code === 45 || code === 48) return 'fog';
  if (windKmh >= 29) return 'wind';
  if (code >= 2) return 'clouds';
  return isDay ? 'clear-day' : 'clear-night';
};

const readCache = (): WeatherInfo | null => {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const info = JSON.parse(raw) as WeatherInfo;
    if (!info.kind || Date.now() - info.fetchedAt > CACHE_TTL) return null;
    return info;
  } catch {
    return null;
  }
};

const writeSession = (key: string, value: string) => {
  try {
    sessionStorage.setItem(key, value);
  } catch {
    // storage unavailable (private mode etc.) — effects just won't persist
  }
};

const useWeather = () => {
  const [status, setStatus] = useState<WeatherStatus>('idle');
  const [weather, setWeather] = useState<WeatherInfo | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const messageTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Resume from this session's cache on mount. This never touches
  // geolocation — it only restores what an earlier click already fetched.
  useEffect(() => {
    const cached = readCache();
    if (cached) {
      setWeather(cached);
      if (sessionStorage.getItem(ENABLED_KEY) === '1') {
        setStatus('active');
      }
    }
    return () => {
      if (messageTimer.current) clearTimeout(messageTimer.current);
    };
  }, []);

  const showMessage = useCallback((text: string) => {
    setMessage(text);
    if (messageTimer.current) clearTimeout(messageTimer.current);
    messageTimer.current = setTimeout(() => setMessage(null), 3500);
  }, []);

  const fetchWeather = useCallback(async () => {
    setStatus('loading');
    // If the browser has location hard-blocked (site or global setting), no
    // prompt will ever appear — surface that instead of a generic decline.
    // permissions.query never triggers a prompt itself.
    try {
      const perm = await navigator.permissions.query({ name: 'geolocation' });
      if (perm.state === 'denied') {
        setStatus('idle');
        showMessage('location blocked in browser settings');
        return;
      }
    } catch {
      // permissions API unavailable (older Safari) — fall through to the prompt
    }
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        // Firefox never settles the request if its permission prompt is
        // dismissed — guard so the icon can't spin forever.
        const guard = setTimeout(
          () => reject(new Error('geolocation timed out')),
          20000
        );
        navigator.geolocation.getCurrentPosition(
          (p) => {
            clearTimeout(guard);
            resolve(p);
          },
          (e) => {
            clearTimeout(guard);
            reject(e);
          },
          {
            enableHighAccuracy: false,
            timeout: 10000,
            maximumAge: 5 * 60 * 1000,
          }
        );
      });
      // Round to ~1km so precise coordinates never leave the browser.
      const lat = pos.coords.latitude.toFixed(2);
      const lon = pos.coords.longitude.toFixed(2);
      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,is_day,wind_speed_10m`
      );
      if (!res.ok) throw new Error(`weather request failed: ${res.status}`);
      const data = (await res.json()) as OpenMeteoResponse;
      const current = data.current;
      if (!current || typeof current.weather_code !== 'number') {
        throw new Error('malformed weather response');
      }
      const kind = kindFromWmo(
        current.weather_code,
        current.is_day === 1,
        Number(current.wind_speed_10m) || 0
      );
      const info: WeatherInfo = {
        kind,
        temperature: Math.round(Number(current.temperature_2m) || 0),
        description: DESCRIPTIONS[kind],
        fetchedAt: Date.now(),
      };
      writeSession(CACHE_KEY, JSON.stringify(info));
      writeSession(ENABLED_KEY, '1');
      setWeather(info);
      setStatus('active');
      // Quiet conditions (clear skies) are nearly invisible by design, so
      // confirm activation with a brief note.
      showMessage(`${info.description.toLowerCase()} · ${info.temperature}°C`);
    } catch (err) {
      setStatus('idle');
      const denied =
        typeof GeolocationPositionError !== 'undefined' &&
        err instanceof GeolocationPositionError &&
        err.code === err.PERMISSION_DENIED;
      showMessage(denied ? 'location declined' : 'weather unavailable');
    }
  }, [showMessage]);

  const toggle = useCallback(() => {
    if (status === 'loading') return;

    if (status === 'active') {
      setStatus('paused');
      writeSession(ENABLED_KEY, '0');
      return;
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      showMessage('motion disabled by your system');
      return;
    }

    const cached = readCache();
    if (cached) {
      setWeather(cached);
      setStatus('active');
      writeSession(ENABLED_KEY, '1');
      showMessage(`${cached.description.toLowerCase()} · ${cached.temperature}°C`);
      return;
    }

    if (!('geolocation' in navigator)) {
      showMessage('weather unavailable');
      return;
    }

    void fetchWeather();
  }, [status, fetchWeather, showMessage]);

  return { status, weather, message, toggle };
};

export default useWeather;
