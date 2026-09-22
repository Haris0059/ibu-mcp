# AGENTS.md

## Project

This is a local stdio MCP server built with `@modelcontextprotocol/sdk`. It exposes IBU student-portal data through tools. The entry point is `src/index.ts`; HTTP and authentication code is in `src/client.ts` and `src/auth.ts`; domain tools live in `src/tools/`.

## Commands

- `npm run dev` runs the TypeScript source with `tsx`.
- `npm run build` compiles the strict TypeScript project to `dist/`.
- `npm run test:mcp` builds the server and performs a credential-free MCP handshake/schema smoke test from an unrelated working directory.
- `npm start` runs the compiled server.

## MCP constraints

- Never write logs or banners to stdout. `StdioServerTransport` reserves stdout for JSON-RPC. Use stderr for diagnostics.
- Use the `ibu_<verb>_<noun>` naming convention.
- Add tools to the relevant array under `src/tools/`, then register that array in `src/index.ts` if it is a new domain.
- Tool schemas currently support string, number, integer, boolean, optional string enums, descriptions, and required fields.
- Add state-changing tools to `writeTools` in `src/index.ts`; add irreversible tools to `destructiveTools` as well.
- Let `ibufetch()` errors reach the common tool wrapper. The wrapper returns MCP errors with `isError: true`.

## Authentication

`IBU_ACCESS_TOKEN` and `IBU_USER_JWT` come from request headers in the student's browser session. The server loads `.env` relative to the package root, not the MCP client's working directory. Never print, commit, or place real credentials in examples.

## Verification

Run `npm run test:mcp` after changes. Live IBU API calls require the user's current credentials and should only be made when explicitly needed. A 401 generally means the browser-session JWT expired.
