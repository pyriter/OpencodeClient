import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
  const [focused, setFocused] = useState(false);
  const [keyboardUp, setKeyboardUp] = useState(false);
  const insets = useSafeAreaInsets();

  // Track keyboard so we can collapse the safe-area bottom inset and pin the
  // composer flush with the keyboard top. Without this, the composer floats
  // `insets.bottom` above the keyboard, which looks unbalanced.
  useEffect(() => {
    const showEvt = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvt = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const show = Keyboard.addListener(showEvt, () => setKeyboardUp(true));
    const hide = Keyboard.addListener(hideEvt, () => setKeyboardUp(false));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  const submit = async () => {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    setText('');
    await onSend(trimmed);
  };

  const canSend = text.trim().length > 0 && !busy;
  // When keyboard is up, the inset is covered by the keyboard — give the bar
  // just enough breathing room above it (sm). When the keyboard is down, honor
  // the home indicator inset.
  const bottomPad = keyboardUp ? spacing.sm : Math.max(insets.bottom, spacing.sm);

  return (
    <View style={[styles.wrap, { paddingBottom: bottomPad }]}>
      <View style={[styles.card, focused && styles.cardFocused]}>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Message opencode…"
          placeholderTextColor={colors.textFaint}
          multiline
          editable={!busy}
          // Catch Enter-without-shift on web — multiline ignores submitEditing.
          onKeyPress={(e) => {
            const ne = e.nativeEvent as { key?: string; shiftKey?: boolean };
            if (Platform.OS === 'web' && ne.key === 'Enter' && !ne.shiftKey) {
              e.preventDefault?.();
              submit();
            }
          }}
        />
        <View style={styles.bottomRow}>
          <Pressable onPress={onOpenModelPicker} hitSlop={8} style={styles.modelChip}>
            <View
              style={[styles.modelDot, { backgroundColor: model ? colors.accent : colors.textFaint }]}
            />
            <Text style={styles.modelLabel} numberOfLines={1}>
              {model ? `${model.providerID} · ${model.modelID}` : 'select model'}
            </Text>
          </Pressable>

          {busy ? (
            <Pressable
              onPress={onAbort}
              style={[styles.fab, styles.fabAbort]}
              accessibilityLabel="Abort"
            >
              <ActivityIndicator size="small" color={colors.text} />
            </Pressable>
          ) : (
            <Pressable
              onPress={submit}
              disabled={!canSend}
              style={[styles.fab, !canSend && styles.fabDisabled]}
              accessibilityLabel="Send"
            >
              <Text style={styles.fabIcon}>↑</Text>
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: spacing.sm + 2,
    paddingTop: spacing.xs,
    backgroundColor: colors.bg,
  },
  card: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.xl + 4,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm + 2,
    paddingBottom: spacing.xs + 2,
    gap: spacing.xs,
    // Subtle shadow for separation from the chat above.
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 3,
  },
  cardFocused: {
    borderColor: colors.borderAccent,
  },
  input: {
    color: colors.text,
    fontSize: fontSize.md,
    lineHeight: fontSize.md * 1.45,
    minHeight: 24,
    maxHeight: 160,
    paddingTop: 2,
    paddingBottom: 2,
    // Strip the default outline/border on web — the card around it shows focus.
    ...(Platform.OS === 'web' ? ({ outlineStyle: 'none' } as object) : null),
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  modelChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  modelDot: { width: 6, height: 6, borderRadius: 3 },
  modelLabel: {
    color: colors.textMuted,
    fontFamily: font.mono,
    fontSize: fontSize.xs,
    letterSpacing: 0.2,
    flex: 1,
  },
  fab: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabDisabled: {
    backgroundColor: colors.bgRaised,
  },
  fabAbort: {
    backgroundColor: colors.error,
  },
  fabIcon: {
    color: colors.bg,
    fontSize: 20,
    lineHeight: 20,
    fontWeight: '700',
    marginTop: -2,
  },
});
