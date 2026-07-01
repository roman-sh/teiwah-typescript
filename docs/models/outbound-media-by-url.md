# OutboundMediaByUrl

## Example Usage

```typescript
import { OutboundMediaByUrl } from "teiwah/models";

let value: OutboundMediaByUrl = {
  type: "document",
  url: "https://example.com/photo.jpg",
  mimeType: "image/jpeg",
};
```

## Fields

| Field                                                                  | Type                                                                   | Required                                                               | Description                                                            | Example                                                                |
| ---------------------------------------------------------------------- | ---------------------------------------------------------------------- | ---------------------------------------------------------------------- | ---------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `type`                                                                 | [models.MediaType](../models/media-type.md)                            | :heavy_check_mark:                                                     | `ptt` is a WhatsApp voice note; `audio` is a generic audio attachment. |                                                                        |
| `url`                                                                  | *string*                                                               | :heavy_check_mark:                                                     | Publicly fetchable media URL.                                          | https://example.com/photo.jpg                                          |
| `caption`                                                              | *string*                                                               | :heavy_minus_sign:                                                     | Optional caption, primarily for image, video, and document messages.   |                                                                        |
| `mimeType`                                                             | *string*                                                               | :heavy_minus_sign:                                                     | Optional MIME override; normally inferred from the URL or content.     | image/jpeg                                                             |
| `filename`                                                             | *string*                                                               | :heavy_minus_sign:                                                     | Optional filename, primarily for document messages.                    |                                                                        |