# Supported runtimes

The Teiwah SDK is intended for server-side JavaScript and TypeScript runtimes
with the Web Fetch API and Web Streams API:

- Node.js 20 or newer
- Bun 1 or newer
- Deno with npm package support

The package provides both ESM and CommonJS builds.

Although the generated transport uses standard web APIs, Teiwah session API
keys must never be shipped to browsers or mobile clients. The public `Teiwah`
client rejects construction in browser environments.
