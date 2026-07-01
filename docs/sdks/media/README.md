# Media

## Overview

Download media referenced by inbound webhooks.

### Available Operations

* [downloadMedia](#downloadmedia) - Download inbound media

## downloadMedia

Downloads and decrypts media referenced by an inbound webhook. Use the
media message's native `id`, which is also the final path segment in the
webhook's `media.url`.

The response Content-Type is the original media type when available and
Content-Disposition contains the original or derived filename.


### Example Usage

<!-- UsageSnippet language="typescript" operationID="downloadMedia" method="get" path="/media/{id}" -->
```typescript
import { Teiwah } from "teiwah";

const teiwah = new Teiwah({
  sessionApiKey: process.env["TEIWAH_SESSION_API_KEY"] ?? "",
});

async function run() {
  const result = await teiwah.media.downloadMedia({
    id: "3EB0C767D7A0D9D8F8A1",
  });

  console.log(result);
}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { TeiwahCore } from "teiwah/core.js";
import { mediaDownloadMedia } from "teiwah/funcs/media-download-media.js";

// Use `TeiwahCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const teiwah = new TeiwahCore({
  sessionApiKey: process.env["TEIWAH_SESSION_API_KEY"] ?? "",
});

async function run() {
  const res = await mediaDownloadMedia(teiwah, {
    id: "3EB0C767D7A0D9D8F8A1",
  });
  if (res.ok) {
    const { value: result } = res;
    console.log(result);
  } else {
    console.log("mediaDownloadMedia failed:", res.error);
  }
}

run();
```

### Parameters

| Parameter                                                                                                                                                                      | Type                                                                                                                                                                           | Required                                                                                                                                                                       | Description                                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `request`                                                                                                                                                                      | [operations.DownloadMediaRequest](../../models/operations/download-media-request.md)                                                                                           | :heavy_check_mark:                                                                                                                                                             | The request object to use for the request.                                                                                                                                     |
| `options`                                                                                                                                                                      | RequestOptions                                                                                                                                                                 | :heavy_minus_sign:                                                                                                                                                             | Used to set various options for making HTTP requests.                                                                                                                          |
| `options.fetchOptions`                                                                                                                                                         | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)                                                                                        | :heavy_minus_sign:                                                                                                                                                             | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed. |
| `options.retries`                                                                                                                                                              | [RetryConfig](../../lib/utils/retryconfig.md)                                                                                                                                  | :heavy_minus_sign:                                                                                                                                                             | Enables retrying HTTP requests under certain failure conditions.                                                                                                               |

### Response

**Promise\<[operations.DownloadMediaResponse](../../models/operations/download-media-response.md)\>**

### Errors

| Error Type                | Status Code               | Content Type              |
| ------------------------- | ------------------------- | ------------------------- |
| errors.ErrorResponse      | 401, 404                  | application/json          |
| errors.ErrorResponse      | 503, 5XX                  | application/json          |
| errors.TeiwahDefaultError | 4XX                       | \*/\*                     |