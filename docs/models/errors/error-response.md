# ErrorResponse

Gateway errors may contain only `message`; Nest errors generally also
contain `statusCode` and `error`. Validation errors may return an array
of messages.


## Example Usage

```typescript
import { ErrorResponse } from "teiwah/models/errors";

// No examples available for this model
```

## Fields

| Field                  | Type                   | Required               | Description            |
| ---------------------- | ---------------------- | ---------------------- | ---------------------- |
| `statusCode`           | *number*               | :heavy_minus_sign:     | N/A                    |
| `message`              | *models.Message*       | :heavy_check_mark:     | N/A                    |
| `error`                | *string*               | :heavy_minus_sign:     | N/A                    |
| `additionalProperties` | Record<string, *any*>  | :heavy_minus_sign:     | N/A                    |