# Messages

## Overview

Send outbound WhatsApp messages.

### Available Operations

* [sendMessage](#sendmessage) - Send a message

## sendMessage

Sends a text or media message from the WhatsApp session identified by
the API key.

`quoteMessageId` may reference an inbound message ID or the ID returned
by an earlier send. Quoting is best-effort: if the ID is unknown or has
left the recent-message cache, the message is sent without a quote.

A cold one-to-one send to a contact who has not previously engaged the
connected account is rejected with 403. Group sends are not subject to
this trusted-contact restriction.

Clients must not automatically retry this operation. A transport or
server failure can be ambiguous: WhatsApp may have accepted the message
even when Teiwah could not return a usable response.


### Example Usage: gatewayValidation

<!-- UsageSnippet language="typescript" operationID="sendMessage" method="post" path="/messages" example="gatewayValidation" -->
```typescript
import { Teiwah } from "teiwah";

const teiwah = new Teiwah({
  sessionApiKey: process.env["TEIWAH_SESSION_API_KEY"] ?? "",
});

async function run() {
  const result = await teiwah.messages.sendMessage({
    chatId: "972501234567",
    text: "<value>",
    quoteMessageId: "3EB0C767D7A0D9D8F8A1",
  });

  console.log(result);
}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { TeiwahCore } from "teiwah/core.js";
import { messagesSendMessage } from "teiwah/funcs/messages-send-message.js";

// Use `TeiwahCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const teiwah = new TeiwahCore({
  sessionApiKey: process.env["TEIWAH_SESSION_API_KEY"] ?? "",
});

async function run() {
  const res = await messagesSendMessage(teiwah, {
    chatId: "972501234567",
    text: "<value>",
    quoteMessageId: "3EB0C767D7A0D9D8F8A1",
  });
  if (res.ok) {
    const { value: result } = res;
    console.log(result);
  } else {
    console.log("messagesSendMessage failed:", res.error);
  }
}

run();
```
### Example Usage: imageByUrl

<!-- UsageSnippet language="typescript" operationID="sendMessage" method="post" path="/messages" example="imageByUrl" -->
```typescript
import { Teiwah } from "teiwah";

const teiwah = new Teiwah({
  sessionApiKey: process.env["TEIWAH_SESSION_API_KEY"] ?? "",
});

async function run() {
  const result = await teiwah.messages.sendMessage({
    chatId: "972501234567",
    media: {
      type: "image",
      url: "https://example.com/photo.jpg",
      caption: "Look at this",
    },
  });

  console.log(result);
}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { TeiwahCore } from "teiwah/core.js";
import { messagesSendMessage } from "teiwah/funcs/messages-send-message.js";

// Use `TeiwahCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const teiwah = new TeiwahCore({
  sessionApiKey: process.env["TEIWAH_SESSION_API_KEY"] ?? "",
});

async function run() {
  const res = await messagesSendMessage(teiwah, {
    chatId: "972501234567",
    media: {
      type: "image",
      url: "https://example.com/photo.jpg",
      caption: "Look at this",
    },
  });
  if (res.ok) {
    const { value: result } = res;
    console.log(result);
  } else {
    console.log("messagesSendMessage failed:", res.error);
  }
}

run();
```
### Example Usage: quotedReply

<!-- UsageSnippet language="typescript" operationID="sendMessage" method="post" path="/messages" example="quotedReply" -->
```typescript
import { Teiwah } from "teiwah";

const teiwah = new Teiwah({
  sessionApiKey: process.env["TEIWAH_SESSION_API_KEY"] ?? "",
});

async function run() {
  const result = await teiwah.messages.sendMessage({
    chatId: "120363012345678901@g.us",
    text: "Got it, thanks!",
    quoteMessageId: "3EB0C767D7A0D9D8F8A1",
  });

  console.log(result);
}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { TeiwahCore } from "teiwah/core.js";
import { messagesSendMessage } from "teiwah/funcs/messages-send-message.js";

// Use `TeiwahCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const teiwah = new TeiwahCore({
  sessionApiKey: process.env["TEIWAH_SESSION_API_KEY"] ?? "",
});

async function run() {
  const res = await messagesSendMessage(teiwah, {
    chatId: "120363012345678901@g.us",
    text: "Got it, thanks!",
    quoteMessageId: "3EB0C767D7A0D9D8F8A1",
  });
  if (res.ok) {
    const { value: result } = res;
    console.log(result);
  } else {
    console.log("messagesSendMessage failed:", res.error);
  }
}

run();
```
### Example Usage: text

<!-- UsageSnippet language="typescript" operationID="sendMessage" method="post" path="/messages" example="text" -->
```typescript
import { Teiwah } from "teiwah";

const teiwah = new Teiwah({
  sessionApiKey: process.env["TEIWAH_SESSION_API_KEY"] ?? "",
});

async function run() {
  const result = await teiwah.messages.sendMessage({
    chatId: "972501234567",
    text: "Hello from Teiwah",
  });

  console.log(result);
}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { TeiwahCore } from "teiwah/core.js";
import { messagesSendMessage } from "teiwah/funcs/messages-send-message.js";

// Use `TeiwahCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const teiwah = new TeiwahCore({
  sessionApiKey: process.env["TEIWAH_SESSION_API_KEY"] ?? "",
});

async function run() {
  const res = await messagesSendMessage(teiwah, {
    chatId: "972501234567",
    text: "Hello from Teiwah",
  });
  if (res.ok) {
    const { value: result } = res;
    console.log(result);
  } else {
    console.log("messagesSendMessage failed:", res.error);
  }
}

run();
```
### Example Usage: validation

<!-- UsageSnippet language="typescript" operationID="sendMessage" method="post" path="/messages" example="validation" -->
```typescript
import { Teiwah } from "teiwah";

const teiwah = new Teiwah({
  sessionApiKey: process.env["TEIWAH_SESSION_API_KEY"] ?? "",
});

async function run() {
  const result = await teiwah.messages.sendMessage({
    chatId: "972501234567",
    media: {
      type: "document",
      base64: "<value>",
      mimeType: "audio/ogg",
    },
    quoteMessageId: "3EB0C767D7A0D9D8F8A1",
  });

  console.log(result);
}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { TeiwahCore } from "teiwah/core.js";
import { messagesSendMessage } from "teiwah/funcs/messages-send-message.js";

// Use `TeiwahCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const teiwah = new TeiwahCore({
  sessionApiKey: process.env["TEIWAH_SESSION_API_KEY"] ?? "",
});

async function run() {
  const res = await messagesSendMessage(teiwah, {
    chatId: "972501234567",
    media: {
      type: "document",
      base64: "<value>",
      mimeType: "audio/ogg",
    },
    quoteMessageId: "3EB0C767D7A0D9D8F8A1",
  });
  if (res.ok) {
    const { value: result } = res;
    console.log(result);
  } else {
    console.log("messagesSendMessage failed:", res.error);
  }
}

run();
```
### Example Usage: voiceNoteByBase64

<!-- UsageSnippet language="typescript" operationID="sendMessage" method="post" path="/messages" example="voiceNoteByBase64" -->
```typescript
import { Teiwah } from "teiwah";

const teiwah = new Teiwah({
  sessionApiKey: process.env["TEIWAH_SESSION_API_KEY"] ?? "",
});

async function run() {
  const result = await teiwah.messages.sendMessage({
    chatId: "972501234567@s.whatsapp.net",
    media: {
      type: "ptt",
      base64: "T2dnUwACAAAAAAAAAAA...",
      mimeType: "audio/ogg",
    },
  });

  console.log(result);
}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { TeiwahCore } from "teiwah/core.js";
import { messagesSendMessage } from "teiwah/funcs/messages-send-message.js";

// Use `TeiwahCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const teiwah = new TeiwahCore({
  sessionApiKey: process.env["TEIWAH_SESSION_API_KEY"] ?? "",
});

async function run() {
  const res = await messagesSendMessage(teiwah, {
    chatId: "972501234567@s.whatsapp.net",
    media: {
      type: "ptt",
      base64: "T2dnUwACAAAAAAAAAAA...",
      mimeType: "audio/ogg",
    },
  });
  if (res.ok) {
    const { value: result } = res;
    console.log(result);
  } else {
    console.log("messagesSendMessage failed:", res.error);
  }
}

run();
```

### Parameters

| Parameter                                                                                                                                                                      | Type                                                                                                                                                                           | Required                                                                                                                                                                       | Description                                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `request`                                                                                                                                                                      | [models.SendMessageRequest](../../models/send-message-request.md)                                                                                                              | :heavy_check_mark:                                                                                                                                                             | The request object to use for the request.                                                                                                                                     |
| `options`                                                                                                                                                                      | RequestOptions                                                                                                                                                                 | :heavy_minus_sign:                                                                                                                                                             | Used to set various options for making HTTP requests.                                                                                                                          |
| `options.fetchOptions`                                                                                                                                                         | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)                                                                                        | :heavy_minus_sign:                                                                                                                                                             | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed. |
| `options.retries`                                                                                                                                                              | [RetryConfig](../../lib/utils/retryconfig.md)                                                                                                                                  | :heavy_minus_sign:                                                                                                                                                             | Enables retrying HTTP requests under certain failure conditions.                                                                                                               |

### Response

**Promise\<[models.SendMessageResponse](../../models/send-message-response.md)\>**

### Errors

| Error Type                | Status Code               | Content Type              |
| ------------------------- | ------------------------- | ------------------------- |
| errors.ErrorResponse      | 400, 401, 403, 413, 422   | application/json          |
| errors.ErrorResponse      | 503, 5XX                  | application/json          |
| errors.TeiwahDefaultError | 4XX                       | \*/\*                     |