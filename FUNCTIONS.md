# Generated standalone functions

Speakeasy generates low-level standalone functions for its internal transport.
They are not Teiwah's recommended public interface.

Use the top-level `Teiwah` client documented in [README.md](./README.md). It
provides safer authentication naming, typed message helpers, inbound webhook
types, and retry protection.

Never call either interface from browser code because doing so exposes the
session API key.
