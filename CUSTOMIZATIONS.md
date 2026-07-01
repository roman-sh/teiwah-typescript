# SDK customizations

Speakeasy generates the HTTP transport, schemas, errors, and low-level
operations. The following project-owned customizations are preserved across
regeneration:

- `src/teiwah.ts` provides the public top-level API and convenience methods.
- `src/index.ts` exports the public façade instead of generated namespaces.
- `tests/teiwah.test.mjs` verifies request mapping and retry safety.
- `tests/types.ts` verifies compile-time media-source exclusivity.
- `README.md` and `RUNTIMES.md` document the supported server-side API.

The public façade intentionally:

- accepts `apiKey` instead of the generated `sessionApiKey` name;
- exposes top-level methods such as `sendText()` and `sendPtt()`;
- forces automatic retries off to prevent duplicate WhatsApp sends;
- rejects browser usage so session API keys are not exposed;
- exports inbound webhook payload types unavailable in the free generated SDK.
