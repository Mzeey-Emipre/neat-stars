export function parseGitHubRepo(url: string): { owner: string; repo: string } | null {
  const match = url.match(/^https?:\/\/github\.com\/([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+)/);
  if (!match) return null;

  const [, owner, repo] = match;

  const reserved = ['settings', 'organizations', 'marketplace', 'explore', 'notifications', 'new', 'login', 'signup'];
  if (reserved.includes(owner)) return null;

  return { owner, repo: repo.replace(/\.git$/, '') };
}

export function findStarButton(): HTMLElement | null {
  const starContainer = document.querySelector(
    '[data-view-component="true"].starring-container, .starring-container'
  ) as HTMLElement | null;

  if (starContainer) return starContainer;

  const starBtn = document.querySelector(
    '#repo-stars-counter-star'
  ) as HTMLElement | null;

  return starBtn?.closest('.starring-container') as HTMLElement | null ?? starBtn;
}

export function isBadgeInjected(): boolean {
  return document.querySelector('.neat-stars-badge') !== null;
}

export function removeBadge(): void {
  document.querySelectorAll('.neat-stars-badge').forEach((el) => el.remove());
}
