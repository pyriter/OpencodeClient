import { StyleSheet, Text, View } from 'react-native';
import { colors, fontSize, radius, spacing } from '@/theme';
import { PartRenderer } from './PartRenderer';
import type { Message } from '@/api/types';

export function MessageBubble({ message }: { message: Message }) {
  const isUser = message.info.role === 'user';
  return (
    <View style={styles.row}>
      <View style={styles.roleRow}>
        <View style={[styles.dot, { backgroundColor: isUser ? colors.user : colors.assistant }]} />
        <Text style={styles.role}>{isUser ? 'you' : 'opencode'}</Text>
      </View>
      <View style={[styles.bubble, isUser ? styles.userBubble : styles.assistantBubble]}>
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
  row: {
    marginVertical: spacing.sm,
    gap: spacing.xs,
  },
  roleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginLeft: spacing.xs,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  role: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    letterSpacing: 0.4,
    textTransform: 'lowercase',
    fontWeight: '500',
  },
  bubble: {
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    gap: spacing.xs,
  },
  userBubble: {
    backgroundColor: colors.bgUser,
    borderColor: colors.borderAccent,
  },
  assistantBubble: {
    backgroundColor: colors.bgAssistant,
    borderColor: colors.border,
  },
  error: {
    color: colors.error,
    fontSize: fontSize.base,
    marginTop: spacing.xs,
  },
});
