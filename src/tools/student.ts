import { loadAuth } from "../auth.js";
import { ibufetch } from "../client.js";

export const studentTools = [
  {
    name: "ibu_get_student_info",
    description: "Returns basic student profile info decoded from the JWT: name, student ID, email.",
    inputSchema: { type: "object", properties: {}, required: [] },
    async handler() {
      const { identity } = loadAuth();
      return JSON.stringify(identity, null, 2);
    },
  },
  {
    name: "ibu_get_student_image",
    description: "Returns the student's profile photo as base64. Falls back to the Google avatar from the JWT if no image is on file.",
    inputSchema: { type: "object", properties: {}, required: [] },
    async handler() {
      const { identity } = loadAuth();
      const data = await ibufetch(`student/get_student_image/${identity.id}`);
      return JSON.stringify(data, null, 2);
    },
  },
  {
    name: "ibu_get_active_sanctions",
    description: "Returns active disciplinary sanctions on the student's account, or an empty array if none.",
    inputSchema: { type: "object", properties: {}, required: [] },
    async handler() {
      const data = await ibufetch("student/get_active_sanctions");
      return JSON.stringify(data, null, 2);
    },
  },
  {
    name: "ibu_get_scholarship_overview",
    description: "Returns scholarship status: GPA, scholarship percentage, points vs required, failed courses.",
    inputSchema: { type: "object", properties: {}, required: [] },
    async handler() {
      const data = await ibufetch("student/get_scholarship_overview");
      return JSON.stringify(data, null, 2);
    },
  },
] as const;
