import assert from "node:assert/strict";
import test from "node:test";

import { HTTPClient, Teiwah } from "../dist/esm/index.js";

function createClient(fetcher) {
  return new Teiwah({
    apiKey: "test-session-key",
    httpClient: new HTTPClient({ fetcher }),
  });
}

function successResponse(body = { success: true, id: "message-1" }) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}

test("maps top-level send helpers to the message endpoint", async () => {
  const requests = [];
  const teiwah = createClient(async (request) => {
    requests.push({
      authorization: request.headers.get("authorization"),
      body: JSON.parse(await request.text()),
      pathname: new URL(request.url).pathname,
    });
    return successResponse();
  });

  await teiwah.sendText({ chatId: "chat-1", text: "Hello" });
  await teiwah.sendImage({
    chatId: "chat-1",
    url: "https://example.com/image.jpg",
    caption: "Image",
  });
  await teiwah.sendPtt({
    chatId: "chat-1",
    base64: "dm9pY2U=",
    mimeType: "audio/ogg",
  });
  await teiwah.sendAudio({
    chatId: "chat-1",
    url: "https://example.com/audio.mp3",
  });
  await teiwah.sendVideo({
    chatId: "chat-1",
    url: "https://example.com/video.mp4",
  });
  await teiwah.sendDocument({
    chatId: "chat-1",
    url: "https://example.com/document.pdf",
    filename: "document.pdf",
  });

  assert.deepEqual(
    requests.map(({ body }) => body.media?.type ?? "text"),
    ["text", "image", "ptt", "audio", "video", "document"],
  );
  assert.ok(requests.every(({ pathname }) => pathname === "/messages"));
  assert.ok(
    requests.every(
      ({ authorization }) => authorization === "Bearer test-session-key",
    ),
  );
  assert.deepEqual(requests[1].body, {
    chatId: "chat-1",
    media: {
      type: "image",
      url: "https://example.com/image.jpg",
      caption: "Image",
    },
  });
});

test("maps chat actions and media downloads to their endpoints", async () => {
  const requests = [];
  const teiwah = createClient(async (request) => {
    requests.push({
      method: request.method,
      pathname: new URL(request.url).pathname,
    });

    if (request.method === "GET") {
      return new Response(new Uint8Array([1, 2, 3]), {
        status: 200,
        headers: { "content-type": "application/octet-stream" },
      });
    }
    return successResponse({ success: true });
  });

  await teiwah.showTyping({ chatId: "chat-1" });
  await teiwah.markMessageRead({ messageId: "message-1" });
  const media = await teiwah.downloadMedia({ id: "message-1" });

  assert.deepEqual(requests, [
    { method: "POST", pathname: "/typing" },
    { method: "POST", pathname: "/read" },
    { method: "GET", pathname: "/media/message-1" },
  ]);
  assert.ok(media.result instanceof ReadableStream);
});

test("never retries a send after an ambiguous transport failure", async () => {
  let attempts = 0;
  const teiwah = createClient(async () => {
    attempts += 1;
    throw new TypeError("connection dropped");
  });

  await assert.rejects(
    teiwah.sendText(
      { chatId: "chat-1", text: "Do not duplicate" },
      {
        retries: {
          strategy: "attempt-count-backoff",
          maxRetries: 3,
          backoff: { initialInterval: 1, maxInterval: 1, exponent: 1 },
          retryConnectionErrors: true,
        },
      },
    ),
  );
  assert.equal(attempts, 1);
});

test("rejects invalid inputs before making a request", () => {
  const teiwah = createClient(async () => successResponse());

  assert.throws(
    () => teiwah.sendText({ chatId: "chat-1", text: "   " }),
    /text must not be empty/,
  );
  assert.throws(
    () =>
      teiwah.sendImage({
        chatId: "chat-1",
        url: "https://example.com/image.jpg",
        base64: "aW1hZ2U=",
      }),
    /Provide exactly one of url or base64/,
  );
  assert.throws(
    () => teiwah.sendDocument({ chatId: "chat-1", url: "file:///tmp/a" }),
    /url must use http or https/,
  );
});
