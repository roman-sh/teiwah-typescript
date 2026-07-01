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
  name: string | null;
  phoneNumber: string | null;
};

type InboundMessageBase = {
  sessionId: string;
  id: string;
  chatId: string;
  participant: string | null;
  contact: Contact;
  timestamp: number;
  /** Unstable original Baileys payload. */
  raw?: Record<string, unknown>;
};

export type InboundTextMessage = InboundMessageBase & {
  text: string;
  media?: never;
};

export type InboundVoiceNote = {
  type: "ptt";
  url: string;
  mimeType: string | null;
  base64?: string;
};

export type InboundStandardMedia = {
  type: "image" | "audio" | "video" | "document";
  url: string;
  mimeType: string | null;
  filename?: string | null;
  caption?: string | null;
};

export type InboundMediaMessage = InboundMessageBase & {
  media: InboundVoiceNote | InboundStandardMedia;
  text?: never;
};

/** Payload delivered by Teiwah to a session's inbound webhook. */
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
        assertNonEmpty(resolved, "apiKey");
        return resolved;
      };
    if (typeof apiKey === "string") {
      assertNonEmpty(apiKey, "apiKey");
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
   * @param request - The outbound message.
   * @param request.chatId - Conversation address. When replying, use the
   * inbound webhook `chatId` unchanged.
   * @param request.text - Text to send. Provide exactly one of `text` or
   * `media`.
   * @param request.media - Media to send. Provide exactly one of `text` or
   * `media`; media itself accepts exactly one of `url` or `base64`.
   * @param request.quoteMessageId - Optional inbound or previously sent
   * message ID to quote.
   * @returns `{ success: true, id }`, where `id` is the sent WhatsApp message
   * ID.
   *
   * @example
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
   * @param request - The text message.
   * @param request.chatId - Conversation address. When replying, use the
   * inbound webhook `chatId` unchanged.
   * @param request.text - Text to send.
   * @param request.quoteMessageId - Optional message ID to quote.
   * @returns `{ success: true, id }`, where `id` is the sent WhatsApp message
   * ID.
   *
   * @example
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
   * @param request - The image message.
   * @param request.chatId - Conversation address. When replying, use the
   * inbound webhook `chatId` unchanged.
   * @param request.url - Public HTTP(S) image URL. Provide exactly one of
   * `url` or `base64`.
   * @param request.base64 - Base64-encoded image, up to 16 MB decoded. Provide
   * exactly one of `url` or `base64`.
   * @param request.caption - Optional image caption.
   * @param request.mimeType - Optional MIME type override; Teiwah derives it
   * when omitted.
   * @param request.quoteMessageId - Optional message ID to quote.
   * @returns `{ success: true, id }`, where `id` is the sent WhatsApp message
   * ID.
   *
   * @example
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
   * @param request - The voice message.
   * @param request.chatId - Conversation address. When replying, use the
   * inbound webhook `chatId` unchanged.
   * @param request.url - Public HTTP(S) audio URL. Provide exactly one of
   * `url` or `base64`.
   * @param request.base64 - Base64-encoded audio, up to 16 MB decoded. Provide
   * exactly one of `url` or `base64`.
   * @param request.mimeType - Optional MIME type override; Teiwah derives it
   * when omitted.
   * @param request.quoteMessageId - Optional message ID to quote.
   * @returns `{ success: true, id }`, where `id` is the sent WhatsApp message
   * ID.
   *
   * @example
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
   * @param request - The audio message.
   * @param request.chatId - Conversation address. When replying, use the
   * inbound webhook `chatId` unchanged.
   * @param request.url - Public HTTP(S) audio URL. Provide exactly one of
   * `url` or `base64`.
   * @param request.base64 - Base64-encoded audio, up to 16 MB decoded. Provide
   * exactly one of `url` or `base64`.
   * @param request.mimeType - Optional MIME type override; Teiwah derives it
   * when omitted.
   * @param request.filename - Optional filename override.
   * @param request.quoteMessageId - Optional message ID to quote.
   * @returns `{ success: true, id }`, where `id` is the sent WhatsApp message
   * ID.
   *
   * @example
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
   * @param request - The video message.
   * @param request.chatId - Conversation address. When replying, use the
   * inbound webhook `chatId` unchanged.
   * @param request.url - Public HTTP(S) video URL. Provide exactly one of
   * `url` or `base64`.
   * @param request.base64 - Base64-encoded video, up to 16 MB decoded. Provide
   * exactly one of `url` or `base64`.
   * @param request.caption - Optional video caption.
   * @param request.mimeType - Optional MIME type override; Teiwah derives it
   * when omitted.
   * @param request.filename - Optional filename override.
   * @param request.quoteMessageId - Optional message ID to quote.
   * @returns `{ success: true, id }`, where `id` is the sent WhatsApp message
   * ID.
   *
   * @example
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
   * @param request - The document message.
   * @param request.chatId - Conversation address. When replying, use the
   * inbound webhook `chatId` unchanged.
   * @param request.url - Public HTTP(S) document URL. Provide exactly one of
   * `url` or `base64`.
   * @param request.base64 - Base64-encoded document, up to 16 MB decoded.
   * Provide exactly one of `url` or `base64`.
   * @param request.caption - Optional document caption.
   * @param request.mimeType - Optional MIME type override; Teiwah derives it
   * when omitted.
   * @param request.filename - Optional filename override; Teiwah derives it
   * when omitted.
   * @param request.quoteMessageId - Optional message ID to quote.
   * @returns `{ success: true, id }`, where `id` is the sent WhatsApp message
   * ID.
   *
   * @example
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
   * @param request - The message to mark as read.
   * @param request.messageId - The inbound webhook `id`.
   * @returns `{ success: true }`.
   *
   * @example
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
   * @param request - The target conversation.
   * @param request.chatId - Conversation address. Use the inbound webhook
   * `chatId` unchanged.
   * @returns `{ success: true }`.
   *
   * @example
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
   * @param request - The inbound media to download.
   * @param request.id - Native ID from the inbound media message.
   * @returns The decrypted byte stream in `result`, plus response `headers`.
   *
   * @example
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
