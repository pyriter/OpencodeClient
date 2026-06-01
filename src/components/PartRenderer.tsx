import { StyleSheet, Text, View } from 'react-native';
import { colors, fontSize, radius, spacing } from '@/theme';
import type { Part } from '@/api/types';
import { MarkdownView } from './MarkdownView';
import { ToolCallBlock } from './ToolCallBlock';

export function PartRenderer({ part }: { part: Part }) {
  switch (part.type) {
    case 'text': {
      const text = (part as { text?: string }).text ?? '';
      if (!text.trim()) return null;
      return <MarkdownView text={text} />;
    }
    case 'reasoning': {
      const text = (part as { text?: string }).text ?? '';
      if (!text.trim()) return null;
      return (
        <View style={styles.reasoning}>
          <Text style={styles.reasoningLabel}>reasoning</Text>
          <Text style={styles.reasoningText}>{text}</Text>
        </View>
      );
    }
    case 'tool':
      return <ToolCallBlock part={part as Parameters<typeof ToolCallBlock>[0]['part']} />;
    case 'file': {
      const filename = (part as { filename?: string }).filename ?? 'file';
      return (
        <View style={styles.file}>
          <Text style={styles.fileText}>📎 {filename}</Text>
        </View>
      );
    }
    case 'step-start':
    case 'step-finish':
      return null;
    default:
      return null;
  }
}

const styles = StyleSheet.create({
  reasoning: {
    backgroundColor: colors.bgRaised,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginVertical: spacing.xs,
    borderLeftWidth: 3,
    borderLeftColor: colors.borderAccent,
  },
  reasoningLabel: {
    color: colors.textFaint,
    fontSize: fontSize.xs,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    marginBottom: 4,
    fontWeight: '500',
  },
  reasoningText: {
    color: colors.textMuted,
    fontSize: fontSize.base,
    lineHeight: fontSize.base * 1.55,
    fontStyle: 'italic',
  },
  file: {
    backgroundColor: colors.bgRaised,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    marginVertical: spacing.xs,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: colors.border,
  },
  fileText: { color: colors.text, fontSize: fontSize.base },
});
