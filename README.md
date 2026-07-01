# Teiwah TypeScript SDK

Type-safe, server-side access to WhatsApp messaging through the
[Teiwah API](https://docs.teiwah.cloud).

> This SDK is in beta. Pin an exact version until it reaches `1.0.0`.

## Install

```bash
npm install teiwah
```

The package supports both ESM imports and CommonJS `require()`.

## Quick start

Required configuration:

1. **Connected session** — link the number in the [Teiwah dashboard](https://teiwah.cloud/dashboard) by scanning the session QR from WhatsApp (**Settings → Linked devices → Link a device**). Sending through a disconnected session returns `503`.
2. **Session API key** — copy it from the dashboard and provide it only to server-side code. The SDK validates it before making a request; the API returns `401` for a missing or invalid credential.
3. **Webhook URL** — configure a public HTTPS endpoint reachable from Teiwah. Include the complete handler path, such as `https://example.ngrok-free.app/webhook` rather than the origin alone.

Initialize the SDK with the session API key. Reply using the inbound message's
`chatId` unchanged:

```ts
import { Teiwah, type InboundMessage } from "teiwah"

const teiwah = new Teiwah({
  apiKey: process.env.TEIWAH_API_KEY!,
})

export async function reply(message: InboundMessage) {
  await teiwah.sendText({
    chatId: message.chatId,
    text: "Hello from Teiwah",
  })
}
```

## Sending messages

The SDK provides one method for every supported message type:

```ts
await teiwah.sendImage({
  chatId,
  url: "https://example.com/image.jpg",
  caption: "Look at this",
})

// mimeType and filename are optional — Teiwah infers them from the URL/content.
await teiwah.sendPtt({
  chatId,
  base64: voiceNoteBase64,
})

await teiwah.sendDocument({
  chatId,
  url: "https://example.com/report.pdf",
})
```

Available methods:

- `sendText`
- `sendImage`
- `sendPtt`
- `sendAudio`
- `sendVideo`
- `sendDocument`
- `sendMessage` for dynamic text or media requests
- `markMessageRead`
- `showTyping`
- `downloadMedia`

Every media helper accepts exactly one of `url` or `base64`. TypeScript rejects
requests containing both or neither. Prefer URLs for large files base64 input
is limited to 16 MB decoded. `mimeType` and `filename` are inferred when omitted
and remain available as optional overrides.

To quote a message, include its native WhatsApp ID:

```ts
await teiwah.sendText({
  chatId,
  text: "Got it, thanks!",
  quoteMessageId: inboundMessage.id,
})
```

Teiwah blocks cold one-to-one messages to contacts that have not previously
engaged the connected account. Replies and group messages work normally; a
blocked cold message returns HTTP 403.

## Receiving messages

Teiwah sends inbound messages to the webhook configured for your session. The
SDK exports the webhook payload type:

```ts
import type { InboundMessage } from "teiwah"

export async function handleWebhook(message: InboundMessage) {
  switch (true) {
    case "text" in message:
      // Text inbound — reply with sendText({ chatId: message.chatId, text: "..." }).
      break
    case "media" in message:
      // Media inbound — use media.url; PTT also includes media.base64.
      break
    default:
      // Handle unsupported message.
  }
}
```

Use `chatId` to reply to the conversation. In groups, `chatId` identifies the
group while `participant` identifies the individual sender; `participant` is
`null` in one-to-one conversations. `contact` is sender metadata, not a reply
target.

PTT voice notes always include inline `media.base64` for immediate processing.
They also include `media.url`. Other inbound media is downloaded through
`media.url`.

Inbound delivery is one POST per message, real-time and best-effort. Failed
delivery and non-2xx responses are logged but not retried. Deduplicate using
`id` if your handler runs more than once.

## Chat actions

```ts
await teiwah.showTyping({ chatId })
await teiwah.markMessageRead({ messageId: inboundMessage.id })
```

## Downloading inbound media

Use `downloadMedia` for images, audio, videos, and documents:

```ts
const { result, headers } = await teiwah.downloadMedia({
  id: inboundMessage.id,
})

// result is a ReadableStream<Uint8Array>
```

## Errors

API failures are typed errors:

```ts
import { ErrorResponse } from "teiwah/models/errors"

try {
  await teiwah.sendText({ chatId, text: "Hello" })
} catch (error) {
  if (error instanceof ErrorResponse) {
    console.error(error.message, error.data$)
  } else {
    throw error
  }
}
```

Common API statuses:

- `401` — the session API key is missing or invalid
- `403` — cold one-to-one outreach is blocked
- `404` — inbound media is unknown or no longer available for download
- `413` — decoded base64 exceeds 16 MB
- `422` — Teiwah could not fetch the supplied media URL
- `503` — the WhatsApp session is offline

## Retry behavior

The SDK does **not** automatically retry requests. A failed send can be
ambiguous: WhatsApp may have accepted the message even if the connection failed
before Teiwah returned a response. Retrying could therefore send duplicates.

## Security

Teiwah API keys control a connected WhatsApp session. Never expose them in
browser code, mobile applications, public repositories, logs, or client-side
environment variables. This SDK rejects construction in a browser environment.

## Runtime support

- Node.js 20 or newer
- Bun 1 or newer
- Deno with npm package support

See [RUNTIMES.md](./RUNTIMES.md) for details.

## Development

The transport client and models are generated from `openapi.yaml` by
[Speakeasy](https://www.speakeasy.com/). The public convenience façade is
maintained as regeneration-safe custom code. See
[CUSTOMIZATIONS.md](./CUSTOMIZATIONS.md).

```bash
npm run build
npm run lint
npm test
npm run test:types
```

## License

MIT
