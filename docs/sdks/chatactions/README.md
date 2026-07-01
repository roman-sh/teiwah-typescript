# ChatActions

## Overview

Send typing indicators and read receipts.

### Available Operations

* [sendTypingIndicator](#sendtypingindicator) - Show the typing indicator
* [markMessageRead](#markmessageread) - Mark an inbound message as read

## sendTypingIndicator

Shows the WhatsApp typing indicator for a conversation. Call this shortly
before replying. There is no stop operation; WhatsApp clears the indicator
automatically after roughly 25 seconds or when a message is sent.


### Example Usage: gatewayValidation

<!-- UsageSnippet language="typescript" operationID="sendTypingIndicator" method="post" path="/typing" example="gatewayValidation" -->
```typescript
import { Teiwah } from "teiwah";

const teiwah = new Teiwah({
  sessionApiKey: process.env["TEIWAH_SESSION_API_KEY"] ?? "",
});

async function run() {
  const result = await teiwah.chatActions.sendTypingIndicator({
    chatId: "972501234567",
  });

  console.log(result);
}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { TeiwahCore } from "teiwah/core.js";
import { chatActionsSendTypingIndicator } from "teiwah/funcs/chat-actions-send-typing-indicator.js";

// Use `TeiwahCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const teiwah = new TeiwahCore({
  sessionApiKey: process.env["TEIWAH_SESSION_API_KEY"] ?? "",
});

async function run() {
  const res = await chatActionsSendTypingIndicator(teiwah, {
    chatId: "972501234567",
  });
  if (res.ok) {
    const { value: result } = res;
    console.log(result);
  } else {
    console.log("chatActionsSendTypingIndicator failed:", res.error);
  }
}

run();
```
### Example Usage: validation

<!-- UsageSnippet language="typescript" operationID="sendTypingIndicator" method="post" path="/typing" example="validation" -->
```typescript
import { Teiwah } from "teiwah";

const teiwah = new Teiwah({
  sessionApiKey: process.env["TEIWAH_SESSION_API_KEY"] ?? "",
});

async function run() {
  const result = await teiwah.chatActions.sendTypingIndicator({
    chatId: "972501234567",
  });

  console.log(result);
}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { TeiwahCore } from "teiwah/core.js";
import { chatActionsSendTypingIndicator } from "teiwah/funcs/chat-actions-send-typing-indicator.js";

// Use `TeiwahCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const teiwah = new TeiwahCore({
  sessionApiKey: process.env["TEIWAH_SESSION_API_KEY"] ?? "",
});

async function run() {
  const res = await chatActionsSendTypingIndicator(teiwah, {
    chatId: "972501234567",
  });
  if (res.ok) {
    const { value: result } = res;
    console.log(result);
  } else {
    console.log("chatActionsSendTypingIndicator failed:", res.error);
  }
}

run();
```

### Parameters

| Parameter                                                                                                                                                                      | Type                                                                                                                                                                           | Required                                                                                                                                                                       | Description                                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `request`                                                                                                                                                                      | [models.TypingRequest](../../models/typing-request.md)                                                                                                                         | :heavy_check_mark:                                                                                                                                                             | The request object to use for the request.                                                                                                                                     |
| `options`                                                                                                                                                                      | RequestOptions                                                                                                                                                                 | :heavy_minus_sign:                                                                                                                                                             | Used to set various options for making HTTP requests.                                                                                                                          |
| `options.fetchOptions`                                                                                                                                                         | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)                                                                                        | :heavy_minus_sign:                                                                                                                                                             | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed. |
| `options.retries`                                                                                                                                                              | [RetryConfig](../../lib/utils/retryconfig.md)                                                                                                                                  | :heavy_minus_sign:                                                                                                                                                             | Enables retrying HTTP requests under certain failure conditions.                                                                                                               |

### Response

**Promise\<[models.SuccessResponse](../../models/success-response.md)\>**

### Errors

| Error Type                | Status Code               | Content Type              |
| ------------------------- | ------------------------- | ------------------------- |
| errors.ErrorResponse      | 400, 401                  | application/json          |
| errors.ErrorResponse      | 503, 5XX                  | application/json          |
| errors.TeiwahDefaultError | 4XX                       | \*/\*                     |

## markMessageRead

Sends a WhatsApp read receipt for an inbound message. Supply the native
`id` from the webhook as `messageId`. Teiwah resolves the full WhatsApp
message key from its recent-message cache.


### Example Usage: gatewayValidation

<!-- UsageSnippet language="typescript" operationID="markMessageRead" method="post" path="/read" example="gatewayValidation" -->
```typescript
import { Teiwah } from "teiwah";

const teiwah = new Teiwah({
  sessionApiKey: process.env["TEIWAH_SESSION_API_KEY"] ?? "",
});

async function run() {
  const result = await teiwah.chatActions.markMessageRead({
    messageId: "3EB0C767D7A0D9D8F8A1",
  });

  console.log(result);
}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { TeiwahCore } from "teiwah/core.js";
import { chatActionsMarkMessageRead } from "teiwah/funcs/chat-actions-mark-message-read.js";

// Use `TeiwahCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const teiwah = new TeiwahCore({
  sessionApiKey: process.env["TEIWAH_SESSION_API_KEY"] ?? "",
});

async function run() {
  const res = await chatActionsMarkMessageRead(teiwah, {
    messageId: "3EB0C767D7A0D9D8F8A1",
  });
  if (res.ok) {
    const { value: result } = res;
    console.log(result);
  } else {
    console.log("chatActionsMarkMessageRead failed:", res.error);
  }
}

run();
```
### Example Usage: validation

<!-- UsageSnippet language="typescript" operationID="markMessageRead" method="post" path="/read" example="validation" -->
```typescript
import { Teiwah } from "teiwah";

const teiwah = new Teiwah({
  sessionApiKey: process.env["TEIWAH_SESSION_API_KEY"] ?? "",
});

async function run() {
  const result = await teiwah.chatActions.markMessageRead({
    messageId: "3EB0C767D7A0D9D8F8A1",
  });

  console.log(result);
}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { TeiwahCore } from "teiwah/core.js";
import { chatActionsMarkMessageRead } from "teiwah/funcs/chat-actions-mark-message-read.js";

// Use `TeiwahCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const teiwah = new TeiwahCore({
  sessionApiKey: process.env["TEIWAH_SESSION_API_KEY"] ?? "",
});

async function run() {
  const res = await chatActionsMarkMessageRead(teiwah, {
    messageId: "3EB0C767D7A0D9D8F8A1",
  });
  if (res.ok) {
    const { value: result } = res;
    console.log(result);
  } else {
    console.log("chatActionsMarkMessageRead failed:", res.error);
  }
}

run();
```

### Parameters

| Parameter                                                                                                                                                                      | Type                                                                                                                                                                           | Required                                                                                                                                                                       | Description                                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `request`                                                                                                                                                                      | [models.ReadRequest](../../models/read-request.md)                                                                                                                             | :heavy_check_mark:                                                                                                                                                             | The request object to use for the request.                                                                                                                                     |
| `options`                                                                                                                                                                      | RequestOptions                                                                                                                                                                 | :heavy_minus_sign:                                                                                                                                                             | Used to set various options for making HTTP requests.                                                                                                                          |
| `options.fetchOptions`                                                                                                                                                         | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)                                                                                        | :heavy_minus_sign:                                                                                                                                                             | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed. |
| `options.retries`                                                                                                                                                              | [RetryConfig](../../lib/utils/retryconfig.md)                                                                                                                                  | :heavy_minus_sign:                                                                                                                                                             | Enables retrying HTTP requests under certain failure conditions.                                                                                                               |

### Response

**Promise\<[models.SuccessResponse](../../models/success-response.md)\>**

### Errors

| Error Type                | Status Code               | Content Type              |
| ------------------------- | ------------------------- | ------------------------- |
| errors.ErrorResponse      | 400, 401, 404             | application/json          |
| errors.ErrorResponse      | 503, 5XX                  | application/json          |
| errors.TeiwahDefaultError | 4XX                       | \*/\*                     |