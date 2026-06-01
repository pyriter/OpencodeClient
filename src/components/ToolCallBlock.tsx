import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, font, fontSize, radius, spacing } from '@/theme';
import type { ToolPart } from '@/api/types';

function previewInput(input: unknown): string {
  if (input == null) return '';
  if (typeof input === 'string') return input;
  if (typeof input === 'object') {
    const i = input as Record<string, unknown>;
    if (typeof i.command === 'string') return i.command;
    if (typeof i.filePath === 'string') return i.filePath;
    if (typeof i.path === 'string') return i.path;
    if (typeof i.pattern === 'string') return i.pattern;
    try {
      return JSON.stringify(i, null, 2);
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
  const title = part.state?.title ?? '';

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
        {!!title && (
          <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
            {title}
          </Text>
        )}
        <Text style={styles.chev}>{open ? '▾' : '▸'}</Text>
      </Pressable>
      {open && (
        <View style={styles.body}>
          {input != null && (
            <>
              <Text style={styles.section}>input</Text>
              <Text style={styles.code} selectable>
                {previewInput(input)}
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
    backgroundColor: colors.bgTool,
    borderRadius: radius.md,
    marginVertical: spacing.xs,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    gap: spacing.sm,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  tool: {
    color: colors.user,
    fontFamily: font.mono,
    fontSize: fontSize.base,
    fontWeight: '500',
  },
  title: {
    color: colors.textMuted,
    fontSize: fontSize.base,
    flex: 1,
  },
  chev: {
    color: colors.textFaint,
    fontSize: fontSize.md,
    marginLeft: 'auto',
  },
  body: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    paddingTop: 0,
    gap: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: 2,
  },
  section: {
    color: colors.textFaint,
    fontSize: fontSize.xs,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    marginTop: spacing.sm,
    fontWeight: '500',
  },
  code: {
    color: colors.text,
    fontFamily: font.mono,
    fontSize: fontSize.sm,
    lineHeight: fontSize.sm * 1.55,
    backgroundColor: colors.bgCode,
    padding: spacing.md,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
