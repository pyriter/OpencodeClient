import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { confirm, notify } from '@/lib/dialogs';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  abortSession,
  createSession,
  deleteSession,
  listMessages,
  promptAsync,
} from '@/api/sessions';
import { subscribeEvents } from '@/api/events';
import type { BusEvent, Message, MessageInfo, ModelRef, Part, SessionStatus } from '@/api/types';
import { useSettings } from '@/state/settings';
import { MessageBubble } from '@/components/MessageBubble';
import { Composer } from '@/components/Composer';
import { ModelPickerSheet } from '@/components/ModelPickerSheet';
import { ThinkingIndicator } from '@/components/ThinkingIndicator';
import { colors, fontSize, spacing } from '@/theme';

type MessagesKey = ['messages', string];

function upsertPart(msg: Message, part: Part): Message {
  const pid = (part as { id?: string }).id;
  const idx = pid ? msg.parts.findIndex((p) => (p as { id?: string }).id === pid) : -1;
  if (idx >= 0) {
    const next = msg.parts.slice();
    next[idx] = { ...next[idx], ...part } as Part;
    return { ...msg, parts: next };
  }
  return { ...msg, parts: [...msg.parts, part] };
}

function applyDelta(
  msg: Message,
  partID: string,
  field: string,
  delta: string,
): Message {
  const idx = msg.parts.findIndex((p) => (p as { id?: string }).id === partID);
  if (idx < 0) return msg;
  const next = msg.parts.slice();
  const cur = next[idx] as Record<string, unknown>;
  const prev = typeof cur[field] === 'string' ? (cur[field] as string) : '';
  next[idx] = { ...cur, [field]: prev + delta } as Part;
  return { ...msg, parts: next };
}

// True when the assistant is still working and hasn't produced any visible
// output yet (no text, no reasoning, no tool calls). That's the moment to
// show the "Thinking…" indicator.
function shouldShowThinking(busy: boolean, messages: Message[]): boolean {
  if (!busy) return false;
  if (messages.length === 0) return true;
  const last = messages[messages.length - 1];
  if (last.info.role === 'user') return true;
  const visible = last.parts.some(
    (p) =>
      (p.type === 'text' && ((p as { text?: string }).text ?? '').trim().length > 0) ||
      p.type === 'reasoning' ||
      p.type === 'tool',
  );
  return !visible;
}

export default function SessionChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const sessionID = String(id);
  const qc = useQueryClient();
  const { lastModel, setLastModel, hydrated, serverUrl } = useSettings();
  const [picking, setPicking] = useState(false);
  const [busy, setBusy] = useState(false);
  const listRef = useRef<FlatList<Message>>(null);

  const key: MessagesKey = useMemo(() => ['messages', sessionID], [sessionID]);

  const { data, isLoading, error } = useQuery({
    queryKey: key,
    queryFn: () => listMessages(sessionID),
    enabled: hydrated && !!serverUrl,
  });

  const onEvent = useCallback(
    (ev: BusEvent) => {
      const props = (ev as { properties?: { sessionID?: string } }).properties;
      if (props?.sessionID && props.sessionID !== sessionID) return;

      if (ev.type === 'message.updated') {
        const info = (ev as { properties: { info: MessageInfo } }).properties?.info;
        if (!info) return;
        qc.setQueryData<Message[]>(key, (prev) => {
          const list = prev ?? [];
          const idx = list.findIndex((m) => m.info.id === info.id);
          if (idx >= 0) {
            const next = list.slice();
            next[idx] = { ...next[idx], info };
            return next;
          }
          return [...list, { info, parts: [] }];
        });
        if (info.role === 'assistant' && info.time?.completed) setBusy(false);
      } else if (ev.type === 'message.part.updated') {
        const part = (ev as { properties: { part: Part & { messageID?: string } } })
          .properties.part;
        const messageID = part.messageID;
        if (!messageID) return;
        qc.setQueryData<Message[]>(key, (prev) => {
          const list = prev ?? [];
          const idx = list.findIndex((m) => m.info.id === messageID);
          if (idx < 0) return list;
          const next = list.slice();
          next[idx] = upsertPart(next[idx], part);
          return next;
        });
        requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: false }));
      } else if (ev.type === 'message.part.delta') {
        const p = (ev as {
          properties: {
            messageID: string;
            partID: string;
            field: string;
            delta: string;
          };
        }).properties;
        qc.setQueryData<Message[]>(key, (prev) => {
          const list = prev ?? [];
          const idx = list.findIndex((m) => m.info.id === p.messageID);
          if (idx < 0) return list;
          const next = list.slice();
          next[idx] = applyDelta(next[idx], p.partID, p.field, p.delta);
          return next;
        });
        requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: false }));
      } else if (ev.type === 'session.status') {
        const status = (ev as { properties: { status: SessionStatus } }).properties?.status;
        if (status?.type === 'idle') setBusy(false);
        else if (status?.type === 'busy') setBusy(true);
      } else if (ev.type === 'message.removed') {
        const { messageID } = (ev as { properties: { messageID: string } }).properties;
        qc.setQueryData<Message[]>(key, (prev) =>
          (prev ?? []).filter((m) => m.info.id !== messageID),
        );
      }
    },
    [qc, key, sessionID],
  );

  useEffect(() => {
    if (!hydrated || !serverUrl) return;
    const sub = subscribeEvents(onEvent, (e) => console.warn('SSE error', e));
    return () => sub.close();
  }, [onEvent, hydrated, serverUrl]);

  const send = async (text: string) => {
    setBusy(true);
    try {
      await promptAsync(sessionID, {
        model: lastModel ?? undefined,
        parts: [{ type: 'text', text }],
      });
    } catch (e) {
      setBusy(false);
      notify('Send failed', (e as Error).message);
    }
  };

  const abort = async () => {
    try {
      await abortSession(sessionID);
    } catch (e) {
      notify('Abort failed', (e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  // "Clear conversation": opencode has no bulk-clear endpoint, so we delete
  // the current session and drop the user into a fresh one in its place.
  const clearConversation = () => {
    confirm(
      'Clear conversation?',
      'This deletes the current session and starts a fresh one.',
      async () => {
        try {
          if (busy) await abortSession(sessionID).catch(() => undefined);
          await deleteSession(sessionID);
          const fresh = await createSession({});
          qc.invalidateQueries({ queryKey: ['sessions'] });
          router.replace(`/sessions/${encodeURIComponent(fresh.id)}`);
        } catch (e) {
          notify('Clear failed', (e as Error).message);
        }
      },
      { destructive: true, confirmLabel: 'Clear' },
    );
  };

  const messages = data ?? [];
  const showThinking = shouldShowThinking(busy, messages);
  const insets = useSafeAreaInsets();
  // Default expo-router stack header is ~44pt; add the top safe-area inset
  // so KeyboardAvoidingView pushes the composer to the exact keyboard top.
  const kavOffset = Platform.OS === 'ios' ? insets.top + 44 : 0;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={kavOffset}
    >
      <Stack.Screen
        options={{
          title: sessionID.slice(0, 8),
          headerRight: () => (
            <Pressable onPress={clearConversation} hitSlop={8} style={styles.headerBtnWrap}>
              <Text style={styles.headerBtn}>clear</Text>
            </Pressable>
          ),
        }}
      />
      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.accent} />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={{ color: colors.error }}>{(error as Error).message}</Text>
        </View>
      ) : (
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(m) => m.info.id}
          contentContainerStyle={{
            paddingHorizontal: spacing.lg,
            paddingTop: spacing.sm,
            paddingBottom: spacing.md,
          }}
          renderItem={({ item }) => <MessageBubble message={item} />}
          ListFooterComponent={showThinking ? <ThinkingIndicator /> : null}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
        />
      )}
      <Composer
        onSend={send}
        onAbort={abort}
        busy={busy}
        model={lastModel}
        onOpenModelPicker={() => setPicking(true)}
      />
      <ModelPickerSheet
        visible={picking}
        current={lastModel}
        onClose={() => setPicking(false)}
        onPick={(m: ModelRef) => setLastModel(m)}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  headerBtnWrap: { paddingHorizontal: spacing.sm },
  headerBtn: { color: colors.accent, fontSize: fontSize.base },
});
