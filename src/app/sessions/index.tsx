import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createSession,
  deleteSession,
  listSessions,
  renameSession,
} from '@/api/sessions';
import type { Session } from '@/api/types';
import { ApiError } from '@/api/client';
import { useSettings } from '@/state/settings';
import { colors, font, fontSize, radius, spacing } from '@/theme';

function formatTime(time?: { updated?: number; created?: number }): string {
  const t = time?.updated ?? time?.created;
  if (!t) return '';
  const d = new Date(t);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  if (sameDay) {
    return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  }
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export default function SessionListScreen() {
  const router = useRouter();
  const qc = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);

  const { hydrated, serverUrl } = useSettings();
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['sessions'],
    queryFn: listSessions,
    enabled: hydrated && !!serverUrl,
  });

  const createMut = useMutation({
    mutationFn: () => createSession({}),
    onSuccess: (s) => {
      qc.invalidateQueries({ queryKey: ['sessions'] });
      router.push(`/sessions/${encodeURIComponent(s.id)}`);
    },
    onError: (e) => Alert.alert('Failed to create session', (e as Error).message),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteSession(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sessions'] }),
    onError: (e) => Alert.alert('Failed to delete', (e as Error).message),
  });

  const onLongPress = (s: Session) => {
    Alert.alert(s.title ?? s.id, undefined, [
      {
        text: 'Rename',
        onPress: () => {
          Alert.prompt?.(
            'Rename session',
            'New title',
            async (title) => {
              if (!title) return;
              try {
                await renameSession(s.id, title);
                qc.invalidateQueries({ queryKey: ['sessions'] });
              } catch (e) {
                Alert.alert('Rename failed', (e as Error).message);
              }
            },
            'plain-text',
            s.title ?? '',
          );
        },
      },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deleteMut.mutate(s.id),
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  // Newest first
  const sorted = [...(data ?? [])].sort((a, b) => {
    const at = a.time?.updated ?? a.time?.created ?? 0;
    const bt = b.time?.updated ?? b.time?.created ?? 0;
    return bt - at;
  });

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Stack.Screen
        options={{
          headerRight: () => (
            <Pressable onPress={() => router.push('/settings')} hitSlop={8} style={styles.headerBtnWrap}>
              <Text style={styles.headerBtn}>settings</Text>
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
          <Text style={styles.errorTitle}>
            {error instanceof ApiError && error.status === 401
              ? 'Unauthorized'
              : 'Connection failed'}
          </Text>
          <Text style={styles.errorMsg}>{(error as Error).message}</Text>
          <Pressable style={styles.linkBtn} onPress={() => router.push('/settings')}>
            <Text style={styles.linkText}>Go to settings</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={sorted}
          keyExtractor={(s) => s.id}
          contentContainerStyle={{ padding: spacing.lg, paddingBottom: 120 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />
          }
          ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
          ListEmptyComponent={() => (
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>No sessions yet</Text>
              <Text style={styles.emptyHint}>Tap the + button to start one.</Text>
            </View>
          )}
          renderItem={({ item }) => (
            <Pressable
              style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
              onPress={() => router.push(`/sessions/${encodeURIComponent(item.id)}`)}
              onLongPress={() => onLongPress(item)}
            >
              <View style={styles.rowHead}>
                <Text style={styles.title} numberOfLines={1}>
                  {item.title || '(untitled)'}
                </Text>
                <Text style={styles.time}>{formatTime(item.time)}</Text>
              </View>
              <Text style={styles.id} numberOfLines={1}>
                {item.id}
              </Text>
            </Pressable>
          )}
        />
      )}
      <Pressable
        style={[styles.fab, createMut.isPending && { opacity: 0.6 }]}
        onPress={() => createMut.mutate()}
        disabled={createMut.isPending}
      >
        <Text style={styles.fabText}>＋</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    gap: spacing.sm,
  },
  errorTitle: { color: colors.error, fontSize: fontSize.md, fontWeight: '600' },
  errorMsg: { color: colors.textMuted, textAlign: 'center', fontSize: fontSize.base },
  linkBtn: { padding: spacing.sm },
  linkText: { color: colors.accent, fontSize: fontSize.base },
  row: {
    backgroundColor: colors.bgElevated,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 4,
  },
  rowPressed: { backgroundColor: colors.bgRaised, borderColor: colors.borderAccent },
  rowHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  title: { color: colors.text, fontSize: fontSize.md, fontWeight: '500', flex: 1 },
  time: { color: colors.textMuted, fontSize: fontSize.xs },
  id: { color: colors.textFaint, fontSize: fontSize.xs, fontFamily: font.mono },
  empty: { padding: spacing.xxl, alignItems: 'center', gap: spacing.xs },
  emptyTitle: { color: colors.text, fontSize: fontSize.md, fontWeight: '500' },
  emptyHint: { color: colors.textMuted, fontSize: fontSize.base },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 6,
  },
  fabText: { color: colors.bg, fontSize: 30, marginTop: -3, fontWeight: '500' },
  headerBtnWrap: { paddingHorizontal: spacing.sm },
  headerBtn: { color: colors.accent, fontSize: fontSize.base },
});
