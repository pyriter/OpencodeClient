import { StyleSheet, Text, View } from 'react-native';
import { colors, fontSize, radius, spacing } from '@/theme';
import type { MessageInfo, Part, ReasoningPart } from '@/api/types';
import { MarkdownView } from './MarkdownView';
import { ReasoningBlock } from './ReasoningBlock';
import { ToolCallBlock } from './ToolCallBlock';

export function PartRenderer({
  part,
  messageInfo,
}: {
  part: Part;
  messageInfo?: MessageInfo;
}) {
  switch (part.type) {
    case 'text': {
      const text = (part as { text?: string }).text ?? '';
      if (!text.trim()) return null;
      return <MarkdownView text={text} />;
    }
    case 'reasoning':
      return <ReasoningBlock part={part as ReasoningPart} messageInfo={messageInfo} />;
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
