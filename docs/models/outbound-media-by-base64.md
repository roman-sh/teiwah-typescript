# OutboundMediaByBase64

## Example Usage

```typescript
import { OutboundMediaByBase64 } from "teiwah/models";

let value: OutboundMediaByBase64 = {
  type: "document",
  base64: "<value>",
  mimeType: "audio/ogg",
};
```

## Fields

| Field                                                                                    | Type                                                                                     | Required                                                                                 | Description                                                                              | Example                                                                                  |
| ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `type`                                                                                   | [models.MediaType](../models/media-type.md)                                              | :heavy_check_mark:                                                                       | `ptt` is a WhatsApp voice note; `audio` is a generic audio attachment.                   |                                                                                          |
| `base64`                                                                                 | *string*                                                                                 | :heavy_check_mark:                                                                       | Plain base64-encoded bytes, limited to 16 MB after decoding. Data URIs are not accepted. |                                                                                          |
| `caption`                                                                                | *string*                                                                                 | :heavy_minus_sign:                                                                       | Optional caption, primarily for image, video, and document messages.                     |                                                                                          |
| `mimeType`                                                                               | *string*                                                                                 | :heavy_minus_sign:                                                                       | Optional MIME type used when staging the temporary media object.                         | audio/ogg                                                                                |
| `filename`                                                                               | *string*                                                                                 | :heavy_minus_sign:                                                                       | Optional filename, primarily for document messages.                                      |                                                                                          |