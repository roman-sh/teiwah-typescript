# OutboundMedia

Supply exactly one URL or base64 source.


## Supported Types

### `models.OutboundMediaByUrl`

```typescript
const value: models.OutboundMediaByUrl = {
  type: "document",
  url: "https://example.com/photo.jpg",
  mimeType: "image/jpeg",
};
```

### `models.OutboundMediaByBase64`

```typescript
const value: models.OutboundMediaByBase64 = {
  type: "document",
  base64: "<value>",
  mimeType: "audio/ogg",
};
```

