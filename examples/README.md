# teiwah Examples

This directory contains example scripts demonstrating how to use the teiwah SDK.

## Prerequisites

- Node.js 20 or newer
- npm

## Setup

1. Copy `.env.template` to `.env`:
   ```bash
   cp .env.template .env
   ```

2. Set `TEIWAH_API_KEY` to the key for a connected Teiwah session.

## Running the Examples

To run an example file from the examples directory:

```bash
npm run build && npx tsx messagesSendMessage.example.ts
```

## Creating new examples

Duplicate an existing example file, they won't be overwritten by the generation process.

