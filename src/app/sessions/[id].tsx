import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  abortSession,
  listMessages,
  promptAsync,
} from '@/api/sessions';
import { subscribeEvents } from '@/api/events';
import type { BusEvent, Message, MessageInfo, ModelRef, Part } from '@/api/types';
import { useSettings } from '@/state/settings';
import { MessageBubble } from '@/components/MessageBubble';
import { Composer } from '@/components/Composer';
import { ModelPickerSheet } from '@/components/ModelPickerSheet';
import { colors, spacing } from '@/theme';

type MessagesKey = ['messages', string];

function upsertPart(msg: Message, part: Part): Message {
  const idx = msg.parts.findIndex(
    (p) => (p as { id?: string }).id && (p as { id?: string }).id === (part as { id?: string }).id,
  );
  if (idx >= 0) {
    const next = msg.parts.slice();
    next[idx] = { ...next[idx], ...part };
    return { ...msg, parts: next };
  }
  return { ...msg, parts: [...msg.parts, part] };
}

export default function SessionChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const sessionID = String(id);
  const qc = useQueryClient();
  const { lastModel, setLastModel } = useSettings();
  const [picking, setPicking] = useState(false);
  const [busy, setBusy] = useState(false);
  const listRef = useRef<FlatList<Message>>(null);

  const key: MessagesKey = useMemo(() => ['messages', sessionID], [sessionID]);

  const { data, isLoading, error } = useQuery({
    queryKey: key,
    queryFn: () => listMessages(sessionID),
  });

  const onEvent = useCallback(
    (ev: BusEvent) => {
      if (ev.type === 'message.updated') {
        const info = (ev as { properties: { info: MessageInfo } }).properties?.info;
        if (!info || info.sessionID !== sessionID) return;
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
        const p = (ev as {
          properties: { part: Part; sessionID: string; messageID: string };
        }).properties;
        if (!p || p.sessionID !== sessionID) return;
        qc.setQueryData<Message[]>(key, (prev) => {
          const list = prev ?? [];
          const idx = list.findIndex((m) => m.info.id === p.messageID);
          if (idx < 0) return list;
          const next = list.slice();
          next[idx] = upsertPart(next[idx], p.part);
          return next;
        });
        // Keep scrolled to bottom while streaming
        requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: false }));
      } else if (ev.type === 'session.idle') {
        const sid = (ev as { properties: { sessionID: string } }).properties?.sessionID;
        if (sid === sessionID) setBusy(false);
      }
    },
    [qc, key, sessionID],
  );

  useEffect(() => {
    const sub = subscribeEvents(onEvent, (e) => {
      console.warn('SSE error', e);
    });
    return () => sub.close();
  }, [onEvent]);

  const send = async (text: string) => {
    setBusy(true);
    try {
      await promptAsync(sessionID, {
        model: lastModel ?? undefined,
        parts: [{ type: 'text', text }],
      });
    } catch (e) {
      setBusy(false);
      Alert.alert('Send failed', (e as Error).message);
    }
  };

  const abort = async () => {
    try {
      await abortSession(sessionID);
    } catch (e) {
      Alert.alert('Abort failed', (e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <Stack.Screen options={{ title: data?.[0]?.info?.sessionID ? sessionID.slice(0, 8) : 'Session' }} />
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
          data={data ?? []}
          keyExtractor={(m) => m.info.id}
          contentContainerStyle={{ padding: spacing.md, gap: spacing.xs }}
          renderItem={({ item }) => <MessageBubble message={item} />}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
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
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
});
