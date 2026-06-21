export const EREADER_STORAGE_KEY = 'basicfolio:ereader:v1';

export const EREADER_CHANGE_EVENT = 'basicfolio:ereader-change';

let hadDarkBeforeEReader = false;

function safeParseEnabled(raw: string | null): boolean {
  if (!raw) return false;
  try {
    const parsed = JSON.parse(raw) as { enabled?: boolean };
    return Boolean(parsed.enabled);
  } catch {
    return false;
  }
}

export function getEReaderEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  return safeParseEnabled(localStorage.getItem(EREADER_STORAGE_KEY));
}

export function applyEReaderMode(enabled: boolean): void {
  const root = document.documentElement;

  if (enabled) {
    hadDarkBeforeEReader = root.classList.contains('dark');
    root.classList.remove('dark');
    root.classList.add('e-reader-mode');
  } else {
    root.classList.remove('e-reader-mode');
    if (hadDarkBeforeEReader) root.classList.add('dark');
    hadDarkBeforeEReader = false;
  }
}

export function setEReaderEnabled(enabled: boolean): void {
  if (typeof window === 'undefined') return;

  localStorage.setItem(EREADER_STORAGE_KEY, JSON.stringify({ enabled }));
  applyEReaderMode(enabled);
  window.dispatchEvent(new CustomEvent(EREADER_CHANGE_EVENT, { detail: { enabled } }));
}

export function toggleEReaderMode(): boolean {
  const next = !getEReaderEnabled();
  setEReaderEnabled(next);
  return next;
}
