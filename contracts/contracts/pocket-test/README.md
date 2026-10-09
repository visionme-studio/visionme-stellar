# Pocket-Test

A small test harness for exercising the Pocket contract on Stellar Soroban.

## Dependencies

```json
{
  "@stellar/stellar-sdk": "^14.3.3",
  "typescript": "^5.3.3",
  "ts-node": "^10.9.0",
  "@types/node": "^20.11.6"
}
```

## Scripts

- **`pocket-tester.js`** - Lightweight JavaScript entrypoint that invokes the Pocket contract through the Stellar SDK. Run with `node pocket-tester.js`.
- **`pocket-test-complete.ts`** - TypeScript harness with the full test flow. Run with `npm test` (or `ts-node pocket-test-complete.ts`).
- **`pocket-test-complete.ts.backup** - Archived copy of an earlier version of the TypeScript harness, kept for reference.

## Running

```bash
npm install
npm test
```

## Configuration

The harness reads contract IDs from `CONFIG` in `pocket-test.ts`. The current values are:

- `CONFIG.POCKET_CONTRACT_ID = "CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"

Adjust these to target a different deployment before running the tests.
