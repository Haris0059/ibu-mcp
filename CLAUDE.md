# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A stdio MCP server (`@modelcontextprotocol/sdk`) exposing IBU student-portal data as tools. Entry: `src/index.ts`. Tool modules live in `src/tools/*.ts`. HTTP client and auth in `src/client.ts` and `src/auth.ts`.

## Commands

- `npm run dev` — run via `tsx` (no build step)
- `npm run build` — `tsc` to `dist/`
- `npm run test:mcp` — build and run a credential-free MCP handshake/schema test
- `npm start` — run built server from `dist/index.js`

There is no general unit-test framework and no linter configured.

## Stdio MCP — do not write to stdout

The server uses `StdioServerTransport`. **stdout is the MCP protocol channel.** Any stray `console.log`, `process.stdout.write`, or printed banner will corrupt the JSON-RPC stream and break the client. Use `console.error` (stderr) for all logging/debug output.

## Tool naming and registration

- All MCP tool names use the `ibu_<verb>_<noun>` prefix (e.g., `ibu_get_grades`, `ibu_mark_notification_read`).
- Tools are defined as entries in a domain-grouped array in `src/tools/<domain>.ts` with `name`, `description`, `inputSchema` (JSON Schema with `properties`/`required`), and `handler`.
- Register the array in `src/index.ts` via `registerTools(...)`. The registrar converts the JSON Schema shape into zod and wires MCP error handling. Supported property types are string, number, integer, and boolean, with optional string `enum` and `description` values.
- Add state-changing tools to `writeTools` in `src/index.ts`, and irreversible tools to `destructiveTools`, so MCP clients such as Codex receive accurate tool annotations.

## Error handling convention

`src/client.ts` maps known HTTP statuses to user-facing messages (401 = expired JWT, 402 = unpaid fees, 403 = locked account, 301 = mandatory survey, 500 = upstream IBU issue). When adding tools, let `ibufetch()` raise — don't swallow these.

**Gotcha:** Sporadic 5xx responses from `rest.ibu.edu.ba` are most commonly caused by **unpaid financials on the account being queried**, not by a code bug. Don't add retries or "fix" 5xx handling without checking that first.

## Auth tokens

`IBU_ACCESS_TOKEN` and `IBU_USER_JWT` come from the user's browser session (DevTools → Network on `rest.ibu.edu.ba`). `.env` is resolved relative to the package root because MCP clients may use an unrelated working directory. The JWT expires when the session ends — a 401 means the user needs to re-copy the header, not a code change.

## Verify before "done"

After edits, run `npm run test:mcp` and confirm a clean compile and handshake. The TS config is `strict` — type errors are not warnings.
