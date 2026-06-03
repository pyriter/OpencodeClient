import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  SectionList,
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
import { confirm, notify, promptText } from '@/lib/dialogs';
import { colors, font, fontSize, radius, spacing } from '@/theme';

function timeOf(s: Session): number {
  return s.time?.updated ?? s.time?.created ?? 0;
}

// "2 min ago" / "3 hr ago" / "Mar 5" / "Mar 5, 2024"
function relativeTime(t: number): string {
  if (!t) return '';
  const now = Date.now();
  const diff = Math.max(0, now - t);
  const min = Math.floor(diff / 60_000);
  if (min < 1) return 'just now';
  if (min < 60) return `${min} min ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} hr ago`;
  const days = Math.floor(hr / 24);
  if (days < 7) return `${days} d ago`;
  const d = new Date(t);
  const sameYear = d.getFullYear() === new Date().getFullYear();
  return sameYear
    ? d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    : d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

// Returns a stable group label for a session, used as section headers.
function groupOf(t: number): string {
  if (!t) return 'Older';
  const now = new Date();
  const d = new Date(t);

  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfYesterday = startOfToday - 86_400_000;
  const sevenDaysAgo = startOfToday - 7 * 86_400_000;
  const thirtyDaysAgo = startOfToday - 30 * 86_400_000;

  if (t >= startOfToday) return 'Today';
  if (t >= startOfYesterday) return 'Yesterday';
  if (t >= sevenDaysAgo) return 'Previous 7 days';
  if (t >= thirtyDaysAgo) return 'Previous 30 days';
  return d.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
}

const GROUP_ORDER = [
  'Today',
  'Yesterday',
  'Previous 7 days',
  'Previous 30 days',
];

function groupSort(a: string, b: string): number {
  const ai = GROUP_ORDER.indexOf(a);
  const bi = GROUP_ORDER.indexOf(b);
  if (ai >= 0 && bi >= 0) return ai - bi;
  if (ai >= 0) return -1;
  if (bi >= 0) return 1;
  // Both are month/year labels — newer first by parsing the label as a date.
  const ad = Date.parse(`1 ${a}`);
  const bd = Date.parse(`1 ${b}`);
  return bd - ad;
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
    onError: (e) => notify('Failed to create session', (e as Error).message),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteSession(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sessions'] }),
    onError: (e) => notify('Failed to delete', (e as Error).message),
  });

  const confirmDelete = (s: Session) => {
    confirm(
      'Delete session?',
      s.title || s.id,
      () => deleteMut.mutate(s.id),
      { destructive: true, confirmLabel: 'Delete' },
    );
  };

  const onLongPress = (s: Session) => {
    promptText('Rename session', 'New title', s.title ?? '', async (title) => {
      try {
        await renameSession(s.id, title);
        qc.invalidateQueries({ queryKey: ['sessions'] });
      } catch (e) {
        notify('Rename failed', (e as Error).message);
      }
    });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const sections = useMemo(() => {
    const sorted = [...(data ?? [])].sort((a, b) => timeOf(b) - timeOf(a));
    const map = new Map<string, Session[]>();
    for (const s of sorted) {
      const g = groupOf(timeOf(s));
      const arr = map.get(g) ?? [];
      arr.push(s);
      map.set(g, arr);
    }
    return [...map.entries()]
      .sort(([a], [b]) => groupSort(a, b))
      .map(([title, data]) => ({ title, data }));
  }, [data]);

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
        <ScrollView
          contentContainerStyle={styles.errorWrap}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />
          }
        >
          <Text style={styles.errorTitle}>
            {error instanceof ApiError && error.status === 401
              ? 'Unauthorized'
              : 'Cannot reach opencode'}
          </Text>
          <Text style={styles.errorMsg}>{(error as Error).message}</Text>
          <View style={styles.errorActions}>
            <Pressable style={styles.primaryBtn} onPress={() => router.push('/settings')}>
              <Text style={styles.primaryBtnText}>Open settings</Text>
            </Pressable>
            <Pressable
              style={styles.secondaryBtn}
              onPress={() => router.push('/onboarding')}
            >
              <Text style={styles.secondaryBtnText}>Setup walkthrough</Text>
            </Pressable>
          </View>
        </ScrollView>
      ) : sections.length === 0 ? (
        <ScrollView
          contentContainerStyle={styles.emptyWrap}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />
          }
        >
          <Text style={styles.emptyTitle}>No sessions yet</Text>
          <Text style={styles.emptyHint}>
            Tap the <Text style={styles.emptyAccent}>+</Text> button to start your first session.
          </Text>
          <Pressable
            style={styles.secondaryBtn}
            onPress={() => router.push('/onboarding')}
          >
            <Text style={styles.secondaryBtnText}>Setup walkthrough</Text>
          </Pressable>
        </ScrollView>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(s) => s.id}
          contentContainerStyle={{ padding: spacing.lg, paddingBottom: 120 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />
          }
          stickySectionHeadersEnabled={false}
          ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
          SectionSeparatorComponent={() => <View style={{ height: spacing.xs }} />}
          renderSectionHeader={({ section }) => (
            <View style={styles.sectionHead}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
            </View>
          )}
          renderItem={({ item }) => (
            // Outer View only — RN Pressable inside Pressable both fire on
            // press, so the row's tap target is a single Pressable that does
            // NOT wrap the delete button. The delete button is its sibling.
            <View style={styles.rowWrap}>
              <Pressable
                style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
                onPress={() => router.push(`/sessions/${encodeURIComponent(item.id)}`)}
                onLongPress={() => onLongPress(item)}
              >
                <View style={styles.rowMain}>
                  <Text style={styles.title} numberOfLines={1}>
                    {item.title || '(untitled)'}
                  </Text>
                  <Text style={styles.time}>{relativeTime(timeOf(item))}</Text>
                </View>
              </Pressable>
              <Pressable
                onPress={() => confirmDelete(item)}
                hitSlop={10}
                style={({ pressed }) => [styles.delBtn, pressed && styles.delBtnPressed]}
                accessibilityLabel={`Delete ${item.title || item.id}`}
              >
                <Text style={styles.delText}>×</Text>
              </Pressable>
            </View>
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
  errorWrap: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  errorTitle: { color: colors.error, fontSize: fontSize.md, fontWeight: '600' },
  errorMsg: { color: colors.textMuted, fontSize: fontSize.base, lineHeight: fontSize.base * 1.5 },
  primaryBtn: {
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    paddingVertical: spacing.sm + 2,
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.lg,
  },
  primaryBtnText: { color: colors.bg, fontWeight: '600', fontSize: fontSize.base },
  secondaryBtn: {
    alignSelf: 'flex-start',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgElevated,
  },
  secondaryBtnText: { color: colors.accent, fontSize: fontSize.base },
  errorActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
    flexWrap: 'wrap',
  },

  emptyWrap: {
    padding: spacing.lg,
    gap: spacing.sm,
  },
  emptyTitle: { color: colors.text, fontSize: fontSize.lg, fontWeight: '600' },
  emptyHint: {
    color: colors.textMuted,
    fontSize: fontSize.base,
    lineHeight: fontSize.base * 1.5,
  },
  emptyAccent: { color: colors.accent, fontFamily: font.mono },

  sectionHead: {
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
  },
  sectionTitle: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    fontWeight: '600',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },

  rowWrap: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: spacing.sm,
  },
  row: {
    flex: 1,
    backgroundColor: colors.bgElevated,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
  },
  rowPressed: { backgroundColor: colors.bgRaised, borderColor: colors.borderAccent },
  rowMain: { gap: 2 },
  title: { color: colors.text, fontSize: fontSize.md, fontWeight: '500' },
  time: { color: colors.textMuted, fontSize: fontSize.xs },

  delBtn: {
    width: 40,
    borderRadius: radius.lg,
    backgroundColor: colors.bgElevated,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  delBtnPressed: { backgroundColor: colors.error, borderColor: colors.error },
  delText: {
    color: colors.textMuted,
    fontSize: 22,
    lineHeight: 22,
    marginTop: -2,
    fontWeight: '500',
  },

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
