import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const mockClaims = {
  id: 42,
  student_id: "TEST-42",
  first_name: "Test",
  last_name: "Student",
  email: "student@example.test",
};
const mockPayload = Buffer.from(JSON.stringify({ data: mockClaims })).toString("base64url");
process.env.IBU_ACCESS_TOKEN = "test-access-token";
process.env.IBU_USER_JWT = `e30.${mockPayload}.test-signature`;
const { loadAuth } = await import(resolve(projectRoot, "dist/auth.js"));
assert.deepEqual(loadAuth().identity, mockClaims, "nested JWT identity claims must be decoded");
delete process.env.IBU_ACCESS_TOKEN;
delete process.env.IBU_USER_JWT;

const unrelatedCwd = await mkdtemp(resolve(tmpdir(), "ibu-mcp-smoke-"));
const transport = new StdioClientTransport({
  command: process.execPath,
  args: [resolve(projectRoot, "dist/index.js")],
  cwd: unrelatedCwd,
  stderr: "pipe",
});
const client = new Client({ name: "ibu-mcp-smoke-test", version: "1.0.0" });

try {
  await client.connect(transport);
  assert.match(client.getInstructions() ?? "", /private IBU portal data/);
  const { tools } = await client.listTools();

  assert.equal(tools.length, 30, "expected all IBU tools to be registered");
  assert(tools.some(({ name }) => name === "ibu_get_student_info"));

  const markRead = tools.find(({ name }) => name === "ibu_mark_notification_read");
  assert.equal(
    markRead?.inputSchema.properties?.notification_id?.type,
    "number",
    "numeric tool inputs must remain numeric in the published MCP schema",
  );

  const deleteActivity = tools.find(({ name }) => name === "ibu_delete_student_activity");
  assert.equal(deleteActivity?.annotations?.readOnlyHint, false);
  assert.equal(deleteActivity?.annotations?.destructiveHint, true);

  const invalidCall = await client.callTool({
    name: "ibu_get_grades",
    arguments: {},
  });
  assert.equal(invalidCall.isError, true, "invalid tool input should return an MCP error");

  console.log(`MCP handshake passed; discovered ${tools.length} tools.`);
} finally {
  await client.close();
  await rm(unrelatedCwd, { recursive: true, force: true });
}
