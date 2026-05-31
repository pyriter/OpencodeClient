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
import { colors, font, radius, spacing } from '@/theme';

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
        <Text style={styles.hint}>
          The opencode server's Tailscale URL. Default port is 4096.
        </Text>

        <Text style={[styles.label, { marginTop: spacing.lg }]}>
          Server password (OPENCODE_SERVER_PASSWORD)
        </Text>
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="optional"
          placeholderTextColor={colors.textFaint}
          autoCapitalize="none"
          autoCorrect={false}
          secureTextEntry
          style={styles.input}
        />
        <Text style={styles.hint}>Leave blank if the server has no password.</Text>

        <Pressable style={[styles.btn, busy && styles.btnDisabled]} onPress={save} disabled={busy}>
          {busy ? <ActivityIndicator color={colors.text} /> : <Text style={styles.btnText}>Test & save</Text>}
        </Pressable>

        {!!current.serverUrl && (
          <Pressable style={styles.linkBtn} onPress={clear}>
            <Text style={styles.linkText}>Clear saved credentials</Text>
          </Pressable>
        )}

        <View style={{ height: spacing.xxl }} />
        <Text style={styles.footer}>
          Make sure your device is signed into the same Tailnet as the opencode server.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: spacing.md, gap: spacing.xs },
  label: { color: colors.textMuted, fontSize: 12, textTransform: 'uppercase' },
  input: {
    backgroundColor: colors.bgInput,
    color: colors.text,
    borderRadius: radius.md,
    padding: spacing.sm,
    fontSize: 15,
    fontFamily: font.mono,
  },
  hint: { color: colors.textFaint, fontSize: 12, marginTop: 4 },
  btn: {
    marginTop: spacing.xl,
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: colors.text, fontWeight: '600', fontSize: 15 },
  linkBtn: { marginTop: spacing.md, alignItems: 'center', padding: spacing.sm },
  linkText: { color: colors.error },
  footer: { color: colors.textFaint, fontSize: 12, textAlign: 'center' },
});
