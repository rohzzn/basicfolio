"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';

interface Note {
  id: string;
  text: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  date: string;
  displayDate: string;
  published: boolean;
}

type Screen = 'login' | 'list' | 'compose' | 'edit';

export default function NotesAdminPage() {
  const [screen, setScreen] = useState<Screen>('login');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  // Form state
  const [text, setText] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [published, setPublished] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const authHeader = { Authorization: `Bearer ${password}` };

  const fetchNotes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/notes', { headers: authHeader });
      if (res.status === 401) { setScreen('login'); return; }
      const data = await res.json();
      setNotes(data.notes || []);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [password]);

  useEffect(() => {
    if (screen === 'list') fetchNotes();
  }, [screen, fetchNotes]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;
    setAuthError('');
    // Verify immediately by hitting the API
    fetch('/api/notes', { headers: { Authorization: `Bearer ${password}` } }).then(res => {
      if (res.ok) {
        setScreen('list');
      } else {
        setAuthError('Wrong password.');
      }
    });
  };

  const openCompose = () => {
    setEditingNote(null);
    setText('');
    setMediaUrl('');
    setMediaType('image');
    setDate(new Date().toISOString().slice(0, 10));
    setPublished(false);
    setFormError('');
    setScreen('compose');
  };

  const openEdit = (note: Note) => {
    setEditingNote(note);
    setText(note.text);
    setMediaUrl(note.mediaUrl || '');
    setMediaType(note.mediaType || 'image');
    setDate(note.date.slice(0, 10));
    setPublished(note.published);
    setFormError('');
    setScreen('edit');
  };

  const handleSave = async () => {
    if (!text.trim()) { setFormError('Text is required.'); return; }
    setSaving(true);
    setFormError('');
    try {
      const body: Record<string, unknown> = { text, date, published };
      if (mediaUrl.trim()) { body.mediaUrl = mediaUrl.trim(); body.mediaType = mediaType; }

      if (editingNote) {
        await fetch('/api/notes', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', ...authHeader },
          body: JSON.stringify({ id: editingNote.id, ...body }),
        });
      } else {
        await fetch('/api/notes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...authHeader },
          body: JSON.stringify(body),
        });
      }
      setScreen('list');
    } catch {
      setFormError('Something went wrong. Try again.');
    } finally {
      setSaving(false);
    }
  };

  const togglePublish = async (note: Note) => {
    await fetch('/api/notes', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...authHeader },
      body: JSON.stringify({ id: note.id, published: !note.published }),
    });
    setNotes(prev => prev.map(n => n.id === note.id ? { ...n, published: !n.published } : n));
  };

  const deleteNote = async (id: string) => {
    if (!confirm('Delete this note?')) return;
    await fetch('/api/notes', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', ...authHeader },
      body: JSON.stringify({ id }),
    });
    setNotes(prev => prev.filter(n => n.id !== id));
  };

  // ── Login ──────────────────────────────────────────────────────────────────
  if (screen === 'login') {
    return (
      <div className="max-w-sm">
        <h2 className="text-lg font-medium dark:text-white mb-6">Notes</h2>
        <form onSubmit={handleLogin} className="flex flex-col gap-3">
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Password"
            autoFocus
            className="bg-transparent border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-600 dark:text-white"
          />
          {authError && <p className="text-xs text-red-500">{authError}</p>}
          <button
            type="submit"
            className="px-4 py-2 text-sm bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg hover:opacity-80 transition-opacity"
          >
            Enter
          </button>
        </form>
      </div>
    );
  }

  // ── Compose / Edit form ────────────────────────────────────────────────────
  if (screen === 'compose' || screen === 'edit') {
    return (
      <div className="max-w-lg">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => setScreen('list')}
            className="text-xs text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
          >
            ← back
          </button>
          <h2 className="text-lg font-medium dark:text-white">
            {screen === 'edit' ? 'Edit note' : 'New note'}
          </h2>
        </div>

        <div className="flex flex-col gap-4">
          {/* Text */}
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="What's on your mind..."
            rows={4}
            autoFocus
            className="bg-transparent border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-3 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-600 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600"
          />

          {/* Media URL */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-zinc-500 dark:text-zinc-400">Media URL</span>
              <div className="flex gap-1">
                {(['image', 'video'] as const).map(t => (
                  <button
                    key={t}
                    onClick={() => setMediaType(t)}
                    className={`text-xs px-2 py-0.5 rounded transition-colors ${
                      mediaType === t
                        ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900'
                        : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <input
              type="url"
              value={mediaUrl}
              onChange={e => setMediaUrl(e.target.value)}
              placeholder="https://..."
              className="w-full bg-transparent border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-600 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600"
            />
          </div>

          {/* Preview */}
          {mediaUrl && mediaType === 'image' && (
            <div className="rounded-lg overflow-hidden border border-zinc-100 dark:border-zinc-800">
              <Image src={mediaUrl} alt="preview" width={600} height={400} className="w-full h-auto object-cover" unoptimized />
            </div>
          )}
          {mediaUrl && mediaType === 'video' && (
            <div className="rounded-lg overflow-hidden border border-zinc-100 dark:border-zinc-800">
              <video src={mediaUrl} controls className="w-full" />
            </div>
          )}

          {/* Date */}
          <div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-2">Date</p>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="bg-transparent border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-600 dark:text-white"
            />
          </div>

          {/* Published toggle */}
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <div
              onClick={() => setPublished(p => !p)}
              className={`w-9 h-5 rounded-full transition-colors relative ${
                published ? 'bg-zinc-900 dark:bg-zinc-100' : 'bg-zinc-200 dark:bg-zinc-700'
              }`}
            >
              <div className={`absolute top-0.5 w-4 h-4 rounded-full transition-transform ${
                published
                  ? 'translate-x-4 bg-white dark:bg-zinc-900'
                  : 'translate-x-0.5 bg-white dark:bg-zinc-400'
              }`} />
            </div>
            <span className="text-sm text-zinc-600 dark:text-zinc-400">
              {published ? 'Published' : 'Draft'}
            </span>
          </label>

          {formError && <p className="text-xs text-red-500">{formError}</p>}

          <div className="flex gap-3 pt-1">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2 text-sm bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg hover:opacity-80 transition-opacity disabled:opacity-50"
            >
              {saving ? 'Saving…' : screen === 'edit' ? 'Save changes' : 'Publish'}
            </button>
            <button
              onClick={() => setScreen('list')}
              className="px-5 py-2 text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── List ───────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-medium dark:text-white">Notes</h2>
        <button
          onClick={openCompose}
          className="text-sm px-4 py-1.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg hover:opacity-80 transition-opacity"
        >
          + New
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-zinc-400 dark:text-zinc-500">Loading…</p>
      ) : notes.length === 0 ? (
        <p className="text-sm text-zinc-400 dark:text-zinc-500">No notes yet.</p>
      ) : (
        <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {notes.map(note => (
            <div key={note.id} className="py-4">
              <div className="flex items-start justify-between gap-4 mb-1">
                <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-snug flex-1">
                  {note.text}
                </p>
                <span className={`text-[10px] flex-shrink-0 mt-0.5 font-medium ${
                  note.published
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-zinc-400 dark:text-zinc-600'
                }`}>
                  {note.published ? 'live' : 'draft'}
                </span>
              </div>

              {note.mediaUrl && note.mediaType === 'image' && (
                <div className="mt-2 mb-2 rounded-lg overflow-hidden border border-zinc-100 dark:border-zinc-800 max-w-xs">
                  <Image src={note.mediaUrl} alt="" width={400} height={300} className="w-full h-auto object-cover" unoptimized />
                </div>
              )}
              {note.mediaUrl && note.mediaType === 'video' && (
                <div className="mt-2 mb-2 rounded-lg overflow-hidden border border-zinc-100 dark:border-zinc-800 max-w-xs">
                  <video src={note.mediaUrl} controls className="w-full" />
                </div>
              )}

              <div className="flex items-center gap-4 mt-2">
                <span className="text-xs text-zinc-400 dark:text-zinc-600">{note.displayDate}</span>
                <button
                  onClick={() => togglePublish(note)}
                  className="text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
                >
                  {note.published ? 'Unpublish' : 'Publish'}
                </button>
                <button
                  onClick={() => openEdit(note)}
                  className="text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteNote(note.id)}
                  className="text-xs text-red-400 hover:text-red-600 dark:hover:text-red-300 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
