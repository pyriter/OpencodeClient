import { useMemo, useRef, useState } from 'react';
import {
  Dimensions,
  Linking,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ConnectArt,
  InstallArt,
  ServeArt,
  TailscaleArt,
  WelcomeArt,
} from '@/components/OnboardingIllustrations';
import { colors, font, fontSize, radius, spacing } from '@/theme';

type Step = {
  key: string;
  art: () => React.ReactElement;
  title: string;
  body: string;
  bullets?: string[];
  code?: string;
  codeNote?: string;
  link?: { label: string; url: string };
};

const STEPS: Step[] = [
  {
    key: 'welcome',
    art: WelcomeArt,
    title: 'Welcome to OpencodeClient',
    body:
      'Code on your laptop, from your phone. This app is a mobile front-end for the opencode server running on your machine.',
    bullets: [
      'Pick up a session anywhere on your tailnet',
      'Stream replies live, abort or clear in one tap',
      'No data leaves your devices',
    ],
  },
  {
    key: 'install',
    art: InstallArt,
    title: 'Install opencode',
    body:
      'On the machine you want to code from, install the opencode CLI. It ships the server we’ll connect to in a moment.',
    code: 'npm i -g opencode-ai',
    codeNote: 'Already installed? Skip ahead.',
    link: { label: 'opencode.ai/docs', url: 'https://opencode.ai/docs' },
  },
  {
    key: 'tailscale',
    art: TailscaleArt,
    title: 'Join a Tailscale network',
    body:
      'Tailscale gives every device a private hostname, so your phone can reach your laptop wherever you are — no port forwarding, no public URL.',
    bullets: [
      'Install Tailscale on both your phone and laptop',
      'Sign in with the same account on both',
      'Each device gets a stable name like mac.tail-abc.ts.net',
    ],
    link: { label: 'tailscale.com/download', url: 'https://tailscale.com/download' },
  },
  {
    key: 'serve',
    art: ServeArt,
    title: 'Start the opencode server',
    body:
      'Run this on your laptop. Pick any password — you’ll paste it on the next screen. The --hostname 0.0.0.0 flag lets other tailnet devices reach it.',
    code:
      'OPENCODE_SERVER_PASSWORD=hunter2 \\\n  opencode serve \\\n  --port 4096 \\\n  --hostname 0.0.0.0',
    codeNote:
      'Once it’s running, your URL will look like http://<laptop-name>.tail-abc.ts.net:4096',
  },
  {
    key: 'connect',
    art: ConnectArt,
    title: 'Connect this app',
    body:
      'Paste the server URL and password on the next screen. We test the connection and save credentials in the device keychain.',
    bullets: [
      'URL: your tailnet hostname + port (e.g. http://mac.tail-abc.ts.net:4096)',
      'Password: whatever you set on OPENCODE_SERVER_PASSWORD',
      'Both stay on this device.',
    ],
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const [index, setIndex] = useState(0);
  const { width } = useWindowDimensions();

  // On web we sometimes get width=0 on first paint — fall back to window width.
  const pageWidth = width || Dimensions.get('window').width || 360;
  const last = index === STEPS.length - 1;

  const goTo = (i: number) => {
    const clamped = Math.max(0, Math.min(STEPS.length - 1, i));
    setIndex(clamped);
    scrollRef.current?.scrollTo({ x: clamped * pageWidth, animated: true });
  };

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = e.nativeEvent.contentOffset.x;
    const next = Math.round(x / pageWidth);
    if (next !== index) setIndex(next);
  };

  const finish = () => router.replace('/settings');

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.topBar}>
        <Text style={styles.brand}>opencode</Text>
        {!last && (
          <Pressable onPress={finish} hitSlop={8} style={styles.skipBtn}>
            <Text style={styles.skipText}>Skip</Text>
          </Pressable>
        )}
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        style={styles.scroll}
      >
        {STEPS.map((step) => (
          <Page key={step.key} step={step} width={pageWidth} />
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.dots}>
          {STEPS.map((s, i) => (
            <Pressable
              key={s.key}
              onPress={() => goTo(i)}
              hitSlop={6}
              style={[styles.dot, i === index && styles.dotActive]}
            />
          ))}
        </View>
        <View style={styles.actions}>
          {index > 0 ? (
            <Pressable style={styles.backBtn} onPress={() => goTo(index - 1)}>
              <Text style={styles.backText}>Back</Text>
            </Pressable>
          ) : (
            <View style={styles.backBtn} />
          )}
          <Pressable
            style={styles.nextBtn}
            onPress={() => (last ? finish() : goTo(index + 1))}
          >
            <Text style={styles.nextText}>{last ? 'Get started' : 'Next'}</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

function Page({ step, width }: { step: Step; width: number }) {
  const Art = step.art;
  return (
    <View style={[styles.page, { width }]}>
      <View style={styles.artFrame}>
        <Art />
      </View>
      <View style={styles.copy}>
        <Text style={styles.title}>{step.title}</Text>
        <Text style={styles.body}>{step.body}</Text>

        {!!step.bullets?.length && (
          <View style={styles.bullets}>
            {step.bullets.map((b) => (
              <View key={b} style={styles.bulletRow}>
                <View style={styles.bulletDot} />
                <Text style={styles.bulletText}>{b}</Text>
              </View>
            ))}
          </View>
        )}

        {!!step.code && (
          <View style={styles.codeWrap}>
            <Text style={styles.code} selectable>
              {step.code}
            </Text>
          </View>
        )}

        {!!step.codeNote && <Text style={styles.codeNote}>{step.codeNote}</Text>}

        {!!step.link && (
          <Pressable onPress={() => Linking.openURL(step.link!.url)} hitSlop={6}>
            <Text style={styles.link}>{step.link.label} ↗</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  brand: {
    color: colors.accent,
    fontFamily: font.mono,
    fontSize: fontSize.md,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  skipBtn: { paddingHorizontal: spacing.sm, paddingVertical: 4 },
  skipText: { color: colors.textMuted, fontSize: fontSize.base },

  scroll: { flex: 1 },
  page: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  artFrame: {
    height: 280,
    marginTop: spacing.md,
    borderRadius: radius.xl,
    backgroundColor: colors.bgElevated,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  copy: {
    paddingTop: spacing.lg,
    gap: spacing.sm,
  },
  title: {
    color: colors.text,
    fontSize: fontSize.xl,
    fontWeight: '700',
    lineHeight: fontSize.xl * 1.2,
  },
  body: {
    color: colors.textSubtle,
    fontSize: fontSize.md,
    lineHeight: fontSize.md * 1.55,
  },
  bullets: { gap: spacing.xs, marginTop: spacing.xs },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  bulletDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.accent,
    marginTop: 9,
  },
  bulletText: {
    flex: 1,
    color: colors.textSubtle,
    fontSize: fontSize.base,
    lineHeight: fontSize.base * 1.5,
  },
  codeWrap: {
    marginTop: spacing.xs,
    backgroundColor: colors.bgCode,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  code: {
    color: colors.text,
    fontFamily: font.mono,
    fontSize: fontSize.sm,
    lineHeight: fontSize.sm * 1.55,
  },
  codeNote: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    lineHeight: fontSize.sm * 1.5,
  },
  link: {
    color: colors.accent,
    fontSize: fontSize.base,
    textDecorationLine: 'underline',
    marginTop: spacing.xs,
  },

  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    gap: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.bgElevated,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  dotActive: {
    width: 22,
    backgroundColor: colors.accent,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  backBtn: {
    minWidth: 72,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
  },
  backText: { color: colors.textMuted, fontSize: fontSize.md, fontWeight: '500' },
  nextBtn: {
    flex: 1,
    backgroundColor: colors.accent,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  nextText: { color: colors.bg, fontWeight: '700', fontSize: fontSize.md },
});
