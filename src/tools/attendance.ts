import { ibufetch } from "../client.js";

export const attendanceTools = [
  {
    name: "ibu_get_attendance",
    description: "Returns attendance summary for a given academic year and semester — present/absent counts per course.",
    inputSchema: {
      type: "object",
      properties: {
        academic_year: { type: "string", description: "e.g. 2024-2025" },
        semester: { type: "string", enum: ["1", "2"], description: "1 = Fall, 2 = Spring" },
      },
      required: ["academic_year", "semester"],
    },
    async handler(input: { academic_year: string; semester: string }) {
      const data = await ibufetch(`student/attendance/${input.academic_year}/${input.semester}`);
      return JSON.stringify(data, null, 2);
    },
  },
  {
    name: "ibu_get_attendance_details",
    description: "Returns per-class attendance log for a specific enrolled course.",
    inputSchema: {
      type: "object",
      properties: {
        student_course_id: { type: "string", description: "The student_course_id from ibu_get_attendance" },
      },
      required: ["student_course_id"],
    },
    async handler(input: { student_course_id: string }) {
      const data = await ibufetch(`student/attendance_details/${input.student_course_id}`);
      return JSON.stringify(data, null, 2);
    },
  },
] as const;
