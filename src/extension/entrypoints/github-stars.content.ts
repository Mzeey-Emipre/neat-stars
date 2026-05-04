import { fetchScore, isScore, isNoData } from '@/utils/api';
import { getScoreColor, getScoreIcon, formatPct, PRESETS } from '@/utils/score';
import { parseGitHubRepo, findStarButton, isBadgeInjected, removeBadge } from '@/utils/github-dom';
import badgeCss from '@/assets/badge.css?raw';

export default defineContentScript({
  matches: ['https://github.com/*/*'],
  runAt: 'document_idle',

  async main(ctx) {
    const style = document.createElement('style');
    style.textContent = badgeCss;
    document.head.appendChild(style);
    ctx.onInvalidated(() => style.remove());

    await injectBadge();

    ctx.addEventListener(window, 'wxt:locationchange', async () => {
      removeBadge();
      await injectBadge();
    });
  },
});

async function injectBadge(): Promise<void> {
  const parsed = parseGitHubRepo(window.location.href);
  if (!parsed) return;

  if (isBadgeInjected()) return;

  const starButton = findStarButton();
  if (!starButton) return;

  const badge = createBadgeElement('grey', '\u2014', 'Loading...');
  starButton.appendChild(badge);

  try {
    const response = await fetchScore(parsed.owner, parsed.repo);

    if (isScore(response)) {
      const color = getScoreColor(response.clean_pct, PRESETS.balanced);
      const icon = getScoreIcon(color);
      const pct = formatPct(response.clean_pct);

      updateBadge(badge, color, icon, pct, {
        total: response.total_stars,
        clean: response.clean_stars,
        suspicious: response.suspicious_stars,
      });
    } else if (isNoData(response)) {
      updateBadge(badge, 'grey', '\u2014', '\u2014', null);
    } else {
      updateBadge(badge, 'grey', '\u2014', '\u2014', null);
    }
  } catch {
    updateBadge(badge, 'grey', '\u2014', '\u2014', null);
  }
}

function createBadgeElement(
  color: string,
  icon: string,
  text: string
): HTMLSpanElement {
  const badge = document.createElement('span');
  badge.className = `neat-stars-badge ${color}`;
  badge.innerHTML = `
    <span class="neat-stars-icon">${icon}</span>
    <span class="neat-stars-pct">${text}</span>
  `;
  return badge;
}

function updateBadge(
  badge: HTMLSpanElement,
  color: string,
  icon: string,
  pct: string,
  breakdown: { total: number; clean: number; suspicious: number } | null
): void {
  badge.className = `neat-stars-badge ${color}`;

  let tooltipHtml = '';
  if (breakdown) {
    tooltipHtml = `
      <div class="neat-stars-tooltip">
        <div class="tooltip-row">
          <span class="tooltip-label">Total stars</span>
          <span>${breakdown.total.toLocaleString()}</span>
        </div>
        <div class="tooltip-row">
          <span class="tooltip-label">Clean</span>
          <span>${breakdown.clean.toLocaleString()}</span>
        </div>
        <div class="tooltip-row">
          <span class="tooltip-label">Suspicious</span>
          <span>${breakdown.suspicious.toLocaleString()}</span>
        </div>
      </div>
    `;
  }

  badge.innerHTML = `
    <span class="neat-stars-icon">${icon}</span>
    <span class="neat-stars-pct">${pct}</span>
    ${tooltipHtml}
  `;
}
