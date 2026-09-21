import React from 'react';
import films from '@/data/writing-films.json';
import FilmPlate from './FilmPlate';

// A post's opening film, looked up by its slug in the writing films.
export default function PostFilm({ slug }: { slug: string }) {
  return <FilmPlate film={films[slug as keyof typeof films]} />;
}
