// Live repository numbers from the GitHub REST API. Server-only.
//
// Results are cached by Next.js for an hour, so the public API's anonymous
// rate limit is never a problem. Set GITHUB_TOKEN to raise the limit (and to
// read private repositories). Any failure returns null — the UI simply hides
// the numbers instead of inventing them.

const REVALIDATE_SECONDS = 3600;

export async function getRepoStats(repo) {
  if (!repo) return null;
  try {
    const headers = { Accept: "application/vnd.github+json" };
    if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    const res = await fetch(`https://api.github.com/repos/${repo}`, {
      headers,
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!res.ok) return null;
    const r = await res.json();
    return {
      stars: r.stargazers_count ?? 0,
      forks: r.forks_count ?? 0,
      language: r.language || null,
      license: r.license?.spdx_id && r.license.spdx_id !== "NOASSERTION" ? r.license.spdx_id : null,
      pushedAt: r.pushed_at || null,
      defaultBranch: r.default_branch || "main",
    };
  } catch {
    return null;
  }
}

/** { [slug]: stats | null } for a list of projects, fetched in parallel. */
export async function getStatsForProjects(projects) {
  const entries = await Promise.all(
    projects.map(async (p) => [p.slug, p.repoPrivate ? null : await getRepoStats(p.repo)])
  );
  return Object.fromEntries(entries);
}
