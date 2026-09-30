// Scenes that hit hardest, shown under "peak" on /hobbies/watchlist.
// Each card plays only start..end (seconds) of the YouTube video.

export interface PeakClip {
  youtubeId: string;
  from: string;
  moment: string;
  kind: 'anime' | 'movie' | 'show';
  start: number;
  end?: number;
  // Use YouTube's own frame from 25/50/75% through the video instead of
  // the uploader's thumbnail, for uploads with clickbait covers
  frame?: 1 | 2 | 3;
}

export const PEAK_CLIPS: PeakClip[] = [
  {
    youtubeId: 'ivRGWL-MKi4',
    from: 'Demon Slayer: Mugen Train',
    moment: 'Rengoku’s last stand against Akaza: “set your heart ablaze”',
    kind: 'anime',
    start: 290,
    end: 436,
    frame: 3,
  },
];
