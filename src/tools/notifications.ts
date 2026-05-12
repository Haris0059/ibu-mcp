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
  {
    name: "ibu_mark_notification_read",
    description: "Marks a specific notification as read by its ID. Use this after fetching notifications to clear them.",
    inputSchema: {
      type: "object",
      properties: {
        notification_id: {
          type: "number",
          description: "The numeric ID of the notification to mark as read.",
        },
      },
      required: ["notification_id"],
    },
    async handler(args: { notification_id: number }) {
      const data = await ibufetch(`student/read_notification/${args.notification_id}`);
      return JSON.stringify(data, null, 2);
    },
  },
  {
    name: "ibu_mark_all_notifications_read",
    description: "Marks all recent notifications as read. Use this to clear all notifications at once.",
    inputSchema: { type: "object", properties: {}, required: [] },
    async handler() {
      const params = new URLSearchParams({
        draw: "1",
        start: "0",
        length: "5000",
        "search[value]": "",
        "search[regex]": "false",
      });
      const data = await ibufetch(`student/get_notifications?${params}`) as { data: Array<{ id: string; status: string }> };
      const unread = (data.data ?? []).filter((n) => n.status === "DELIVERED");
      await Promise.all(unread.map((n) => ibufetch(`student/read_notification/${n.id}`)));
      return `Marked ${unread.length} notification(s) as read.`;
    },
  },
] as const;
