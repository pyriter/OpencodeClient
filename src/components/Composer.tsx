import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { colors, font, fontSize, radius, spacing } from '@/theme';
import type { ModelRef } from '@/api/types';

type Props = {
  onSend: (text: string) => Promise<void> | void;
  onAbort?: () => void;
  busy: boolean;
  model: ModelRef | null;
  onOpenModelPicker: () => void;
};

export function Composer({ onSend, onAbort, busy, model, onOpenModelPicker }: Props) {
  const [text, setText] = useState('');

  const submit = async () => {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    setText('');
    await onSend(trimmed);
  };

  return (
    <View style={styles.wrap}>
      <Pressable style={styles.modelChip} onPress={onOpenModelPicker} hitSlop={8}>
        <View style={[styles.modelDot, { backgroundColor: model ? colors.accent : colors.textFaint }]} />
        <Text style={styles.modelLabel} numberOfLines={1}>
          {model ? `${model.providerID} · ${model.modelID}` : 'select model'}
        </Text>
      </Pressable>
      <View style={styles.row}>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder="Message opencode…"
          placeholderTextColor={colors.textFaint}
          multiline
          editable={!busy}
        />
        {busy ? (
          <Pressable style={[styles.btn, styles.abortBtn]} onPress={onAbort}>
            <ActivityIndicator size="small" color={colors.text} />
            <Text style={styles.btnText}>abort</Text>
          </Pressable>
        ) : (
          <Pressable
            style={[styles.btn, !text.trim() && styles.btnDisabled]}
            onPress={submit}
            disabled={!text.trim()}
          >
            <Text style={styles.btnText}>send</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.bgElevated,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  modelChip: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 4,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgRaised,
  },
  modelDot: { width: 6, height: 6, borderRadius: 3 },
  modelLabel: {
    color: colors.textSubtle,
    fontFamily: font.mono,
    fontSize: fontSize.xs,
    letterSpacing: 0.2,
  },
  row: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm },
  input: {
    flex: 1,
    color: colors.text,
    backgroundColor: colors.bgInput,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    fontSize: fontSize.md,
    lineHeight: fontSize.md * 1.45,
    maxHeight: 160,
    borderWidth: 1,
    borderColor: colors.border,
  },
  btn: {
    backgroundColor: colors.accent,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
    minWidth: 72,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
  },
  abortBtn: { backgroundColor: colors.error },
  btnDisabled: { backgroundColor: colors.accentSoft, opacity: 0.6 },
  btnText: { color: colors.bg, fontSize: fontSize.base, fontWeight: '600' },
});
