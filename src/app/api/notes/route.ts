import { NextRequest, NextResponse } from 'next/server';
import { getRedis } from '@/lib/redis';

export interface Note {
  id: string;
  text: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  date: string;
  displayDate: string;
  published: boolean;
}

const redis = () => getRedis();

const NOTES_KEY = 'admin-notes';

const checkAuth = (request: NextRequest): boolean => {
  const auth = request.headers.get('Authorization');
  const password = process.env.ADMIN_PASSWORD;
  return auth === `Bearer ${password}`;
};

const readNotes = async (): Promise<Note[]> => {
  const store = redis();
  if (!store) return [];

  try {
    const notes = await store.get<Note[]>(NOTES_KEY);
    return notes || [];
  } catch {
    return [];
  }
};

const writeNotes = async (notes: Note[]): Promise<void> => {
  const store = redis();
  if (!store) return;
  await store.set(NOTES_KEY, notes);
};

// GET — public (returns published only) or admin (returns all)
export async function GET(request: NextRequest) {
  const isAdmin = checkAuth(request);
  const notes = await readNotes();
  const result = isAdmin ? notes : notes.filter(n => n.published);
  const sorted = result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const res = NextResponse.json({ notes: sorted });
  if (!isAdmin) {
    // Cache public response at the edge for 60s, serve stale up to 5min while revalidating
    res.headers.set('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
  }
  return res;
}

// POST — create note (admin only)
export async function POST(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { text, mediaUrl, mediaType, date, published } = body;

  if (!text?.trim() || !date) {
    return NextResponse.json({ error: 'text and date are required' }, { status: 400 });
  }

  const d = new Date(date);
  const displayDate = d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

  const note: Note = {
    id: crypto.randomUUID(),
    text: text.trim(),
    mediaUrl: mediaUrl || undefined,
    mediaType: mediaType || undefined,
    date,
    displayDate,
    published: published ?? false,
  };

  const notes = await readNotes();
  notes.push(note);
  await writeNotes(notes);

  return NextResponse.json({ note });
}

// PATCH — update note (admin only): toggle publish, edit text/media/date
export async function PATCH(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { id, ...updates } = body;

  if (!id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 });
  }

  const notes = await readNotes();
  const index = notes.findIndex(n => n.id === id);

  if (index === -1) {
    return NextResponse.json({ error: 'Note not found' }, { status: 404 });
  }

  if (updates.date) {
    const d = new Date(updates.date);
    updates.displayDate = d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  }

  notes[index] = { ...notes[index], ...updates };
  await writeNotes(notes);

  return NextResponse.json({ note: notes[index] });
}

// DELETE — delete note (admin only)
export async function DELETE(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await request.json();

  if (!id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 });
  }

  const notes = await readNotes();
  const filtered = notes.filter(n => n.id !== id);

  if (filtered.length === notes.length) {
    return NextResponse.json({ error: 'Note not found' }, { status: 404 });
  }

  await writeNotes(filtered);
  return NextResponse.json({ success: true });
}
