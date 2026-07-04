import React, { useState, useEffect } from 'react';

import Image from 'next/image';

import { Music } from 'lucide-react';

import SpotifyPreviewPlayButton from './SpotifyPreviewPlayButton';



interface SpotifyTrackMeta {

  id: string;

  name: string;

  artists: string;

  imageUrl: string;

  spotifyUrl: string;

  durationMs: number;

}



interface CurrentlyPlaying {

  isPlaying: boolean;

  track: SpotifyTrackMeta;

  progressMs: number;

}



interface CurrentlyPlayingResponse {

  isPlaying: boolean;

  progressMs: number;

  track: SpotifyTrackMeta | null;

}



const SpotifyCurrentlyPlaying: React.FC = () => {

  const [currentlyPlaying, setCurrentlyPlaying] = useState<CurrentlyPlaying | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);



  useEffect(() => {

    let isMounted = true;

    const fetchCurrentlyPlaying = async () => {

      try {

        const response = await fetch('/api/spotify/currently-playing', {

          cache: 'no-store',

        });



        if (!response.ok) {

          throw new Error(`Error fetching currently playing: ${response.status}`);

        }



        const data = (await response.json()) as CurrentlyPlayingResponse;



        if (!isMounted) return;



        if (data.track) {

          setCurrentlyPlaying({

            isPlaying: data.isPlaying,

            track: data.track,

            progressMs: data.progressMs,

          });

          setError(null);

        } else {

          setCurrentlyPlaying(null);

        }

      } catch (fetchError) {

        console.error('Error fetching currently playing:', fetchError);

        if (isMounted) {

          setError('Failed to fetch currently playing track');

        }

      } finally {

        if (isMounted) {

          setLoading(false);

        }

      }

    };



    void fetchCurrentlyPlaying();

    const intervalId = setInterval(fetchCurrentlyPlaying, 10000);



    return () => {

      isMounted = false;

      if (intervalId) clearInterval(intervalId);

    };

  }, []);



  if (loading) {

    return (

      <div className="flex items-center justify-center py-2">

        <div className="animate-pulse flex space-x-2 items-center">

          <Music className="w-3 h-3 text-zinc-400" />

          <span className="text-xs text-zinc-400">Loading...</span>

        </div>

      </div>

    );

  }



  if (error) {

    return (

      <div className="text-xs text-zinc-400 text-center py-2">

        <span className="flex items-center justify-center gap-1">

          <Music className="w-3 h-3" /> Spotify unavailable

        </span>

      </div>

    );

  }



  if (!currentlyPlaying) {

    return null;

  }



  const { track, progressMs } = currentlyPlaying;



  return (

    <div className="w-full">

      <div className="flex items-center gap-2">

        <div className="relative min-w-[40px] w-10 h-10 flex-shrink-0 group">

          <Image

            src={track.imageUrl}

            alt={track.name}

            className="rounded-md object-cover"

            fill

            sizes="40px"

            unoptimized

          />

          <div className="absolute inset-0 hidden rounded-md bg-black/0 transition-colors group-hover:bg-black/30 lg:flex items-center justify-center">

            <SpotifyPreviewPlayButton

              trackId={track.id}

              trackName={track.name}

              artists={track.artists}

              imageUrl={track.imageUrl}

              spotifyUrl={track.spotifyUrl}

              durationMs={track.durationMs}

              size="sm"

              className="opacity-0 group-hover:opacity-100"

            />

          </div>

        </div>



        <div className="flex-1 min-w-0">

          <div className="mb-0.5">

            <span className="text-xs font-medium text-zinc-700 dark:text-neutral-300 truncate block">

              {track.name}

            </span>

          </div>

          <p className="text-[10px] text-zinc-600 dark:text-neutral-400 truncate">

            {track.artists}

          </p>



          <div className="w-full h-1 bg-zinc-200 dark:bg-neutral-700 rounded-full mt-1.5 overflow-hidden">

            <div

              className="h-full bg-emerald-500 rounded-full"

              style={{

                width: `${(progressMs / track.durationMs) * 100}%`,

              }}

            />

          </div>

        </div>

      </div>

    </div>

  );

};



export default SpotifyCurrentlyPlaying;

