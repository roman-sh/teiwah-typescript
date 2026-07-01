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

  /** Send a generic text or media message. */
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

  /** Send a text message. */
  sendText(
    request: SendTextRequest,
    options?: TeiwahRequestOptions,
  ): Promise<models.SendMessageResponse> {
    return this.sendMessage(request, options);
  }

  /** Send an image from a public URL or base64 bytes. */
  sendImage(
    request: SendImageRequest,
    options?: TeiwahRequestOptions,
  ): Promise<models.SendMessageResponse> {
    return this.#sendMedia(MediaType.Image, request, options);
  }

  /** Send a WhatsApp push-to-talk voice message. */
  sendPtt(
    request: SendPttRequest,
    options?: TeiwahRequestOptions,
  ): Promise<models.SendMessageResponse> {
    return this.#sendMedia(MediaType.Ptt, request, options);
  }

  /** Send a generic audio attachment. */
  sendAudio(
    request: SendAudioRequest,
    options?: TeiwahRequestOptions,
  ): Promise<models.SendMessageResponse> {
    return this.#sendMedia(MediaType.Audio, request, options);
  }

  /** Send a video from a public URL or base64 bytes. */
  sendVideo(
    request: SendVideoRequest,
    options?: TeiwahRequestOptions,
  ): Promise<models.SendMessageResponse> {
    return this.#sendMedia(MediaType.Video, request, options);
  }

  /** Send a document from a public URL or base64 bytes. */
  sendDocument(
    request: SendDocumentRequest,
    options?: TeiwahRequestOptions,
  ): Promise<models.SendMessageResponse> {
    return this.#sendMedia(MediaType.Document, request, options);
  }

  /** Mark an inbound WhatsApp message as read. */
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

  /** Show the typing indicator for a conversation. */
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

  /** Download and decrypt media referenced by an inbound webhook. */
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
