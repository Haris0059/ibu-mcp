import { ibufetch } from "../client.js";

export const gradesTools = [
  {
    name: "ibu_get_grades",
    description: "Returns grades for a specific academic year and semester.",
    inputSchema: {
      type: "object",
      properties: {
        academic_year: { type: "string", description: "e.g. 2024-2025" },
        semester: { type: "string", enum: ["FALL", "SPRING"], description: "FALL or SPRING" },
        course_status: {
          type: "string",
          enum: ["ACTIVE_CURRICULUM", "ELECTIVE", "ALL"],
          description: "Filter by course type. Defaults to ALL.",
        },
      },
      required: ["academic_year", "semester"],
    },
    async handler(input: { academic_year: string; semester: string; course_status?: string }) {
      const qs = input.course_status ? `?course_status=${input.course_status}` : "";
      const data = await ibufetch(`student/get_grades/${input.academic_year}/${input.semester}${qs}`);
      return JSON.stringify(data, null, 2);
    },
  },
  {
    name: "ibu_get_recent_grades",
    description: "Returns grades from the most recent semester.",
    inputSchema: { type: "object", properties: {}, required: [] },
    async handler() {
      const data = await ibufetch("student/recent_grades");
      return JSON.stringify(data, null, 2);
    },
  },
  {
    name: "ibu_get_recent_exams",
    description: "Returns recently completed exam results.",
    inputSchema: { type: "object", properties: {}, required: [] },
    async handler() {
      const data = await ibufetch("student/recent_exams");
      return JSON.stringify(data, null, 2);
    },
  },
  {
    name: "ibu_get_upcoming_exams",
    description: "Returns exams the student is registered for that have not yet taken place.",
    inputSchema: { type: "object", properties: {}, required: [] },
    async handler() {
      const data = await ibufetch("student/upcoming_exams");
      return JSON.stringify(data, null, 2);
    },
  },
  {
    name: "ibu_get_exam_dates",
    description: "Returns exam calendar events between two dates.",
    inputSchema: {
      type: "object",
      properties: {
        start: { type: "string", description: "Start date in YYYY-MM-DD format" },
        end: { type: "string", description: "End date in YYYY-MM-DD format" },
      },
      required: ["start", "end"],
    },
    async handler(input: { start: string; end: string }) {
      const data = await ibufetch(`student/get_exam_dates?start=${input.start}&end=${input.end}`);
      return JSON.stringify(data, null, 2);
    },
  },
  {
    name: "ibu_get_curriculum",
    description: "Returns the student's full curriculum: all courses by semester, their ECTS, type, and grades.",
    inputSchema: { type: "object", properties: {}, required: [] },
    async handler() {
      const data = await ibufetch("student/get_curriculum_courses");
      return JSON.stringify(data, null, 2);
    },
  },
  {
    name: "ibu_get_academic_years",
    description: "Returns the list of academic years the student has been enrolled in.",
    inputSchema: { type: "object", properties: {}, required: [] },
    async handler() {
      const data = await ibufetch("student/get_distinct_academic_years");
      return JSON.stringify(data, null, 2);
    },
  },
] as const;
