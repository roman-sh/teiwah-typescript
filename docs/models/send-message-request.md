# SendMessageRequest

Exactly one of the text and media request variants.


## Supported Types

### `models.SendTextMessageRequest`

```typescript
const value: models.SendTextMessageRequest = {
  chatId: "972501234567",
  text: "<value>",
  quoteMessageId: "3EB0C767D7A0D9D8F8A1",
};
```

### `models.SendMediaMessageRequest`

```typescript
const value: models.SendMediaMessageRequest = {
  chatId: "972501234567",
  media: {
    type: "document",
    base64: "<value>",
    mimeType: "audio/ogg",
  },
  quoteMessageId: "3EB0C767D7A0D9D8F8A1",
};
```

