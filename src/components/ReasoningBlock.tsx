import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fontSize, radius, spacing } from '@/theme';
import type { MessageInfo, ReasoningPart } from '@/api/types';

// Distract-the-user phrases shown while reasoning is in flight.
// Rotated every ~2.5s — generic enough not to feel repetitive.
const THINKING_PHRASES = [
  'Thinking…',
  'Pondering…',
  'Reasoning…',
  'Untangling thoughts…',
  'Connecting dots…',
  'Mulling it over…',
  'Working through it…',
  'Cogitating…',
  'Compiling thoughts…',
  'Considering options…',
  'Stirring neurons…',
  'Reading between the lines…',
];

function formatElapsed(ms: number, streaming: boolean): string {
  if (ms < 1000) return streaming ? '0s' : '<1s';
  const s = Math.floor(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  return `${m}m ${s % 60}s`;
}

type Props = {
  part: ReasoningPart;
  messageInfo?: MessageInfo;
};

export function ReasoningBlock({ part, messageInfo }: Props) {
  const start = part.time?.start;
  const end = part.time?.end;
  // Heuristic for "in progress": reasoning started, no end yet, and the
  // owning message hasn't completed either.
  const messageDone = !!messageInfo?.time?.completed;
  const isStreaming = !!start && !end && !messageDone;

  const [open, setOpen] = useState(false);
  const [nowTick, setNowTick] = useState(0);
  const [phraseIdx, setPhraseIdx] = useState(0);

  // Tick once a second to drive the elapsed counter while streaming.
  useEffect(() => {
    if (!isStreaming) return;
    const id = setInterval(() => setNowTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [isStreaming]);

  // Rotate the thinking phrase every 2.5s.
  useEffect(() => {
    if (!isStreaming) return;
    const id = setInterval(
      () => setPhraseIdx((i) => (i + 1) % THINKING_PHRASES.length),
      2500,
    );
    return () => clearInterval(id);
  }, [isStreaming]);

  // useMemo with an explicit nowTick dep so the React Compiler can't hoist
  // the Date.now() call. nowTick is bumped every second by the interval below.
  const elapsedMs = useMemo(
    () => (start ? (end ?? Date.now()) - start : 0),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [nowTick, start, end],
  );
  const tokens = messageInfo?.tokens?.reasoning;

  const text = (part.text ?? '').trim();
  if (!text && !isStreaming) return null;

  return (
    <View style={styles.wrap}>
      <Pressable onPress={() => setOpen((v) => !v)} style={styles.header}>
        {isStreaming ? (
          <ActivityIndicator size="small" color={colors.accent} />
        ) : (
          <View style={styles.dot} />
        )}
        <Text style={styles.label}>
          {isStreaming ? THINKING_PHRASES[phraseIdx] : 'reasoning'}
        </Text>
        <View style={styles.meta}>
          {start && (
            <Text style={styles.metaText}>{formatElapsed(elapsedMs, isStreaming)}</Text>
          )}
          {typeof tokens === 'number' && tokens > 0 && (
            <Text style={styles.metaText}>{tokens.toLocaleString()} tok</Text>
          )}
          {!!text && (
            <Text style={styles.chev}>{open ? '▾' : '▸'}</Text>
          )}
        </View>
      </Pressable>
      {open && !!text && (
        <Text style={styles.body} selectable>
          {text}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.bgRaised,
    borderRadius: radius.md,
    marginVertical: spacing.xs,
    borderLeftWidth: 3,
    borderLeftColor: colors.borderAccent,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.borderAccent,
  },
  label: {
    color: colors.textSubtle,
    fontSize: fontSize.base,
    flex: 1,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  metaText: {
    color: colors.textFaint,
    fontSize: fontSize.xs,
    letterSpacing: 0.2,
  },
  chev: {
    color: colors.textFaint,
    fontSize: fontSize.md,
    marginLeft: 2,
  },
  body: {
    color: colors.textMuted,
    fontSize: fontSize.base,
    lineHeight: fontSize.base * 1.55,
    fontStyle: 'italic',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    paddingTop: 0,
  },
});
