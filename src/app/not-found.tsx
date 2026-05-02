import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-start" style={{ maxWidth: '52ch' }}>
      <p className="text-sm text-zinc-400 dark:text-zinc-500 mb-2 font-medium uppercase tracking-wider">
        404
      </p>
      <h1 className="text-lg font-medium dark:text-white mb-3">
        Page not found
      </h1>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed mb-8">
        This page doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/"
        className="text-sm text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors"
      >
        ← Back home
      </Link>
    </div>
  );
}
