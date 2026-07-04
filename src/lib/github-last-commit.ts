const REPO_OWNER = 'rohzzn';
const REPO_NAME = 'basicfolio';

export type LastCommit = {
  sha: string;
  shortSha: string;
  url: string;
  message: string;
  date: string;
  additions: number;
  deletions: number;
};

function githubHeaders(): HeadersInit {
  const token = process.env.GITHUB_TOKEN;
  return {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

export async function fetchLastCommit(): Promise<LastCommit | null> {
  const headers = githubHeaders();

  const listRes = await fetch(
    `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/commits?per_page=1`,
    { headers, next: { revalidate: 300 } }
  );

  if (!listRes.ok) return null;

  const commits = (await listRes.json()) as Array<{ sha?: string }>;
  const sha = commits[0]?.sha;
  if (!sha) return null;

  const detailRes = await fetch(
    `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/commits/${sha}`,
    { headers, next: { revalidate: 300 } }
  );

  if (!detailRes.ok) return null;

  const detail = (await detailRes.json()) as {
    sha: string;
    html_url: string;
    commit: { message: string; author?: { date?: string } };
    stats?: { additions?: number; deletions?: number };
  };

  const message = detail.commit.message.split('\n')[0]?.trim() || 'Commit';

  return {
    sha: detail.sha,
    shortSha: detail.sha.slice(0, 7),
    url: detail.html_url,
    message,
    date: detail.commit.author?.date ?? new Date().toISOString(),
    additions: detail.stats?.additions ?? 0,
    deletions: detail.stats?.deletions ?? 0,
  };
}
