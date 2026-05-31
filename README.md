# OpencodeClient

A cross-platform mobile client (iOS + Android) for [opencode](https://opencode.ai). Connect your phone to an `opencode serve` instance running on another machine — over a LAN, or anywhere on your Tailnet — and chat with sessions from anywhere.

Built with Expo (React Native) + TypeScript.

## Features

- Connect to any `opencode serve` URL with HTTP Basic auth (`OPENCODE_SERVER_PASSWORD`)
- List, create, rename, and delete sessions
- Send prompts; assistant responses stream in live over Server-Sent Events
- Tool calls (bash, edit, read, write, etc.) render as collapsible blocks with status, input, and output
- Pick a provider/model per session from the server's configured providers
- Abort an in-flight turn
- Credentials stored in the device keychain via `expo-secure-store`

## Quick start

### 1. Run an `opencode` server somewhere reachable

On the machine you want to use as the backend:

```bash
export OPENCODE_SERVER_PASSWORD=pick-something-long
opencode serve --hostname 0.0.0.0 --port 4096
```

`--hostname 0.0.0.0` binds to all interfaces so the device on your Tailnet (or LAN) can reach it. Confirm it's up:

```bash
curl -u opencode:$OPENCODE_SERVER_PASSWORD http://<host>:4096/session
```

### 2. Make sure your phone can reach it

The simplest path is **Tailscale**: install the Tailscale app on both the server machine and your phone, sign into the same Tailnet, and use the server's Tailscale MagicDNS name or `100.x.y.z` IP in the URL field.

(Any reachable URL works — public-IP + reverse proxy + HTTPS is fine too. Tailscale just avoids exposing the API to the internet.)

### 3. Run the app in development

```bash
cd OpencodeClient
npm install
npx expo start
```

Open Expo Go on your phone (App Store / Play Store) and scan the QR code. Or press `i` / `a` to launch the iOS Simulator / Android emulator on your dev machine.

In the app:
1. Enter the server URL (e.g. `http://my-machine.tail-scale.ts.net:4096`) and the `OPENCODE_SERVER_PASSWORD`.
2. Tap **Test & save**. On success you land on the sessions list.
3. Tap **+** to create a new session, or tap an existing one.
4. Pick a model from the chip above the input box, then send a prompt.

## Building a real installable app

For an actual `.ipa` / `.apk` you can install on a device, use [EAS Build](https://docs.expo.dev/build/introduction/):

```bash
npm install -g eas-cli
eas login
eas build --profile preview --platform ios     # creates an internal-distribution IPA
eas build --profile preview --platform android  # creates an APK
```

The first run will guide you through `eas init` and creating an `eas.json` if it isn't present.

## Project layout

```
src/
├── api/         # HTTP client, endpoint helpers, SSE event subscriber, types
├── state/       # Zustand store (settings) + TanStack Query client
├── components/  # MessageBubble, PartRenderer, ToolCallBlock, Composer, etc.
├── app/         # expo-router routes
│   ├── _layout.tsx
│   ├── index.tsx               # redirect to /settings or /sessions
│   ├── settings.tsx
│   └── sessions/
│       ├── index.tsx           # list
│       └── [id].tsx            # chat
└── theme.ts
```

## How the streaming chat works

1. The session screen mounts → `GET /session/:id/message` populates the transcript.
2. It opens a long-lived SSE connection to `/event` with `Authorization: Basic …` via `react-native-sse`.
3. Sending a prompt is a fire-and-forget `POST /session/:id/prompt_async`. The actual user message and assistant response (including each tool call) arrive as `message.updated` / `message.part.updated` bus events, which the screen patches into the TanStack Query cache.
4. Tap **abort** to `POST /session/:id/abort`.

## Security notes

- Credentials live in the iOS Keychain / Android Keystore via `expo-secure-store`.
- HTTP Basic over a plain HTTP server is **only safe inside a trusted network** (your Tailnet, your LAN). If you expose the server to the public internet, put it behind HTTPS.
- The default opencode server has no auth. Always set `OPENCODE_SERVER_PASSWORD` before exposing it to anything beyond `127.0.0.1`.

## License

MIT — see [LICENSE](./LICENSE).
