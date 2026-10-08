# Monorepo

A Turbo-orchestrated monorepo containing the `web`, `backend`, `frontend-flow-test` apps and the `contracts` package.

## Getting Started

```bash
npm install
```

## Scripts

The root ``.package.json`` exposes the following scripts. Each one delegates to Turbo, which fans the command out to every workspace that declares a matching script.

- `npm run build` — ``turbo run build``
- `npm test` — ``turbo run test``. Runs the `test` script in every workspace that defines one (currently `web`, `backend`, and `contracts`). Exits with a non-zero code if any workspace test fails.
- `npm run lint` — ``turbo run lint``
- `npm run dev` — ``turbo run dev``

### Running tests

```bash
npm test
```

To run tests for a single workspace:

```bash
npm test --workspace=apps/backend
```
