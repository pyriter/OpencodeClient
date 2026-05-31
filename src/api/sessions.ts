import { request } from './client';
import type { Message, ProvidersResponse, Session, PromptBody, ModelRef } from './types';

export const listSessions = () => request<Session[]>('/session');

export const createSession = (body: { title?: string; parentID?: string } = {}) =>
  request<Session>('/session', { method: 'POST', body: JSON.stringify(body) });

export const renameSession = (id: string, title: string) =>
  request<Session>(`/session/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify({ title }),
  });

export const deleteSession = (id: string) =>
  request<void>(`/session/${encodeURIComponent(id)}`, { method: 'DELETE' }, { expectNoContent: true });

export const abortSession = (id: string) =>
  request<void>(`/session/${encodeURIComponent(id)}/abort`, { method: 'POST' }, { expectNoContent: true });

export const listMessages = (id: string, limit?: number) => {
  const q = limit ? `?limit=${limit}` : '';
  return request<Message[]>(`/session/${encodeURIComponent(id)}/message${q}`);
};

export const promptAsync = (id: string, body: PromptBody) =>
  request<void>(
    `/session/${encodeURIComponent(id)}/prompt_async`,
    { method: 'POST', body: JSON.stringify(body) },
    { expectNoContent: true },
  );

export const sendPrompt = (id: string, body: PromptBody) =>
  request<{ info: unknown; parts: unknown }>(`/session/${encodeURIComponent(id)}/message`, {
    method: 'POST',
    body: JSON.stringify(body),
  });

export const listProviders = () => request<ProvidersResponse>('/config/providers');

export type { ModelRef };
