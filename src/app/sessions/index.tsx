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
import { colors, font, radius, spacing } from '@/theme';

export default function SessionListScreen() {
  const router = useRouter();
  const qc = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['sessions'],
    queryFn: listSessions,
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

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Stack.Screen
        options={{
          headerRight: () => (
            <Pressable onPress={() => router.push('/settings')} hitSlop={8}>
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
          data={data ?? []}
          keyExtractor={(s) => s.id}
          contentContainerStyle={{ padding: spacing.md, paddingBottom: 96 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />
          }
          ItemSeparatorComponent={() => <View style={{ height: spacing.xs }} />}
          ListEmptyComponent={() => (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No sessions yet.</Text>
              <Text style={styles.emptyHint}>Tap + to start one.</Text>
            </View>
          )}
          renderItem={({ item }) => (
            <Pressable
              style={styles.row}
              onPress={() => router.push(`/sessions/${encodeURIComponent(item.id)}`)}
              onLongPress={() => onLongPress(item)}
            >
              <Text style={styles.title} numberOfLines={1}>
                {item.title || '(untitled)'}
              </Text>
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
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg, gap: spacing.sm },
  errorTitle: { color: colors.error, fontSize: 16, fontWeight: '600' },
  errorMsg: { color: colors.textMuted, textAlign: 'center' },
  linkBtn: { padding: spacing.sm },
  linkText: { color: colors.accent },
  row: {
    backgroundColor: colors.bgElevated,
    padding: spacing.md,
    borderRadius: radius.md,
  },
  title: { color: colors.text, fontSize: 15, fontWeight: '500' },
  id: { color: colors.textFaint, fontSize: 11, fontFamily: font.mono, marginTop: 4 },
  empty: { padding: spacing.xl, alignItems: 'center', gap: spacing.xs },
  emptyText: { color: colors.text, fontSize: 16 },
  emptyHint: { color: colors.textMuted },
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
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 4,
  },
  fabText: { color: colors.text, fontSize: 28, marginTop: -2 },
  headerBtn: { color: colors.accent, marginRight: spacing.sm },
});
