import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '@/theme';
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
      return <View style={styles.step} />;
    case 'step-finish':
      return null;
    default:
      return null;
  }
}

const styles = StyleSheet.create({
  reasoning: {
    backgroundColor: colors.bgInput,
    borderRadius: 8,
    padding: spacing.sm,
    marginVertical: spacing.xs,
    opacity: 0.85,
  },
  reasoningLabel: {
    color: colors.textFaint,
    fontSize: 11,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  reasoningText: { color: colors.textMuted, fontSize: 13, fontStyle: 'italic' },
  file: {
    backgroundColor: colors.bgInput,
    borderRadius: 6,
    padding: spacing.sm,
    marginVertical: spacing.xs,
    alignSelf: 'flex-start',
  },
  fileText: { color: colors.text, fontSize: 13 },
  step: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
    opacity: 0.5,
  },
});
