import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '@/theme';
import { PartRenderer } from './PartRenderer';
import type { Message } from '@/api/types';

export function MessageBubble({ message }: { message: Message }) {
  const isUser = message.info.role === 'user';
  return (
    <View style={[styles.wrap, isUser ? styles.user : styles.assistant]}>
      <Text style={styles.role}>{isUser ? 'you' : 'opencode'}</Text>
      {message.parts.map((p, i) => (
        <PartRenderer key={(p as { id?: string }).id ?? `${message.info.id}-${i}`} part={p} />
      ))}
      {message.info.error?.message && (
        <Text style={styles.error}>error: {message.info.error.message}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: radius.md,
    padding: spacing.md,
    marginVertical: spacing.xs,
    gap: spacing.xs,
  },
  user: { backgroundColor: colors.user, alignSelf: 'stretch' },
  assistant: { backgroundColor: colors.assistant, alignSelf: 'stretch' },
  role: { color: colors.textFaint, fontSize: 11, textTransform: 'uppercase' },
  error: { color: colors.error, fontSize: 13 },
});
