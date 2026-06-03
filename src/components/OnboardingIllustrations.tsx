// Pure-RN "hero" illustrations for the FTUE — colored View shapes, no SVG dep.
// Each one is a self-contained block that fills its container.

import { StyleSheet, Text, View } from 'react-native';
import { colors, font, fontSize, radius, spacing } from '@/theme';

function TrafficLights() {
  return (
    <View style={ill.trafficLights}>
      <View style={[ill.tlDot, { backgroundColor: '#ff5f57' }]} />
      <View style={[ill.tlDot, { backgroundColor: '#febc2e' }]} />
      <View style={[ill.tlDot, { backgroundColor: '#28c840' }]} />
    </View>
  );
}

// 1. Welcome — phone + cloud + laptop schematic
export function WelcomeArt() {
  return (
    <View style={ill.stage}>
      <View style={ill.welcomeRow}>
        {/* Phone */}
        <View style={ill.phone}>
          <View style={ill.notch} />
          <View style={ill.phoneScreen}>
            <View style={[ill.bar, { width: 30 }]} />
            <View style={[ill.bar, { width: 50 }]} />
            <View style={[ill.bar, { width: 22 }]} />
            <View style={ill.phoneBubble} />
          </View>
        </View>

        {/* Connecting cloud */}
        <View style={ill.connector}>
          <View style={ill.dashLine} />
          <View style={ill.cloud}>
            <Text style={ill.cloudText}>opencode</Text>
          </View>
          <View style={ill.dashLine} />
        </View>

        {/* Laptop */}
        <View style={ill.laptopWrap}>
          <View style={ill.laptopLid}>
            <View style={ill.laptopScreen}>
              <View style={[ill.bar, { width: 40 }]} />
              <View style={[ill.bar, { width: 28 }]} />
              <View style={[ill.bar, { width: 36 }]} />
            </View>
          </View>
          <View style={ill.laptopBase} />
        </View>
      </View>
    </View>
  );
}

// 2. Install opencode — terminal with npm install
export function InstallArt() {
  return (
    <View style={ill.stage}>
      <View style={ill.terminal}>
        <View style={ill.terminalHead}>
          <TrafficLights />
          <Text style={ill.terminalTitle}>~/ — zsh</Text>
        </View>
        <View style={ill.terminalBody}>
          <Text style={ill.term}>
            <Text style={ill.termPrompt}>$ </Text>npm i -g opencode-ai
          </Text>
          <Text style={ill.termFaint}>added 142 packages in 4s</Text>
          <Text style={ill.term}>
            <Text style={ill.termPrompt}>$ </Text>opencode --version
          </Text>
          <Text style={ill.termOK}>opencode 1.15.12</Text>
          <Text style={ill.termCursor}>
            <Text style={ill.termPrompt}>$ </Text>
            <Text style={ill.cursor}>▍</Text>
          </Text>
        </View>
      </View>
    </View>
  );
}

// 3. Tailscale — two devices on a private mesh
export function TailscaleArt() {
  return (
    <View style={ill.stage}>
      <View style={ill.tsCloud}>
        <View style={ill.tsBadge}>
          <View style={ill.tsDotsRow}>
            <View style={ill.tsBadgeDot} />
            <View style={ill.tsBadgeDot} />
            <View style={ill.tsBadgeDot} />
          </View>
          <View style={ill.tsDotsRow}>
            <View style={ill.tsBadgeDot} />
            <View style={ill.tsBadgeDot} />
            <View style={ill.tsBadgeDot} />
          </View>
          <View style={ill.tsDotsRow}>
            <View style={ill.tsBadgeDot} />
            <View style={ill.tsBadgeDot} />
            <View style={ill.tsBadgeDot} />
          </View>
        </View>
        <Text style={ill.tsLabel}>tailscale mesh</Text>
      </View>

      <View style={ill.tsRow}>
        <View style={ill.tsDevice}>
          <Text style={ill.tsDeviceIcon}>📱</Text>
          <Text style={ill.tsDeviceLabel}>this phone</Text>
          <Text style={ill.tsDeviceHost}>iphone.tail-abc.ts.net</Text>
        </View>

        <View style={ill.tsLinkWrap}>
          <View style={ill.tsLink} />
          <View style={ill.tsLinkArrow}>
            <Text style={ill.tsArrowText}>⇄</Text>
          </View>
        </View>

        <View style={ill.tsDevice}>
          <Text style={ill.tsDeviceIcon}>💻</Text>
          <Text style={ill.tsDeviceLabel}>your mac</Text>
          <Text style={ill.tsDeviceHost}>mac.tail-abc.ts.net</Text>
        </View>
      </View>
    </View>
  );
}

// 4. Run the server — terminal with opencode serve output
export function ServeArt() {
  return (
    <View style={ill.stage}>
      <View style={ill.terminal}>
        <View style={ill.terminalHead}>
          <TrafficLights />
          <Text style={ill.terminalTitle}>~/code — opencode serve</Text>
        </View>
        <View style={ill.terminalBody}>
          <Text style={ill.term}>
            <Text style={ill.termPrompt}>$ </Text>
            <Text style={ill.termVar}>OPENCODE_SERVER_PASSWORD</Text>
            <Text style={ill.term}>=hunter2 \</Text>
          </Text>
          <Text style={[ill.term, { paddingLeft: 18 }]}>
            opencode serve <Text style={ill.termFlag}>--port</Text> 4096 \
          </Text>
          <Text style={[ill.term, { paddingLeft: 18 }]}>
            <Text style={ill.termFlag}>            --hostname</Text> 0.0.0.0
          </Text>
          <View style={{ height: 6 }} />
          <Text style={ill.termOK}>✓ listening on tailnet</Text>
          <View style={ill.urlPill}>
            <Text style={ill.urlPillText}>http://mac.tail-abc.ts.net:4096</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

// 5. Connect this app — phone with settings screen mock
export function ConnectArt() {
  return (
    <View style={ill.stage}>
      <View style={ill.bigPhone}>
        <View style={ill.notch} />
        <View style={ill.bigPhoneScreen}>
          <Text style={ill.mockTitle}>Connect to opencode</Text>

          <Text style={ill.mockLabel}>Server URL</Text>
          <View style={ill.mockInput}>
            <Text style={ill.mockInputText}>http://mac.tail-abc.ts.net:4096</Text>
          </View>

          <Text style={ill.mockLabel}>Password</Text>
          <View style={ill.mockInput}>
            <Text style={ill.mockInputText}>•••••••</Text>
          </View>

          <View style={ill.mockBtn}>
            <Text style={ill.mockBtnText}>Test & save</Text>
          </View>
        </View>
      </View>

      <View style={ill.sparklesRow}>
        <Text style={ill.sparkle}>✨</Text>
        <Text style={ill.sparkleBig}>🎉</Text>
        <Text style={ill.sparkle}>✨</Text>
      </View>
    </View>
  );
}

const ill = StyleSheet.create({
  stage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    gap: spacing.md,
  },

  // ---- Welcome ----
  welcomeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    width: '100%',
  },
  phone: {
    width: 70,
    height: 130,
    borderRadius: 14,
    backgroundColor: colors.bgRaised,
    borderWidth: 2,
    borderColor: colors.borderStrong,
    padding: 6,
    alignItems: 'center',
  },
  notch: {
    width: 22,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.borderStrong,
    marginBottom: 4,
  },
  phoneScreen: {
    flex: 1,
    width: '100%',
    borderRadius: 8,
    backgroundColor: colors.bgElevated,
    padding: 6,
    gap: 4,
  },
  bar: {
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.textFaint,
  },
  phoneBubble: {
    marginTop: 'auto',
    height: 14,
    width: '70%',
    borderRadius: 8,
    backgroundColor: colors.accentSoft,
    alignSelf: 'flex-end',
  },
  connector: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  dashLine: {
    width: '100%',
    height: 2,
    backgroundColor: colors.borderAccent,
    opacity: 0.6,
    borderRadius: 1,
  },
  cloud: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: colors.accentSoft,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  cloudText: {
    color: colors.text,
    fontSize: fontSize.xs,
    fontFamily: font.mono,
    fontWeight: '600',
  },
  laptopWrap: { alignItems: 'center', gap: 2 },
  laptopLid: {
    width: 110,
    height: 70,
    borderRadius: 8,
    backgroundColor: colors.bgRaised,
    borderWidth: 2,
    borderColor: colors.borderStrong,
    padding: 6,
  },
  laptopScreen: {
    flex: 1,
    borderRadius: 4,
    backgroundColor: colors.bgElevated,
    padding: 6,
    gap: 4,
  },
  laptopBase: {
    width: 130,
    height: 5,
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 6,
    backgroundColor: colors.borderStrong,
  },

  // ---- Terminal ----
  terminal: {
    width: '100%',
    maxWidth: 380,
    borderRadius: radius.lg,
    backgroundColor: '#0a0d12',
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  terminalHead: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 8,
    backgroundColor: colors.bgElevated,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.sm,
  },
  trafficLights: { flexDirection: 'row', gap: 6 },
  tlDot: { width: 10, height: 10, borderRadius: 5 },
  terminalTitle: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    fontFamily: font.mono,
    flex: 1,
    textAlign: 'center',
    marginRight: 40,
  },
  terminalBody: {
    padding: spacing.md,
    gap: 4,
  },
  term: {
    color: colors.text,
    fontFamily: font.mono,
    fontSize: fontSize.sm,
    lineHeight: fontSize.sm * 1.5,
  },
  termPrompt: { color: colors.accent, fontWeight: '600' },
  termFaint: { color: colors.textFaint, fontFamily: font.mono, fontSize: fontSize.sm },
  termOK: { color: colors.success, fontFamily: font.mono, fontSize: fontSize.sm, fontWeight: '600' },
  termVar: { color: colors.warn, fontFamily: font.mono, fontSize: fontSize.sm },
  termFlag: { color: colors.user, fontFamily: font.mono, fontSize: fontSize.sm },
  termCursor: { color: colors.text, fontFamily: font.mono, fontSize: fontSize.sm },
  cursor: { color: colors.accent, fontWeight: '700' },
  urlPill: {
    marginTop: 6,
    alignSelf: 'flex-start',
    backgroundColor: colors.accentSoft,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  urlPillText: {
    color: colors.text,
    fontFamily: font.mono,
    fontSize: fontSize.xs,
  },

  // ---- Tailscale ----
  tsCloud: {
    alignItems: 'center',
    gap: 6,
  },
  tsBadge: {
    width: 76,
    height: 76,
    borderRadius: 18,
    backgroundColor: colors.bgElevated,
    borderWidth: 2,
    borderColor: colors.borderAccent,
    padding: 10,
    justifyContent: 'space-between',
  },
  tsDotsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  tsBadgeDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.accent,
  },
  tsLabel: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    fontFamily: font.mono,
    letterSpacing: 0.4,
  },
  tsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    gap: spacing.xs,
  },
  tsDevice: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: colors.bgElevated,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.sm,
    gap: 2,
  },
  tsDeviceIcon: { fontSize: 28 },
  tsDeviceLabel: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  tsDeviceHost: {
    color: colors.textFaint,
    fontSize: 9,
    fontFamily: font.mono,
  },
  tsLinkWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
  },
  tsLink: {
    height: 2,
    width: '100%',
    backgroundColor: colors.accent,
    opacity: 0.6,
  },
  tsLinkArrow: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tsArrowText: { color: colors.bg, fontWeight: '700', fontSize: 14 },

  // ---- Connect (big phone with settings mock) ----
  bigPhone: {
    width: 180,
    height: 250,
    borderRadius: 22,
    backgroundColor: colors.bgRaised,
    borderWidth: 3,
    borderColor: colors.borderStrong,
    padding: 6,
    alignItems: 'center',
  },
  bigPhoneScreen: {
    flex: 1,
    width: '100%',
    borderRadius: 16,
    backgroundColor: colors.bg,
    padding: spacing.sm + 2,
    gap: 6,
  },
  mockTitle: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: '700',
    marginBottom: 2,
  },
  mockLabel: {
    color: colors.textSubtle,
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 0.3,
    marginTop: 4,
  },
  mockInput: {
    backgroundColor: colors.bgInput,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  mockInputText: {
    color: colors.text,
    fontSize: 9,
    fontFamily: font.mono,
  },
  mockBtn: {
    marginTop: 8,
    backgroundColor: colors.accent,
    paddingVertical: 8,
    borderRadius: radius.sm,
    alignItems: 'center',
  },
  mockBtnText: { color: colors.bg, fontWeight: '700', fontSize: fontSize.xs },
  sparklesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  sparkle: { fontSize: 18 },
  sparkleBig: { fontSize: 28 },
});
