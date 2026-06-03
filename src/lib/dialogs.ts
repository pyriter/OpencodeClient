// Cross-platform dialog helpers.
//
// react-native-web's `Alert` is a no-op stub (it just does nothing), so on
// web the existing Alert.alert calls silently fail. These helpers route to
// the browser's native window.alert/confirm/prompt on web and use RN Alert
// on iOS/Android where it renders natively.

import { Alert, Platform } from 'react-native';

const isWeb = Platform.OS === 'web';

function joinTitleMessage(title: string, message?: string): string {
  return message ? `${title}\n\n${message}` : title;
}

export function notify(title: string, message?: string): void {
  if (isWeb) {
    if (typeof window !== 'undefined') window.alert(joinTitleMessage(title, message));
    return;
  }
  Alert.alert(title, message);
}

export type ConfirmOptions = {
  destructive?: boolean;
  confirmLabel?: string;
  cancelLabel?: string;
};

export function confirm(
  title: string,
  message: string | undefined,
  onConfirm: () => void,
  opts: ConfirmOptions = {},
): void {
  if (isWeb) {
    if (typeof window !== 'undefined' && window.confirm(joinTitleMessage(title, message))) {
      onConfirm();
    }
    return;
  }
  Alert.alert(title, message, [
    { text: opts.cancelLabel ?? 'Cancel', style: 'cancel' },
    {
      text: opts.confirmLabel ?? 'OK',
      style: opts.destructive ? 'destructive' : 'default',
      onPress: onConfirm,
    },
  ]);
}

// Single-field text prompt. iOS supports Alert.prompt natively; Android does
// not — there we fall back to window.prompt only on web. On Android we
// currently no-op (caller should provide an inline modal if needed).
export function promptText(
  title: string,
  message: string | undefined,
  defaultValue: string,
  onSubmit: (value: string) => void,
): void {
  if (isWeb) {
    if (typeof window === 'undefined') return;
    const v = window.prompt(joinTitleMessage(title, message), defaultValue);
    if (v != null && v.trim().length > 0) onSubmit(v);
    return;
  }
  if (Platform.OS === 'ios' && (Alert as unknown as { prompt?: unknown }).prompt) {
    (Alert as unknown as {
      prompt: (
        t: string,
        m: string | undefined,
        cb: (v: string) => void,
        type: 'plain-text',
        d: string,
      ) => void;
    }).prompt(title, message, (v) => v && onSubmit(v), 'plain-text', defaultValue);
    return;
  }
  // Android fallback: caller would need an inline modal; for now log.
  console.warn('promptText not implemented on Android');
}
