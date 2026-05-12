import { ibufetch } from "../client.js";
import { loadAuth } from "../auth.js";

export const financesTools = [
  {
    name: "ibu_get_installments",
    description: "Returns upcoming tuition installments — amount, due date, and payment status. Note: this endpoint is known to be unreliable on IBU's side; use ibu_get_installments_by_year as a fallback.",
    inputSchema: {
      type: "object",
      properties: {},
      required: [],
    },
    async handler(_input: Record<string, never>) {
      try {
        const data = await ibufetch("student/upcoming_installments");
        return JSON.stringify(data, null, 2);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        if (msg.includes("fetch failed") || msg.includes("ECONNRESET") || msg.includes("ECONNREFUSED")) {
          return "No upcoming installments found, or the endpoint is currently unavailable. Try ibu_get_installments_by_year with a specific academic year.";
        }
        throw err;
      }
    },
  },
  {
    name: "ibu_get_installments_by_year",
    description: "Returns all tuition installments for a specific academic year.",
    inputSchema: {
      type: "object",
      properties: {
        academic_year: { type: "string", description: "e.g. 2024-2025" },
      },
      required: ["academic_year"],
    },
    async handler(input: { academic_year: string }) {
      const data = await ibufetch(`student/get_student_installments_for_academic_year/${input.academic_year}`);
      return JSON.stringify(data, null, 2);
    },
  },
  {
    name: "ibu_get_annexes",
    description: "Returns contract annexes (tuition agreements) associated with the student's enrollment.",
    inputSchema: {
      type: "object",
      properties: {},
      required: [],
    },
    async handler(_input: Record<string, never>) {
      const data = await ibufetch("student/get_annexes");
      return JSON.stringify(data, null, 2);
    },
  },
  {
    name: "ibu_get_non_tuition_fees",
    description: "Returns non-tuition fees (e.g. library, lab, parking) for a given academic year.",
    inputSchema: {
      type: "object",
      properties: {
        academic_year: { type: "string", description: "e.g. 2024-2025" },
      },
      required: ["academic_year"],
    },
    async handler(input: { academic_year: string }) {
      const { identity } = loadAuth();
      try {
        const data = await ibufetch(`student/get_student_non_tuition_fees/${identity.id}/${input.academic_year}`);
        return JSON.stringify(data, null, 2);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        if (msg.includes("400")) {
          return `No non-tuition fees on record for academic year ${input.academic_year}.`;
        }
        throw err;
      }
    },
  },
] as const;
