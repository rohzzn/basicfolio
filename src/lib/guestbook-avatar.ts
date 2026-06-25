import { createAvatar } from '@dicebear/core';
import * as adventurer from '@dicebear/adventurer';

export function guestbookAvatarSeed(name: string, id: number): string {
  return `${name}-${id}`.slice(0, 80);
}

/** Generate avatar locally — no external API, always loads. */
export function dicebearAvatarDataUri(name: string, id: number, size = 80): string {
  const svg = createAvatar(adventurer, {
    seed: guestbookAvatarSeed(name, id),
    size,
    radius: 50,
  }).toString();

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export function guestbookInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
  return `${parts[0].slice(0, 1)}${parts[1].slice(0, 1)}`.toUpperCase();
}
