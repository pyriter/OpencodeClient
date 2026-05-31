// Minimal fetch wrapper for the opencode HTTP API.
// Reads server URL + password from the settings store at call time, so
// changes in settings take effect immediately without re-creating clients.

import { useSettings } from '@/state/settings';

export class ApiError extends Error {
  status: number;
  body: string;
  constructor(status: number, message: string, body: string) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

function joinUrl(base: string, path: string): string {
  const b = base.replace(/\/+$/, '');
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${b}${p}`;
}

export function authHeader(password: string | null): Record<string, string> {
  if (!password) return {};
  // btoa is provided by Hermes and JSC at runtime.
  const token = btoa(`opencode:${password}`);
  return { Authorization: `Basic ${token}` };
}

function getConn() {
  const { serverUrl, password } = useSettings.getState();
  if (!serverUrl) throw new ApiError(0, 'No server configured', '');
  return { serverUrl, password };
}

export async function request<T = unknown>(
  path: string,
  init: RequestInit = {},
  opts: { rawText?: boolean; expectNoContent?: boolean } = {},
): Promise<T> {
  const { serverUrl, password } = getConn();
  const url = joinUrl(serverUrl, path);
  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...authHeader(password),
    ...(init.headers as Record<string, string> | undefined),
  };
  if (init.body && !headers['Content-Type']) headers['Content-Type'] = 'application/json';

  const res = await fetch(url, { ...init, headers });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new ApiError(res.status, `${res.status} ${res.statusText}`, body);
  }
  if (opts.expectNoContent || res.status === 204) return undefined as T;
  if (opts.rawText) return (await res.text()) as unknown as T;
  return (await res.json()) as T;
}

// Probe used by the settings screen to validate the URL+password pair.
export async function probeConnection(serverUrl: string, password: string | null): Promise<void> {
  const url = joinUrl(serverUrl, '/session');
  const res = await fetch(url, { headers: { Accept: 'application/json', ...authHeader(password) } });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new ApiError(res.status, `${res.status} ${res.statusText}`, body);
  }
}
