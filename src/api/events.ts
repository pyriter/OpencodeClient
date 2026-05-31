// SSE client for opencode's /event endpoint.
//
// React Native (iOS/Android): Hermes/JSC fetch doesn't expose a streaming
// body, so we use react-native-sse, which polls XHR readyState.
//
// Web (react-native-web): react-native-sse's XHR-polling approach doesn't
// stream incrementally in browsers, so we use fetch + ReadableStream, which
// browsers stream natively.
//
// Both branches send `Authorization: Basic …` (the native EventSource API
// can't carry custom headers, which is why we use fetch on web).

import { Platform } from 'react-native';
import EventSource from 'react-native-sse';
import { authHeader } from './client';
import { useSettings } from '@/state/settings';
import type { BusEvent } from './types';

export type EventListener = (ev: BusEvent) => void;
export type EventErrorListener = (err: unknown) => void;

export type EventSubscription = {
  close: () => void;
};

export function subscribeEvents(
  onEvent: EventListener,
  onError?: EventErrorListener,
): EventSubscription {
  const { serverUrl, password } = useSettings.getState();
  if (!serverUrl) return { close: () => {} };
  const url = `${serverUrl.replace(/\/+$/, '')}/event`;
  const headers = { Accept: 'text/event-stream', ...authHeader(password) };

  if (Platform.OS === 'web') return subscribeViaFetch(url, headers, onEvent, onError);
  return subscribeViaXhr(url, headers, onEvent, onError);
}

function subscribeViaXhr(
  url: string,
  headers: Record<string, string>,
  onEvent: EventListener,
  onError?: EventErrorListener,
): EventSubscription {
  const es = new EventSource(url, { headers, pollingInterval: 0 });
  es.addEventListener('message', (e) => {
    const data = (e as { data?: string }).data;
    if (!data) return;
    try {
      onEvent(JSON.parse(data) as BusEvent);
    } catch (err) {
      onError?.(err);
    }
  });
  es.addEventListener('error', (e) => onError?.(e));
  return {
    close: () => {
      try {
        es.removeAllEventListeners();
        es.close();
      } catch {
        /* noop */
      }
    },
  };
}

function subscribeViaFetch(
  url: string,
  headers: Record<string, string>,
  onEvent: EventListener,
  onError?: EventErrorListener,
): EventSubscription {
  const ac = new AbortController();
  let closed = false;

  (async () => {
    try {
      const res = await fetch(url, { method: 'GET', headers, signal: ac.signal, cache: 'no-store' });
      if (!res.ok || !res.body) {
        onError?.(new Error(`SSE ${res.status} ${res.statusText}`));
        return;
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buf = '';

      while (!closed) {
        const { value, done } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });

        // SSE frames are separated by a blank line.
        let idx: number;
        while ((idx = buf.indexOf('\n\n')) >= 0) {
          const frame = buf.slice(0, idx);
          buf = buf.slice(idx + 2);
          const dataLines = frame
            .split('\n')
            .filter((l) => l.startsWith('data:'))
            .map((l) => l.slice(5).trimStart());
          if (dataLines.length === 0) continue;
          try {
            onEvent(JSON.parse(dataLines.join('\n')) as BusEvent);
          } catch (err) {
            onError?.(err);
          }
        }
      }
    } catch (err) {
      if (!closed) onError?.(err);
    }
  })();

  return {
    close: () => {
      closed = true;
      try {
        ac.abort();
      } catch {
        /* noop */
      }
    },
  };
}
