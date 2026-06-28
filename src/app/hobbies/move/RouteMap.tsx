'use client';

import React from 'react';
import { decode } from '@mapbox/polyline';

interface RouteMapProps {
  polyline: string;
}

export default function RouteMap({ polyline }: RouteMapProps) {
  const points = decode(polyline);
  if (points.length < 2) return null;

  const lats = points.map(p => p[0]);
  const lngs = points.map(p => p[1]);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const latRange = maxLat - minLat || 0.001;
  const lngRange = maxLng - minLng || 0.001;
  const W = 500;
  const H = 160;
  const pad = 24;

  const toXY = (lat: number, lng: number) => [
    pad + ((lng - minLng) / lngRange) * (W - 2 * pad),
    pad + ((maxLat - lat) / latRange) * (H - 2 * pad),
  ];

  const d = points
    .map(([lat, lng], i) => {
      const [x, y] = toXY(lat, lng);
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  const [sx, sy] = toXY(points[0][0], points[0][1]);
  const [ex, ey] = toXY(points[points.length - 1][0], points[points.length - 1][1]);

  return (
    <div className="overflow-hidden bg-zinc-100 dark:bg-zinc-800/60">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 100 }}>
        <path
          d={d}
          fill="none"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="stroke-zinc-600 dark:stroke-zinc-300"
        />
        <circle cx={sx} cy={sy} r="4" className="fill-zinc-500 dark:fill-zinc-400" />
        <circle cx={ex} cy={ey} r="4" className="fill-zinc-700 dark:fill-zinc-200" />
      </svg>
    </div>
  );
}
