export interface ApiScore {
  owner: string;
  repo: string;
  total_stars: number;
  clean_stars: number;
  suspicious_stars: number;
  clean_pct: number;
  source: 'starscout' | 'realtime';
}

export interface ApiNoData {
  owner: string;
  repo: string;
  status: 'no_data';
  message: string;
}

export interface ApiRateLimited {
  status: 'rate_limited';
}

export type ApiResponse = ApiScore | ApiNoData | ApiRateLimited;

const API_BASE = import.meta.env.WXT_API_URL ?? 'http://localhost:8787';

export async function fetchScore(owner: string, repo: string): Promise<ApiResponse> {
  const url = `${API_BASE}/api/score/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`;

  const response = await fetch(url);

  if (response.status === 404) {
    return await response.json() as ApiNoData;
  }

  if (response.status === 429) {
    return { status: 'rate_limited' } as ApiRateLimited;
  }

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return await response.json() as ApiScore;
}

export function isScore(resp: ApiResponse): resp is ApiScore {
  return 'clean_pct' in resp;
}

export function isNoData(resp: ApiResponse): resp is ApiNoData {
  return 'status' in resp && resp.status === 'no_data';
}
