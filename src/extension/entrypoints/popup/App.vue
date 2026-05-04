<script setup lang="ts">
import { ref, onMounted } from 'vue';

interface RepoScore {
  owner: string;
  repo: string;
  total_stars: number;
  clean_stars: number;
  suspicious_stars: number;
  clean_pct: number;
  source: 'starscout' | 'realtime';
}

const score = ref<RepoScore | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);
const noRepo = ref(false);

onMounted(async () => {
  try {
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
    const url = tab?.url;
    if (!url) {
      noRepo.value = true;
      loading.value = false;
      return;
    }

    const match = url.match(/^https?:\/\/github\.com\/([^/]+)\/([^/]+)/);
    if (!match) {
      noRepo.value = true;
      loading.value = false;
      return;
    }

    const [, owner, repo] = match;
    const response = await fetch(
      `${import.meta.env.WXT_API_URL ?? 'http://localhost:8787'}/api/score/${owner}/${repo}`
    );

    if (!response.ok) {
      error.value = 'Could not fetch score';
      loading.value = false;
      return;
    }

    score.value = await response.json();
  } catch (e) {
    error.value = 'Failed to connect to API';
  } finally {
    loading.value = false;
  }
});

function colorClass(pct: number): string {
  if (pct >= 80) return 'green';
  if (pct >= 50) return 'yellow';
  return 'red';
}
</script>

<template>
  <div class="popup">
    <header class="popup-header">
      <h1>Neat Stars</h1>
    </header>

    <div v-if="loading" class="state">Loading...</div>
    <div v-else-if="noRepo" class="state">Navigate to a GitHub repo to see its star health.</div>
    <div v-else-if="error" class="state error">{{ error }}</div>

    <div v-else-if="score" class="score-card">
      <div class="score-main" :class="colorClass(score.clean_pct)">
        <span class="pct">{{ Math.round(score.clean_pct) }}%</span>
        <span class="label">clean</span>
      </div>
      <div class="details">
        <div class="repo-name">{{ score.owner }}/{{ score.repo }}</div>
        <div class="breakdown">
          <span>{{ score.total_stars.toLocaleString() }} total</span>
          <span class="sep">&middot;</span>
          <span>{{ score.clean_stars.toLocaleString() }} clean</span>
          <span class="sep">&middot;</span>
          <span>{{ score.suspicious_stars.toLocaleString() }} suspicious</span>
        </div>
        <div class="source">Source: {{ score.source === 'starscout' ? 'StarScout research data' : 'Real-time analysis' }}</div>
      </div>
    </div>
  </div>
</template>

<style>
:root {
  --bg: #0d1117;
  --surface: #161b22;
  --border: #30363d;
  --text: #e6edf3;
  --text-muted: #8b949e;
  --green: #3fb950;
  --yellow: #d29922;
  --red: #f85149;
}

* { margin: 0; padding: 0; box-sizing: border-box; }

body {
  width: 340px;
  background: var(--bg);
  color: var(--text);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
  font-size: 13px;
}

.popup { padding: 16px; }

.popup-header h1 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 12px;
}

.state {
  text-align: center;
  padding: 24px 0;
  color: var(--text-muted);
}

.state.error { color: var(--red); }

.score-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 16px;
}

.score-main {
  text-align: center;
  padding: 12px 0;
  border-radius: 6px;
  margin-bottom: 12px;
}

.score-main.green { background: rgba(63, 185, 80, 0.15); color: var(--green); }
.score-main.yellow { background: rgba(210, 153, 34, 0.15); color: var(--yellow); }
.score-main.red { background: rgba(248, 81, 73, 0.15); color: var(--red); }

.pct { font-size: 32px; font-weight: 700; }
.label { font-size: 14px; margin-left: 4px; opacity: 0.8; }

.details { font-size: 12px; }
.repo-name { font-weight: 600; margin-bottom: 4px; }
.breakdown { color: var(--text-muted); margin-bottom: 4px; }
.sep { margin: 0 4px; }
.source { color: var(--text-muted); font-style: italic; }
</style>
