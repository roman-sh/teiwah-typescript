import { Teiwah, type InboundMessage } from "../src/index.js";

declare const teiwah: Teiwah;
declare const inboundMessage: InboundMessage;

switch (inboundMessage.media?.type) {
  case "ptt": {
    const base64: string = inboundMessage.media.base64;
    void base64;
  }
}

teiwah.sendImage({
  chatId: "120363012345678901@g.us",
  url: "https://example.com/image.jpg",
});

teiwah.sendPtt({
  chatId: "972501234567@s.whatsapp.net",
  base64: "T2dnUwACAAAAAAAAAAA",
  mimeType: "audio/ogg",
});

// @ts-expect-error A media request must not provide both sources.
teiwah.sendImage({
  chatId: "972501234567@s.whatsapp.net",
  url: "https://example.com/image.jpg",
  base64: "aW1hZ2U=",
});

// @ts-expect-error Text is required.
teiwah.sendText({ chatId: "972501234567@s.whatsapp.net" });

// @ts-expect-error The public constructor uses apiKey, not sessionApiKey.
new Teiwah({ sessionApiKey: "secret" });
