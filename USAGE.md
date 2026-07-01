# Usage

```ts
import { Teiwah } from "teiwah";

const teiwah = new Teiwah({
  apiKey: process.env.TEIWAH_API_KEY!,
});

await teiwah.sendText({
  chatId: "972501234567@s.whatsapp.net",
  text: "Hello from Teiwah",
});
```

See [README.md](./README.md) for all message types, webhook payload types,
chat actions, media downloads, and error handling.
