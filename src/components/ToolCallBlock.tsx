import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, font, radius, spacing } from '@/theme';
import type { ToolPart } from '@/api/types';

function previewInput(tool: string, input: unknown): string {
  if (input == null) return '';
  if (typeof input === 'string') return input;
  if (typeof input === 'object') {
    const i = input as Record<string, unknown>;
    // Common opencode tool input shapes
    if (typeof i.command === 'string') return i.command;
    if (typeof i.filePath === 'string') return i.filePath;
    if (typeof i.path === 'string') return i.path;
    if (typeof i.pattern === 'string') return i.pattern;
    try {
      return JSON.stringify(i);
    } catch {
      return String(input);
    }
  }
  return String(input);
}

export function ToolCallBlock({ part }: { part: ToolPart }) {
  const [open, setOpen] = useState(false);
  const status = part.state?.status ?? 'pending';
  const input = part.state?.input;
  const output = part.state?.output ?? '';
  const error = part.state?.error;
  const title = part.state?.title ?? part.tool;

  const statusColor =
    status === 'completed'
      ? colors.success
      : status === 'error'
        ? colors.error
        : status === 'running'
          ? colors.accent
          : colors.textMuted;

  return (
    <View style={styles.wrap}>
      <Pressable onPress={() => setOpen((v) => !v)} style={styles.header}>
        <View style={[styles.dot, { backgroundColor: statusColor }]} />
        <Text style={styles.tool}>{part.tool}</Text>
        <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
          {title}
        </Text>
        <Text style={styles.chev}>{open ? '▾' : '▸'}</Text>
      </Pressable>
      {open && (
        <View style={styles.body}>
          {input != null && (
            <>
              <Text style={styles.section}>input</Text>
              <Text style={styles.code} selectable>
                {previewInput(part.tool, input)}
              </Text>
            </>
          )}
          {!!output && (
            <>
              <Text style={styles.section}>output</Text>
              <Text style={styles.code} selectable>
                {output}
              </Text>
            </>
          )}
          {!!error && (
            <>
              <Text style={[styles.section, { color: colors.error }]}>error</Text>
              <Text style={[styles.code, { color: colors.error }]} selectable>
                {error}
              </Text>
            </>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.toolHeader,
    borderRadius: radius.md,
    marginVertical: spacing.xs,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  tool: { color: colors.text, fontFamily: font.mono, fontSize: 13 },
  title: { color: colors.textMuted, fontSize: 13, flex: 1 },
  chev: { color: colors.textMuted },
  body: {
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.sm,
    gap: spacing.xs,
  },
  section: { color: colors.textFaint, fontSize: 11, textTransform: 'uppercase', marginTop: spacing.xs },
  code: {
    color: colors.text,
    fontFamily: font.mono,
    fontSize: 12,
    backgroundColor: colors.bg,
    padding: spacing.sm,
    borderRadius: radius.sm,
  },
});
