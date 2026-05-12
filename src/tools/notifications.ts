import { ibufetch } from "../client.js";

export const notificationTools = [
  {
    name: "ibu_get_notifications",
    description: "Returns recent notifications from IBU (announcements, messages from staff).",
    inputSchema: { type: "object", properties: {}, required: [] },
    async handler() {
      const data = await ibufetch("student/get_recent_notifications");
      return JSON.stringify(data, null, 2);
    },
  },
  {
    name: "ibu_get_unread_count",
    description: "Returns the number of unread notifications.",
    inputSchema: { type: "object", properties: {}, required: [] },
    async handler() {
      const data = await ibufetch("student/unread_notifications");
      return JSON.stringify(data, null, 2);
    },
  },
] as const;
