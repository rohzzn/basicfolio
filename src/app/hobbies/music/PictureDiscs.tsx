import React from 'react';
import Image from '@/components/SiteImage';

// The top artists, each pressed onto a picture disc: their photo printed on the vinyl under the
// grooves, a paper label and a spindle hole in the middle. Hovering one sets it turning.

export interface Disc {
  id: string;
  name: string;
  image: string | null;
  genres: string[];
  href: string;
}

export default function PictureDiscs({ discs }: { discs: Disc[] }) {
  return (
    <ol className="discs">
      {discs.map((d, i) => (
        <li key={d.id} className="min-w-0">
          <a href={d.href} target="_blank" rel="noopener noreferrer" className="disc-link">
            <span className="disc">
              <span className="disc-spin">
                {d.image ? <Image src={d.image} alt={d.name} fill unoptimized className="object-cover" /> : null}
                <span className="disc-grooves" />
                <span className="disc-label" />
              </span>
              <span className="disc-sheen" />
            </span>
            <span className="mt-3 flex items-baseline gap-1.5">
              <span className="music-hand text-sm text-[color:var(--mu-muted)]">{i + 1}.</span>
              <span className="truncate text-sm font-medium text-zinc-800 dark:text-neutral-200">{d.name}</span>
            </span>
            <span className="mt-0.5 block truncate text-xs text-zinc-500 dark:text-neutral-400">
              {d.genres.length ? d.genres.slice(0, 2).join(', ') : ' '}
            </span>
          </a>
        </li>
      ))}
    </ol>
  );
}
