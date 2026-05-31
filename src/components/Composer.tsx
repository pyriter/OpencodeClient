import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { colors, font, radius, spacing } from '@/theme';
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
        <Text style={styles.modelLabel} numberOfLines={1}>
          {model ? `${model.providerID} · ${model.modelID}` : 'select model'}
        </Text>
      </Pressable>
      <View style={styles.row}>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder="Message…"
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
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.xs,
    paddingBottom: spacing.sm,
    gap: spacing.xs,
  },
  modelChip: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modelLabel: { color: colors.textMuted, fontFamily: font.mono, fontSize: 11 },
  row: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm },
  input: {
    flex: 1,
    color: colors.text,
    backgroundColor: colors.bgInput,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 15,
    maxHeight: 160,
  },
  btn: {
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minWidth: 64,
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
  },
  abortBtn: { backgroundColor: colors.error },
  btnDisabled: { backgroundColor: colors.accentMuted, opacity: 0.6 },
  btnText: { color: colors.text, fontWeight: '600' },
});
