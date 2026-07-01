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

Create a connected WhatsApp session in the
[Teiwah dashboard](https://teiwah.cloud/dashboard), then initialize the client
with that session's API key:

```ts
import { Teiwah } from "teiwah";

const teiwah = new Teiwah({
  apiKey: process.env.TEIWAH_API_KEY!,
});

await teiwah.sendText({
  chatId: "972501234567@s.whatsapp.net",
  text: "Hello from Teiwah",
});
```

Use the inbound webhook's `chatId` unchanged when replying.

## Sending messages

The SDK provides one method for every supported message type:

```ts
await teiwah.sendImage({
  chatId,
  url: "https://example.com/image.jpg",
  caption: "Look at this",
});

await teiwah.sendPtt({
  chatId,
  base64: voiceNoteBase64,
  mimeType: "audio/ogg",
});

await teiwah.sendDocument({
  chatId,
  url: "https://example.com/report.pdf",
  filename: "report.pdf",
});
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
requests containing both or neither.

To quote a message, include its native WhatsApp ID:

```ts
await teiwah.sendText({
  chatId,
  text: "Got it, thanks!",
  quoteMessageId: inboundMessage.id,
});
```

## Receiving messages

Teiwah sends inbound messages to the webhook configured for your session. The
SDK exports the webhook payload type:

```ts
import type { InboundMessage } from "teiwah";

export async function handleWebhook(message: InboundMessage) {
  if ("text" in message) {
    console.log(message.text);
  } else {
    console.log(message.media.type, message.media.url);
  }
}
```

Inbound delivery is real-time and best-effort. Deduplicate messages using `id`.

## Chat actions

```ts
await teiwah.showTyping({ chatId });
await teiwah.markMessageRead({ messageId: inboundMessage.id });
```

## Downloading inbound media

```ts
const { result, headers } = await teiwah.downloadMedia({
  id: inboundMessage.id,
});

// result is a ReadableStream<Uint8Array>
```

## Errors

API failures are typed errors:

```ts
import { ErrorResponse } from "teiwah/models/errors";

try {
  await teiwah.sendText({ chatId, text: "Hello" });
} catch (error) {
  if (error instanceof ErrorResponse) {
    console.error(error.message, error.data$);
  } else {
    throw error;
  }
}
```

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
