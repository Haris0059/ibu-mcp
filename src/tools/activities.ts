import { ibufetch } from "../client.js";

const DATATABLE_COLUMNS = [
  "actions", "name", "category", "description", "work_hours",
  "max_points", "employee", "closes_at", "student_activity_status",
  "reject_reason", "academic_year", "semester",
];

function buildActiveActivitiesParams(opts: {
  status?: string;
  category?: string;
  academic_year?: string;
  semester?: string;
}): string {
  const p = new URLSearchParams();
  p.set("status", opts.status ?? "null");
  p.set("category", opts.category ?? "null");
  p.set("academic_year", opts.academic_year ?? "");
  p.set("semester", opts.semester ?? "null");
  p.set("draw", "1");

  DATATABLE_COLUMNS.forEach((col, i) => {
    p.set(`columns[${i}][data]`, col);
    p.set(`columns[${i}][name]`, col);
    p.set(`columns[${i}][searchable]`, "true");
    p.set(`columns[${i}][orderable]`, col !== "actions" ? "true" : "false");
    p.set(`columns[${i}][search][value]`, "");
    p.set(`columns[${i}][search][regex]`, "false");
  });

  p.set("order[0][column]", "2");
  p.set("order[0][dir]", "desc");
  p.set("start", "0");
  p.set("length", "100");
  p.set("search[value]", "");
  p.set("search[regex]", "false");

  return p.toString();
}

export const activitiesTools = [
  {
    name: "ibu_get_scholarship_categories",
    description: "Returns all scholarship activity categories with point values.",
    inputSchema: {
      type: "object",
      properties: {},
      required: [],
    },
    async handler(_input: Record<string, never>) {
      const data = await ibufetch("scholarship/get_categories");
      return JSON.stringify(data, null, 2);
    },
  },
  {
    name: "ibu_get_student_activities",
    description: "Returns active/available extracurricular activities the student can apply for or has applied to. Optionally filter by status, category, academic_year, or semester.",
    inputSchema: {
      type: "object",
      properties: {
        status: { type: "string", description: "Activity status filter, e.g. ACTIVE, PENDING — omit for all" },
        category: { type: "string", description: "Category filter — omit for all" },
        academic_year: { type: "string", description: "e.g. 2024-2025 — omit for all years" },
        semester: { type: "string", enum: ["FALL", "SPRING"], description: "FALL or SPRING — omit for all" },
      },
      required: [],
    },
    async handler(input: { status?: string; category?: string; academic_year?: string; semester?: string }) {
      const qs = buildActiveActivitiesParams(input);
      const data = await ibufetch(`student/get_active_activities?${qs}`);
      return JSON.stringify(data, null, 2);
    },
  },
  {
    name: "ibu_get_activity_overview",
    description: "Returns a summary of the student's activity points — applied, pending, realized — for a given academic year and optional semester.",
    inputSchema: {
      type: "object",
      properties: {
        academic_year: { type: "string", description: "e.g. 2024-2025 — omit for current year" },
        semester: { type: "string", enum: ["FALL", "SPRING"], description: "FALL or SPRING — omit for full year" },
      },
      required: [],
    },
    async handler(input: { academic_year?: string; semester?: string }) {
      const p = new URLSearchParams();
      p.set("academic_year", input.academic_year ?? "");
      p.set("semester", input.semester ?? "null");
      const data = await ibufetch(`student/get_activity_overview?${p.toString()}`);
      return JSON.stringify(data, null, 2);
    },
  },
] as const;
