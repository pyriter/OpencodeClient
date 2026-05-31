// SSE client for opencode's /event endpoint.
// React Native's fetch doesn't stream, so we use react-native-sse which
// supports custom headers (necessary for HTTP Basic auth).

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
  if (!serverUrl) {
    onError?.(new Error('No server configured'));
    return { close: () => {} };
  }
  const url = `${serverUrl.replace(/\/+$/, '')}/event`;
  const es = new EventSource(url, {
    headers: { Accept: 'text/event-stream', ...authHeader(password) },
    // Stream forever; react-native-sse will reconnect on transport errors.
    pollingInterval: 0,
  });

  es.addEventListener('message', (e) => {
    const data = (e as { data?: string }).data;
    if (!data) return;
    try {
      const parsed = JSON.parse(data) as BusEvent;
      onEvent(parsed);
    } catch (err) {
      onError?.(err);
    }
  });

  es.addEventListener('error', (e) => {
    onError?.(e);
  });

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
