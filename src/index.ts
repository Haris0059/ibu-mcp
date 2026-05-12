import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { studentTools } from "./tools/student.js";
import { gradesTools } from "./tools/grades.js";

const server = new McpServer({
  name: "ibu-mcp",
  version: "0.1.0",
});

function registerTools(tools: typeof studentTools | typeof gradesTools) {
  for (const tool of tools) {
    const shape: Record<string, z.ZodTypeAny> = {};
    const props = (tool.inputSchema as { properties: Record<string, { type: string; enum?: string[]; description?: string }> }).properties;

    for (const [key, def] of Object.entries(props)) {
      let schema: z.ZodTypeAny;
      if (def.enum) {
        schema = z.enum(def.enum as [string, ...string[]]);
      } else {
        schema = z.string();
      }
      if (!(tool.inputSchema.required as readonly string[]).includes(key)) {
        schema = schema.optional();
      }
      if (def.description) schema = schema.describe(def.description);
      shape[key] = schema;
    }

    server.tool(tool.name, tool.description, shape, async (input) => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const text = await (tool as any).handler(input);
        return { content: [{ type: "text" as const, text }] };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return { content: [{ type: "text" as const, text: `Error: ${message}` }] };
      }
    });
  }
}

registerTools(studentTools);
registerTools(gradesTools);

const transport = new StdioServerTransport();
await server.connect(transport);
