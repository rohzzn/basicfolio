'use client';

import { useEffect, useState } from 'react';

export const DESKTOP_PREVIEW_QUERY = '(min-width: 1024px)';

export function useDesktopPreviewEnabled(): boolean {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(DESKTOP_PREVIEW_QUERY);
    const update = () => setEnabled(media.matches);

    update();
    media.addEventListener('change', update);

    return () => media.removeEventListener('change', update);
  }, []);

  return enabled;
}

export function isDesktopPreviewEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia(DESKTOP_PREVIEW_QUERY).matches;
}
