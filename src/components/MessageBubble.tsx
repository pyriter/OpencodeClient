import { StyleSheet, Text, View } from 'react-native';
import { colors, fontSize, radius, spacing } from '@/theme';
import { PartRenderer } from './PartRenderer';
import type { Message } from '@/api/types';

export function MessageBubble({ message }: { message: Message }) {
  const isUser = message.info.role === 'user';

  if (isUser) {
    // User: right-aligned bubble (Claude-style)
    const text = message.parts
      .map((p) => (p.type === 'text' ? (p as { text?: string }).text ?? '' : ''))
      .join('')
      .trim();
    return (
      <View style={styles.userRow}>
        <View style={styles.userBubble}>
          <Text style={styles.userText} selectable>
            {text}
          </Text>
        </View>
      </View>
    );
  }

  // Assistant: no bubble, plain text on the page with a subtle role accent.
  return (
    <View style={styles.assistantRow}>
      <View style={styles.assistantContent}>
        {message.parts.map((p, i) => (
          <PartRenderer
            key={(p as { id?: string }).id ?? `${message.info.id}-${i}`}
            part={p}
            messageInfo={message.info}
          />
        ))}
        {message.info.error?.message && (
          <Text style={styles.error}>{message.info.error.message}</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  userRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginVertical: spacing.sm,
  },
  userBubble: {
    maxWidth: '85%',
    backgroundColor: colors.bgUser,
    borderRadius: radius.lg,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
  },
  userText: {
    color: colors.text,
    fontSize: fontSize.md,
    lineHeight: fontSize.md * 1.5,
  },
  assistantRow: {
    marginVertical: spacing.sm,
  },
  assistantContent: {
    gap: spacing.xs,
  },
  error: {
    color: colors.error,
    fontSize: fontSize.base,
    marginTop: spacing.xs,
  },
});
