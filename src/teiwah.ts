import type { SDKOptions } from "./lib/config.js";
import type { RequestOptions } from "./lib/sdks.js";
import type * as models from "./models/index.js";
import type * as operations from "./models/operations/index.js";
import { MediaType } from "./models/media-type.js";
import { Teiwah as GeneratedTeiwah } from "./sdk/sdk.js";

type ApiKey = string | (() => Promise<string>);

/** Options for the Teiwah client. Keep API keys on the server. */
export type TeiwahOptions = Omit<
  SDKOptions,
  "sessionApiKey" | "retryConfig"
> & {
  apiKey: ApiKey;
};

/** Per-call options. Automatic retries are intentionally unavailable. */
export type TeiwahRequestOptions = Omit<
  RequestOptions,
  "retries" | "retryCodes"
>;

type MessageTarget = {
  /** Use an inbound webhook's chatId unchanged when replying. */
  chatId: string;
  /** Native WhatsApp message ID to quote. */
  quoteMessageId?: string;
};

type MediaSource =
  | { url: string; base64?: never }
  | { base64: string; url?: never };

type MediaMetadata = {
  /** Optional MIME override. */
  mimeType?: string;
};

export type SendTextRequest = MessageTarget & {
  text: string;
};

export type SendImageRequest = MessageTarget &
  MediaSource &
  MediaMetadata & {
    caption?: string;
  };

export type SendPttRequest = MessageTarget &
  MediaSource &
  MediaMetadata;

export type SendAudioRequest = MessageTarget &
  MediaSource &
  MediaMetadata & {
    filename?: string;
  };

export type SendVideoRequest = MessageTarget &
  MediaSource &
  MediaMetadata & {
    caption?: string;
    filename?: string;
  };

export type SendDocumentRequest = MessageTarget &
  MediaSource &
  MediaMetadata & {
    caption?: string;
    filename?: string;
  };

export type Contact = {
  /** Best-effort WhatsApp display name. */
  name: string | null;
  /** Bare phone number, or null when WhatsApp provides no mapping. */
  phoneNumber: string | null;
};

type InboundMessageBase = {
  /** Teiwah session that received the message. */
  sessionId: string;
  /** Native WhatsApp message ID for deduplication, quoting, and read receipts. */
  id: string;
  /** Conversation reply address; pass it back unchanged when replying. */
  chatId: string;
  /** Group sender address, or null in a one-to-one conversation. */
  participant: string | null;
  /** Sender metadata; never use it as the reply target. */
  contact: Contact;
  /** Unix timestamp in seconds. */
  timestamp: number;
  /** Unstable original Baileys payload. */
  raw?: Record<string, unknown>;
};

export type InboundTextMessage = InboundMessageBase & {
  /** Received message text. */
  text: string;
  media?: never;
};

export type InboundVoiceNote = {
  /** WhatsApp push-to-talk voice note. */
  type: "ptt";
  /** URL for downloading the decrypted voice note. */
  url: string;
  /** Detected MIME type, or null when unavailable. */
  mimeType: string | null;
  /**
   * Required inline base64 voice-note bytes for immediate transcription.
   */
  base64: string;
};

export type InboundStandardMedia = {
  /** Received media kind. */
  type: "image" | "audio" | "video" | "document";
  /** URL for downloading the decrypted media. */
  url: string;
  /** Detected MIME type, or null when unavailable. */
  mimeType: string | null;
  /** Original filename when available. */
  filename?: string | null;
  /** Media caption when present. */
  caption?: string | null;
};

export type InboundMediaMessage = InboundMessageBase & {
  /** Received image, audio, video, document, or voice note. */
  media: InboundVoiceNote | InboundStandardMedia;
  text?: never;
};

/**
 * Payload delivered by Teiwah to a session's inbound webhook.
 *
 * **Common:**
 *
 * - `sessionId` — Teiwah session that received the message.
 * - `id` — WhatsApp message ID for deduplication, quoting, and read receipts.
 * - `chatId` — Conversation address; reuse inbound *chatId* when replying.
 * - `participant` — Group sender address; `null` in one-to-one conversations.
 * - `contact` — Sender name and phone number; not a reply target.
 * - `timestamp` — Unix timestamp in seconds.
 *
 * **Text message:**
 *
 * - `text` — Received message text.
 *
 * **Media message:**
 *
 * - `media` — Image, audio, video, document, or PTT voice note.
 *
 * PTT always includes inline *base64* for immediate transcription. If Teiwah
 * cannot download and decrypt it, that PTT webhook is skipped rather than sent
 * without bytes. Other media is downloaded through its URL.
 *
 * ```ts
 * switch (true) {
 *   case "text" in message:
 *     // Handle text message.
 *     break;
 *   case "media" in message:
 *     // Handle media message.
 *     break;
 *   default:
 *     // Handle unsupported message.
 * }
 * ```
 */
export type InboundMessage = InboundTextMessage | InboundMediaMessage;

type SendMediaRequest = MessageTarget &
  MediaSource &
  MediaMetadata & {
    caption?: string;
    filename?: string;
  };

function assertNonEmpty(value: string, field: string): void {
  if (value.trim().length === 0) {
    throw new TypeError(`${field} must not be empty`);
  }
}

/**
 * Validate the current Teiwah session API key structure before sending.
 */
const TEIWAH_SESSION_API_KEY_PATTERN = /^zpka_[0-9a-f]{32}_[0-9a-f]{8}$/;

function assertValidSessionApiKey(value: string): void {
  assertNonEmpty(value, "apiKey");

  if (value !== value.trim()) {
    throw new TypeError("apiKey must not contain leading or trailing whitespace");
  }

  if (!TEIWAH_SESSION_API_KEY_PATTERN.test(value)) {
    throw new TypeError(
      "apiKey must be a valid Teiwah session API key",
    );
  }
}

function assertMediaSource(request: MediaSource): void {
  const hasUrl = "url" in request && request.url !== undefined;
  const hasBase64 = "base64" in request && request.base64 !== undefined;

  if (hasUrl === hasBase64) {
    throw new TypeError("Provide exactly one of url or base64");
  }

  if (hasUrl) {
    assertNonEmpty(request.url, "url");
    const url = new URL(request.url);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      throw new TypeError("url must use http or https");
    }
    return;
  }

  if (hasBase64) {
    assertNonEmpty(request.base64, "base64");
    return;
  }
}

function withoutRetries(options?: TeiwahRequestOptions): RequestOptions {
  return {
    ...options,
    retries: { strategy: "none" },
    retryCodes: [],
  };
}

function mediaMetadata(request: SendMediaRequest) {
  return {
    ...(request.caption !== undefined ? { caption: request.caption } : {}),
    ...(request.mimeType !== undefined ? { mimeType: request.mimeType } : {}),
    ...(request.filename !== undefined ? { filename: request.filename } : {}),
  };
}

/**
 * Server-side client for the Teiwah WhatsApp messaging API.
 *
 * @remarks Never expose a session API key in browser or mobile application code.
 */
export class Teiwah {
  readonly #client: GeneratedTeiwah;

  constructor(options: TeiwahOptions) {
    if (options?.apiKey === undefined) {
      throw new TypeError("apiKey is required");
    }

    if (
      typeof window !== "undefined" &&
      typeof window.document !== "undefined"
    ) {
      throw new Error("Teiwah API keys must only be used in server-side code");
    }

    const { apiKey: configuredApiKey, ...clientOptions } = options;
    const apiKey = typeof configuredApiKey === "string"
      ? configuredApiKey
      : async () => {
        const resolved = await configuredApiKey();
        assertValidSessionApiKey(resolved);
        return resolved;
      };
    if (typeof apiKey === "string") {
      assertValidSessionApiKey(apiKey);
    }
    this.#client = new GeneratedTeiwah({
      ...clientOptions,
      sessionApiKey: apiKey,
      retryConfig: { strategy: "none" },
    });
  }

  /**
   * Send a text or media message using the underlying API shape.
   * Prefer the type-specific helpers such as {@link sendText} and
   * {@link sendImage} when possible.
   *
   * **Required:**
   *
   * - `chatId` — Conversation address; reuse inbound *chatId*.
   * - `text` or `media` — Message content; choose exactly one.
   *
   * **Optional:**
   *
   * - `quoteMessageId` — Message ID to quote.
   *
   * When using media, provide exactly one of *media.url* or *media.base64*.
   *
   * **Returns:** `{ success: true, id }`
   *
   * ```ts
   * await teiwah.sendMessage({
   *   chatId: message.chatId,
   *   text: "Hello!",
   * });
   * ```
   */
  sendMessage(
    request: models.SendMessageRequest,
    options?: TeiwahRequestOptions,
  ): Promise<models.SendMessageResponse> {
    assertNonEmpty(request.chatId, "chatId");
    if (request.quoteMessageId !== undefined) {
      assertNonEmpty(request.quoteMessageId, "quoteMessageId");
    }
    if ("text" in request) {
      assertNonEmpty(request.text, "text");
    } else {
      assertMediaSource(request.media);
    }
    return this.#client.messages.sendMessage(request, withoutRetries(options));
  }

  /**
   * Send a text message.
   *
   * **Required:**
   *
   * - `chatId` — Conversation address; reuse inbound *chatId*.
   * - `text` — Text to send.
   *
   * **Optional:**
   *
   * - `quoteMessageId` — Message ID to quote.
   *
   * **Returns:** `{ success: true, id }`
   *
   * ```ts
   * await teiwah.sendText({
   *   chatId: message.chatId,
   *   text: "Hello!",
   * });
   * ```
   */
  sendText(
    request: SendTextRequest,
    options?: TeiwahRequestOptions,
  ): Promise<models.SendMessageResponse> {
    return this.sendMessage(request, options);
  }

  /**
   * Send an image from a public URL or base64 bytes.
   *
   * **Required:**
   *
   * - `chatId` — Conversation address; reuse inbound *chatId*.
   * - `url` or `base64` — Public image URL or base64 bytes; choose one.
   *
   * **Optional:**
   *
   * - `caption` — Image caption.
   * - `mimeType` — Override the inferred MIME type.
   * - `quoteMessageId` — Message ID to quote.
   *
   * Base64 input is limited to 16 MB decoded.
   *
   * **Returns:** `{ success: true, id }`
   *
   * ```ts
   * await teiwah.sendImage({
   *   chatId: message.chatId,
   *   url: "https://example.com/photo.jpg",
   * });
   * ```
   */
  sendImage(
    request: SendImageRequest,
    options?: TeiwahRequestOptions,
  ): Promise<models.SendMessageResponse> {
    return this.#sendMedia(MediaType.Image, request, options);
  }

  /**
   * Send a WhatsApp push-to-talk voice message.
   *
   * **Required:**
   *
   * - `chatId` — Conversation address; reuse inbound *chatId*.
   * - `url` or `base64` — Public audio URL or base64 bytes; choose one.
   *
   * **Optional:**
   *
   * - `mimeType` — Override the inferred MIME type.
   * - `quoteMessageId` — Message ID to quote.
   *
   * Base64 input is limited to 16 MB decoded.
   *
   * **Returns:** `{ success: true, id }`
   *
   * ```ts
   * await teiwah.sendPtt({
   *   chatId: message.chatId,
   *   url: "https://example.com/voice.ogg",
   * });
   * ```
   */
  sendPtt(
    request: SendPttRequest,
    options?: TeiwahRequestOptions,
  ): Promise<models.SendMessageResponse> {
    return this.#sendMedia(MediaType.Ptt, request, options);
  }

  /**
   * Send a generic audio attachment rather than a voice-note bubble.
   *
   * **Required:**
   *
   * - `chatId` — Conversation address; reuse inbound *chatId*.
   * - `url` or `base64` — Public audio URL or base64 bytes; choose one.
   *
   * **Optional:**
   *
   * - `mimeType` — Override the inferred MIME type.
   * - `filename` — Override the filename.
   * - `quoteMessageId` — Message ID to quote.
   *
   * Base64 input is limited to 16 MB decoded.
   *
   * **Returns:** `{ success: true, id }`
   *
   * ```ts
   * await teiwah.sendAudio({
   *   chatId: message.chatId,
   *   url: "https://example.com/audio.mp3",
   * });
   * ```
   */
  sendAudio(
    request: SendAudioRequest,
    options?: TeiwahRequestOptions,
  ): Promise<models.SendMessageResponse> {
    return this.#sendMedia(MediaType.Audio, request, options);
  }

  /**
   * Send a video from a public URL or base64 bytes.
   *
   * **Required:**
   *
   * - `chatId` — Conversation address; reuse inbound *chatId*.
   * - `url` or `base64` — Public video URL or base64 bytes; choose one.
   *
   * **Optional:**
   *
   * - `caption` — Video caption.
   * - `mimeType` — Override the inferred MIME type.
   * - `filename` — Override the filename.
   * - `quoteMessageId` — Message ID to quote.
   *
   * Base64 input is limited to 16 MB decoded.
   *
   * **Returns:** `{ success: true, id }`
   *
   * ```ts
   * await teiwah.sendVideo({
   *   chatId: message.chatId,
   *   url: "https://example.com/video.mp4",
   * });
   * ```
   */
  sendVideo(
    request: SendVideoRequest,
    options?: TeiwahRequestOptions,
  ): Promise<models.SendMessageResponse> {
    return this.#sendMedia(MediaType.Video, request, options);
  }

  /**
   * Send a document from a public URL or base64 bytes.
   *
   * **Required:**
   *
   * - `chatId` — Conversation address; reuse inbound *chatId*.
   * - `url` or `base64` — Public document URL or base64 bytes; choose one.
   *
   * **Optional:**
   *
   * - `caption` — Document caption.
   * - `mimeType` — Override the inferred MIME type.
   * - `filename` — Override the inferred filename.
   * - `quoteMessageId` — Message ID to quote.
   *
   * Base64 input is limited to 16 MB decoded.
   *
   * **Returns:** `{ success: true, id }`
   *
   * ```ts
   * await teiwah.sendDocument({
   *   chatId: message.chatId,
   *   url: "https://example.com/invoice.pdf",
   * });
   * ```
   */
  sendDocument(
    request: SendDocumentRequest,
    options?: TeiwahRequestOptions,
  ): Promise<models.SendMessageResponse> {
    return this.#sendMedia(MediaType.Document, request, options);
  }

  /**
   * Mark an inbound WhatsApp message as read.
   *
   * **Required:**
   *
   * - `messageId` — Use the inbound webhook *id*.
   *
   * **Returns:** `{ success: true }`
   *
   * ```ts
   * await teiwah.markMessageRead({ messageId: message.id });
   * ```
   */
  markMessageRead(
    request: models.ReadRequest,
    options?: TeiwahRequestOptions,
  ): Promise<models.SuccessResponse> {
    assertNonEmpty(request.messageId, "messageId");
    return this.#client.chatActions.markMessageRead(
      request,
      withoutRetries(options),
    );
  }

  /**
   * Show the typing indicator for a conversation.
   *
   * **Required:**
   *
   * - `chatId` — Conversation address; reuse inbound *chatId*.
   *
   * **Returns:** `{ success: true }`
   *
   * ```ts
   * await teiwah.showTyping({ chatId: message.chatId });
   * ```
   */
  showTyping(
    request: models.TypingRequest,
    options?: TeiwahRequestOptions,
  ): Promise<models.SuccessResponse> {
    assertNonEmpty(request.chatId, "chatId");
    return this.#client.chatActions.sendTypingIndicator(
      request,
      withoutRetries(options),
    );
  }

  /**
   * Download and decrypt media referenced by an inbound webhook.
   * Voice notes already include inline `base64`, so this is normally used for
   * images, audio, videos, and documents.
   *
   * **Required:**
   *
   * - `id` — Use the inbound media message's *id*.
   *
   * **Returns:** decrypted byte stream in `result`, plus response `headers`
   *
   * ```ts
   * const { result, headers } = await teiwah.downloadMedia({
   *   id: message.id,
   * });
   * ```
   */
  downloadMedia(
    request: operations.DownloadMediaRequest,
    options?: TeiwahRequestOptions,
  ): Promise<operations.DownloadMediaResponse> {
    assertNonEmpty(request.id, "id");
    return this.#client.media.downloadMedia(request, withoutRetries(options));
  }

  #sendMedia(
    type: models.MediaType,
    request: SendMediaRequest,
    options?: TeiwahRequestOptions,
  ): Promise<models.SendMessageResponse> {
    assertNonEmpty(request.chatId, "chatId");
    if (request.quoteMessageId !== undefined) {
      assertNonEmpty(request.quoteMessageId, "quoteMessageId");
    }
    assertMediaSource(request);

    const metadata = mediaMetadata(request);
    const media: models.OutboundMedia =
      "url" in request && request.url !== undefined
        ? { type, url: request.url, ...metadata }
        : { type, base64: request.base64, ...metadata };

    return this.#client.messages.sendMessage(
      {
        chatId: request.chatId,
        media,
        ...(request.quoteMessageId !== undefined
          ? { quoteMessageId: request.quoteMessageId }
          : {}),
      },
      withoutRetries(options),
    );
  }
}
