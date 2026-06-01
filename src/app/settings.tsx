import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSettings } from '@/state/settings';
import { probeConnection, ApiError } from '@/api/client';
import { colors, font, fontSize, radius, spacing } from '@/theme';

export default function SettingsScreen() {
  const router = useRouter();
  const current = useSettings();
  const [url, setUrl] = useState(current.serverUrl ?? '');
  const [password, setPassword] = useState(current.password ?? '');
  const [busy, setBusy] = useState(false);

  const save = async () => {
    const cleaned = url.trim().replace(/\/+$/, '');
    if (!cleaned) {
      Alert.alert('Server URL required');
      return;
    }
    setBusy(true);
    try {
      await probeConnection(cleaned, password.trim() || null);
      await current.setConnection(cleaned, password.trim() || null);
      router.replace('/sessions');
    } catch (e) {
      const msg =
        e instanceof ApiError
          ? `${e.status === 401 ? 'Wrong password? ' : ''}${e.message}`
          : e instanceof Error
            ? e.message
            : 'Connection failed';
      Alert.alert('Connection failed', msg);
    } finally {
      setBusy(false);
    }
  };

  const clear = async () => {
    await current.clear();
    setUrl('');
    setPassword('');
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.wrap}>
        <View style={styles.intro}>
          <Text style={styles.title}>Connect to opencode</Text>
          <Text style={styles.subtitle}>
            Point the app at your opencode server and we'll save the credentials in the device keychain.
          </Text>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Server URL</Text>
          <TextInput
            value={url}
            onChangeText={setUrl}
            placeholder="http://host.tail-scale.ts.net:4096"
            placeholderTextColor={colors.textFaint}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            style={styles.input}
          />
          <Text style={styles.hint}>Default opencode port is 4096.</Text>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Server password</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="OPENCODE_SERVER_PASSWORD"
            placeholderTextColor={colors.textFaint}
            autoCapitalize="none"
            autoCorrect={false}
            secureTextEntry
            style={styles.input}
          />
          <Text style={styles.hint}>Leave blank if the server has no password.</Text>
        </View>

        <Pressable style={[styles.btn, busy && styles.btnDisabled]} onPress={save} disabled={busy}>
          {busy ? (
            <ActivityIndicator color={colors.bg} />
          ) : (
            <Text style={styles.btnText}>Test & save</Text>
          )}
        </Pressable>

        {!!current.serverUrl && (
          <Pressable style={styles.linkBtn} onPress={clear}>
            <Text style={styles.linkText}>Clear saved credentials</Text>
          </Pressable>
        )}

        <Text style={styles.footer}>
          Make sure your device is signed into the same Tailnet as the opencode server.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: spacing.lg, paddingTop: spacing.md, gap: spacing.lg },
  intro: { gap: spacing.xs, marginBottom: spacing.sm },
  title: { color: colors.text, fontSize: fontSize.xl, fontWeight: '600' },
  subtitle: { color: colors.textMuted, fontSize: fontSize.base, lineHeight: fontSize.base * 1.5 },
  field: { gap: spacing.xs },
  label: {
    color: colors.textSubtle,
    fontSize: fontSize.sm,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  input: {
    backgroundColor: colors.bgInput,
    color: colors.text,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    fontSize: fontSize.md,
    fontFamily: font.mono,
    borderWidth: 1,
    borderColor: colors.border,
  },
  hint: { color: colors.textFaint, fontSize: fontSize.sm, marginTop: 2 },
  btn: {
    marginTop: spacing.sm,
    backgroundColor: colors.accent,
    borderRadius: radius.lg,
    paddingVertical: spacing.md + 2,
    alignItems: 'center',
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: colors.bg, fontWeight: '600', fontSize: fontSize.md },
  linkBtn: { alignSelf: 'center', padding: spacing.sm },
  linkText: { color: colors.error, fontSize: fontSize.base },
  footer: {
    color: colors.textFaint,
    fontSize: fontSize.sm,
    textAlign: 'center',
    marginTop: spacing.lg,
    lineHeight: fontSize.sm * 1.55,
  },
});
