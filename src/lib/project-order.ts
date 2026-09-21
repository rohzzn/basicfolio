import type { Project } from '@/data/projects';

// The order projects are shown in on /projects, and walked through by the previous / next links
// at the foot of each project: a pinned project holds the front of its category whatever the year
// says, then newest first, then by name.
export function sortByLatest(list: Project[]): Project[] {
  return [...list].sort((a, b) => {
    if (Boolean(a.pinned) !== Boolean(b.pinned)) return a.pinned ? -1 : 1;
    const yearDiff = (b.year ?? 0) - (a.year ?? 0);
    if (yearDiff !== 0) return yearDiff;
    return a.title.localeCompare(b.title);
  });
}
