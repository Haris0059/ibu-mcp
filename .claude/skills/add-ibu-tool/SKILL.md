---
name: add-ibu-tool
description: Scaffold a new MCP tool for the ibu-mcp server. Use when the user asks to add, expose, or wrap a new IBU REST endpoint as an MCP tool.
---

# Adding a new IBU MCP tool

Follow these steps to add a tool. Match the patterns already in `src/tools/*.ts` rather than inventing new ones.

## 1. Pick the domain file

Existing files in `src/tools/`: `student.ts`, `grades.ts`, `attendance.ts`, `notifications.ts`, `finances.ts`, `activities.ts`. If the new tool fits one of these domains, append to its exported array. Only create a new file for a genuinely new domain.

## 2. Name the tool

Use the `ibu_<verb>_<noun>` convention (e.g. `ibu_get_transcript`, `ibu_mark_notification_read`). The name is what shows up to Claude — make it specific and discoverable.

## 3. Define the entry

Each tool is an object in the domain array with this shape:

```ts
{
  name: "ibu_get_something",
  description: "One sentence describing what it returns and when to use it.",
  inputSchema: {
    type: "object",
    properties: {
      // string params; use `enum` for fixed sets; add `description` for each
      academicYearId: { type: "string", description: "Academic year ID from ibu_get_academic_years." },
    },
    required: [],
  },
  handler: async (input: { academicYearId?: string }) => {
    const data = await ibufetch(`some/path${input.academicYearId ? `?yearId=${input.academicYearId}` : ""}`);
    return JSON.stringify(data, null, 2);
  },
}
```

The registrar in `src/index.ts` converts `inputSchema.properties` into zod — it currently handles string/enum only. If the new tool needs a non-string param, extend the registrar accordingly.

## 4. Register

If you added to an existing file, no registration change is needed (the array is already imported in `src/index.ts`). If you created a new file, import its array in `src/index.ts` and add a `registerTools(...)` call alongside the others.

## 5. Verify

Run `npm run build`. The TS config is `strict` — fix any errors before reporting done. Do not add `console.log` to stdout (it breaks the stdio MCP channel — use `console.error` if you need debug output).

## 6. Error handling

Let `ibufetch()` raise. It already maps 401/402/403/301/500 to user-facing messages. Don't wrap the call in try/catch unless you have a tool-specific recovery path.
