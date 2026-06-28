"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { resolveDiscordAvatarSrc } from "@/lib/guestbook";
import { dicebearAvatarDataUri, guestbookInitials } from "@/lib/guestbook-avatar";

type Comment = {
  id: number;
  displayName: string;
  messageBody: string;
  createdAt: string;
  user: { login: string; avatarUrl: string };
  avatarUrl?: string;
  replyTo?: number;
  isAdmin?: boolean;
};

type CommentThread = Comment & { replies: Comment[] };

type DiscordSession = {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string;
};

function commentAvatarSrc(comment: Comment, size = 80) {
  if (comment.avatarUrl) return comment.avatarUrl;
  return dicebearAvatarDataUri(comment.displayName, comment.id, size);
}

function isDiscordAvatar(src: string): boolean {
  return src.includes("discordapp.com");
}

function GuestbookAvatar({
  src,
  size = 40,
  fallbackName = "?",
}: {
  src: string;
  size?: number;
  fallbackName?: string;
}) {
  const [pixelRatio, setPixelRatio] = useState(2);
  const [failed, setFailed] = useState(false);
  const isDiscord = isDiscordAvatar(src);

  useEffect(() => {
    setPixelRatio(Math.min(window.devicePixelRatio || 2, 3));
  }, []);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  const displaySrc = useMemo(() => {
    if (isDiscord) {
      return resolveDiscordAvatarSrc(src, size, pixelRatio);
    }
    return src;
  }, [src, size, pixelRatio, isDiscord]);

  const initials = guestbookInitials(fallbackName);

  return (
    <div
      className={
        isDiscord
          ? "shrink-0 overflow-hidden rounded-full mt-0.5 bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center"
          : "shrink-0 mt-0.5"
      }
      style={{ width: size, height: size, minWidth: size, minHeight: size }}
    >
      {failed ? (
        <span
          className="text-zinc-600 dark:text-zinc-300 font-medium select-none"
          style={{ fontSize: Math.max(11, size * 0.38) }}
        >
          {initials}
        </span>
      ) : (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={displaySrc}
          alt=""
          className={isDiscord ? "block object-cover" : "block"}
          style={{ width: size, height: size }}
          decoding="async"
          draggable={false}
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function buildThreads(comments: Comment[]): CommentThread[] {
  const roots = comments.filter(c => !c.replyTo);
  const replies = comments.filter(c => c.replyTo);
  return roots.map(root => ({
    ...root,
    replies: replies
      .filter(r => r.replyTo === root.id)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
  }));
}

function GuestbookEntry({
  comment,
  nested = false,
  isAdmin,
  replyingTo,
  onReply,
  onCancelReply,
  onSubmitReply,
  onDelete,
  replySending,
}: {
  comment: Comment;
  nested?: boolean;
  isAdmin: boolean;
  replyingTo: number | null;
  onReply: (id: number) => void;
  onCancelReply: () => void;
  onSubmitReply: (parentId: number, message: string) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  replySending: boolean;
}) {
  const [replyText, setReplyText] = useState("");
  const isReplyOpen = replyingTo === comment.id;

  return (
    <article className={nested ? "flex gap-3 py-3" : "flex gap-3 py-4 border-b border-zinc-200/80 dark:border-zinc-800/80 last:border-0"}>
      <GuestbookAvatar
        src={commentAvatarSrc(comment, nested ? 64 : 80)}
        size={nested ? 32 : 40}
        fallbackName={comment.displayName}
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2 mb-1 flex-wrap">
          <span className="text-sm font-medium dark:text-white truncate">
            {comment.displayName || "Anonymous"}
          </span>
          {comment.isAdmin && (
            <span className="text-[10px] uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
              admin
            </span>
          )}
          <time className="text-xs text-zinc-400 dark:text-zinc-500 tabular-nums shrink-0">
            {relativeTime(comment.createdAt)}
          </time>
        </div>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed whitespace-pre-wrap break-words">
          {comment.messageBody}
        </p>

        {isAdmin && (
          <div className="flex items-center gap-3 mt-2">
            {!nested && (
              <button
                type="button"
                onClick={() => onReply(comment.id)}
                className="text-xs text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
              >
                Reply
              </button>
            )}
            <button
              type="button"
              onClick={() => void onDelete(comment.id)}
              className="text-xs text-zinc-400 hover:text-red-500 transition-colors"
            >
              Delete
            </button>
          </div>
        )}

        {isReplyOpen && !nested && (
          <div className="mt-3 flex flex-col gap-2">
            <textarea
              value={replyText}
              onChange={e => setReplyText(e.target.value)}
              placeholder="Write a reply…"
              rows={2}
              disabled={replySending}
              className="bg-transparent border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-600 resize-none"
            />
            <div className="flex gap-2">
              <button
                type="button"
                disabled={replySending || !replyText.trim()}
                onClick={() => void onSubmitReply(comment.id, replyText).then(() => setReplyText(""))}
                className="px-3 py-1.5 text-xs bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg hover:opacity-80 disabled:opacity-40"
              >
                {replySending ? "Sending…" : "Post reply"}
              </button>
              <button
                type="button"
                onClick={onCancelReply}
                disabled={replySending}
                className="px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}

export default function GuestbookPage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasNext, setHasNext] = useState(false);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [discordUser, setDiscordUser] = useState<DiscordSession | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replySending, setReplySending] = useState(false);

  const threads = useMemo(() => buildThreads(comments), [comments]);

  const fetchPage = useCallback(async (p: number, append = false) => {
    if (p === 1) setLoading(true);
    else setLoadingMore(true);
    try {
      const res = await fetch(`/api/guestbook?page=${p}`);
      if (!res.ok) throw new Error("fetch failed");
      const data = await res.json();
      const incoming: Comment[] = data.comments || [];
      setComments(prev =>
        append
          ? [...prev, ...incoming.filter(c => !prev.some(x => x.id === c.id))]
          : incoming
      );
      setHasNext(!!data.pagination?.hasNextPage);
      setPage(p);
    } catch {
      setError("Couldn't load entries.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  const fetchDiscordSession = useCallback(async () => {
    try {
      const res = await fetch("/api/guestbook/discord/me");
      if (!res.ok) return;
      const data = await res.json();
      setDiscordUser(data.user ?? null);
      setIsAdmin(!!data.isAdmin);
    } catch {
      setDiscordUser(null);
      setIsAdmin(false);
    }
  }, []);

  useEffect(() => { fetchPage(1); }, [fetchPage]);
  useEffect(() => { void fetchDiscordSession(); }, [fetchDiscordSession]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (!params.has("discordAuth")) return;
    void fetchDiscordSession();
    const url = new URL(window.location.href);
    url.searchParams.delete("discordAuth");
    window.history.replaceState({}, "", url.pathname + url.search);
  }, [fetchDiscordSession]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const postingWithDiscord = !!discordUser;
    const submitName = postingWithDiscord ? discordUser.displayName : name.trim();
    if (!submitName || !message.trim()) return;

    setSending(true);
    setFormError(null);

    const optimistic: Comment = {
      id: Date.now(),
      displayName: submitName,
      messageBody: message,
      createdAt: new Date().toISOString(),
      user: { login: "you", avatarUrl: "" },
      ...(postingWithDiscord && { avatarUrl: discordUser.avatarUrl }),
      ...(isAdmin && { isAdmin: true }),
    };
    setComments(prev => [optimistic, ...prev]);

    try {
      const res = await fetch("/api/guestbook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: submitName,
          message,
          useDiscord: postingWithDiscord,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to post");

      setComments(prev =>
        prev.map(c =>
          c.id === optimistic.id
            ? { ...c, id: data.comment.id, createdAt: data.comment.createdAt, avatarUrl: data.comment.avatarUrl, isAdmin: data.comment.isAdmin }
            : c
        )
      );
      if (!postingWithDiscord) setName("");
      setMessage("");
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Something went wrong.");
      setComments(prev => prev.filter(c => c.id !== optimistic.id));
    } finally {
      setSending(false);
    }
  };

  const handleSubmitReply = async (parentId: number, replyMessage: string) => {
    if (!discordUser || !isAdmin || !replyMessage.trim()) return;

    setReplySending(true);
    const optimistic: Comment = {
      id: Date.now(),
      displayName: discordUser.displayName,
      messageBody: replyMessage,
      createdAt: new Date().toISOString(),
      user: { login: "you", avatarUrl: "" },
      avatarUrl: discordUser.avatarUrl,
      replyTo: parentId,
      isAdmin: true,
    };
    setComments(prev => [...prev, optimistic]);
    setReplyingTo(null);

    try {
      const res = await fetch("/api/guestbook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: replyMessage,
          useDiscord: true,
          replyTo: parentId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to reply");

      setComments(prev =>
        prev.map(c =>
          c.id === optimistic.id
            ? { ...c, id: data.comment.id, createdAt: data.comment.createdAt }
            : c
        )
      );
    } catch {
      setComments(prev => prev.filter(c => c.id !== optimistic.id));
    } finally {
      setReplySending(false);
    }
  };

  const handleDelete = async (commentId: number) => {
    if (!isAdmin || !confirm("Delete this entry?")) return;

    const snapshot = comments;
    setComments(prev => prev.filter(c => c.id !== commentId && c.replyTo !== commentId));

    try {
      const res = await fetch("/api/guestbook", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commentId }),
      });
      if (!res.ok) throw new Error("delete failed");

      const replies = snapshot.filter(c => c.replyTo === commentId);
      await Promise.all(
        replies.map(r =>
          fetch("/api/guestbook", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ commentId: r.id }),
          })
        )
      );
    } catch {
      setComments(snapshot);
    }
  };

  const canSubmit = message.trim() && (discordUser ? discordUser.displayName : name.trim());

  return (
    <div style={{ maxWidth: "75ch" }}>
      <h2 className="text-lg font-medium dark:text-white mb-2">Guestbook</h2>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-8">
        Say hello if you&apos;ve stopped by. I read every message.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3 mb-10">
        {!discordUser && (
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Your name"
            required
            disabled={sending}
            className="bg-transparent border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-600"
          />
        )}
        <textarea
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder="Your message…"
          required
          disabled={sending}
          rows={3}
          className="bg-transparent border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-600 resize-none"
        />
        {formError && <p className="text-xs text-red-500">{formError}</p>}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="submit"
            disabled={sending || !canSubmit}
            className="px-4 py-2 text-sm bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg hover:opacity-80 transition-opacity disabled:opacity-40"
          >
            {sending ? "Sending…" : "Leave a note"}
          </button>
          {discordUser ? (
            <div className="flex items-center gap-2">
              <GuestbookAvatar src={discordUser.avatarUrl} size={32} />
              <button
                type="button"
                onClick={async () => {
                  await fetch("/api/guestbook/discord/disconnect", { method: "POST" });
                  setDiscordUser(null);
                  setIsAdmin(false);
                }}
                className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
              >
                Sign out
              </button>
            </div>
          ) : (
            <a
              href="/api/guestbook/discord/start?returnTo=/guestbook"
              className="px-4 py-2 text-sm border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-lg hover:border-zinc-300 dark:hover:border-zinc-700 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors"
            >
              Sign with Discord
            </a>
          )}
        </div>
      </form>

      {loading ? (
        <div className="space-y-4">
          {[0, 1, 2].map(i => (
            <div key={i} className="flex gap-3 py-4 animate-pulse">
              <div className="w-9 h-9 rounded-full bg-zinc-100 dark:bg-zinc-800 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-24 bg-zinc-100 dark:bg-zinc-800 rounded" />
                <div className="h-3 w-full bg-zinc-100 dark:bg-zinc-800 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <p className="text-sm text-red-400">{error}</p>
      ) : threads.length === 0 ? (
        <p className="text-sm text-zinc-400 dark:text-zinc-600">No entries yet — be the first.</p>
      ) : (
        <>
          <div>
            {threads.map(thread => (
              <div key={thread.id}>
                <GuestbookEntry
                  comment={thread}
                  isAdmin={isAdmin}
                  replyingTo={replyingTo}
                  onReply={setReplyingTo}
                  onCancelReply={() => setReplyingTo(null)}
                  onSubmitReply={handleSubmitReply}
                  onDelete={handleDelete}
                  replySending={replySending}
                />
                {thread.replies.length > 0 && (
                  <div className="ml-6 pl-4 border-l border-zinc-200/80 dark:border-zinc-800/80 mb-2">
                    {thread.replies.map(reply => (
                      <GuestbookEntry
                        key={reply.id}
                        comment={reply}
                        nested
                        isAdmin={isAdmin}
                        replyingTo={replyingTo}
                        onReply={setReplyingTo}
                        onCancelReply={() => setReplyingTo(null)}
                        onSubmitReply={handleSubmitReply}
                        onDelete={handleDelete}
                        replySending={replySending}
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          {hasNext && (
            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={() => fetchPage(page + 1, true)}
                disabled={loadingMore}
                className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors disabled:opacity-40"
              >
                {loadingMore ? "Loading…" : "Load more"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
