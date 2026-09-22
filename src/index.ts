import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { studentTools } from "./tools/student.js";
import { gradesTools } from "./tools/grades.js";
import { attendanceTools } from "./tools/attendance.js";
import { notificationTools } from "./tools/notifications.js";
import { financesTools } from "./tools/finances.js";
import { activitiesTools } from "./tools/activities.js";

const server = new McpServer({
  name: "ibu-mcp",
  version: "0.1.5",
}, {
  instructions: "Access the authenticated student's private IBU portal data. Use ibu_get_academic_years when the requested year is unclear. Academic years use YYYY-YYYY and semesters use FALL or SPRING. Treat returned data as private. Ask for confirmation immediately before calling tools that mark notifications as read or delete an activity. Never invent missing academic or financial data; surface tool errors to the user.",
});

const writeTools = new Set([
  "ibu_delete_student_activity",
  "ibu_mark_notification_read",
  "ibu_mark_all_notifications_read",
]);

const destructiveTools = new Set(["ibu_delete_student_activity"]);

function registerTools(tools: typeof studentTools | typeof gradesTools | typeof attendanceTools | typeof notificationTools | typeof financesTools | typeof activitiesTools) {
  for (const tool of tools) {
    const shape: Record<string, z.ZodTypeAny> = {};
    const props = (tool.inputSchema as {
      properties: Record<string, {
        type: "string" | "number" | "integer" | "boolean";
        enum?: string[];
        description?: string;
      }>;
    }).properties;

    for (const [key, def] of Object.entries(props)) {
      let schema: z.ZodTypeAny;
      if (def.enum) {
        schema = z.enum(def.enum as [string, ...string[]]);
      } else {
        switch (def.type) {
          case "number":
            schema = z.number();
            break;
          case "integer":
            schema = z.number().int();
            break;
          case "boolean":
            schema = z.boolean();
            break;
          default:
            schema = z.string();
        }
      }
      if (!(tool.inputSchema.required as readonly string[]).includes(key)) {
        schema = schema.optional();
      }
      if (def.description) schema = schema.describe(def.description);
      shape[key] = schema;
    }

    const isWrite = writeTools.has(tool.name);

    server.registerTool(tool.name, {
      description: tool.description,
      inputSchema: shape,
      annotations: {
        readOnlyHint: !isWrite,
        destructiveHint: destructiveTools.has(tool.name),
        idempotentHint: tool.name !== "ibu_delete_student_activity",
        openWorldHint: true,
      },
    }, async (input) => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const text = await (tool as any).handler(input);
        return { content: [{ type: "text" as const, text }] };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return {
          content: [{ type: "text" as const, text: `Error: ${message}` }],
          isError: true,
        };
      }
    });
  }
}

registerTools(studentTools);
registerTools(gradesTools);
registerTools(attendanceTools);
registerTools(notificationTools);
registerTools(financesTools);
registerTools(activitiesTools);

const transport = new StdioServerTransport();
await server.connect(transport);
