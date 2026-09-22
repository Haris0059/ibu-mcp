# ibu-mcp

A [Model Context Protocol](https://modelcontextprotocol.io) (MCP) server for the **International Burch University (IBU)** student information system at [mine.ibu.edu.ba](https://mine.ibu.edu.ba). Connects IBU's student portal to Codex, the ChatGPT desktop app, Claude Code, Gemini CLI, or another MCP client, so you can query your grades, attendance, exam schedule, tuition installments, scholarship points, and notifications in natural language.

Built for IBU students who want to skip the click-around and just ask: *"what's my GPA?"*, *"when's my next exam?"*, *"what do I owe this semester?"*.

## Requirements

- Node.js 18+
- An MCP client: Codex/ChatGPT desktop, Claude Code, or Gemini CLI
- An active IBU student account

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure credentials

```bash
cp .env.example .env
```

Open `.env` and set:

```env
IBU_ACCESS_TOKEN=<your sis-access-token>
IBU_USER_JWT=<your sis-user-token>
```

**How to get these tokens:**

1. Log in to [mine.ibu.edu.ba](https://mine.ibu.edu.ba)
2. Open DevTools → Network tab
3. Reload the page and click any API request going to `rest.ibu.edu.ba`
4. Copy the `sis-access-token` and `sis-user-token` request headers into `.env`

Tokens expire when your session ends — re-copy them when you get auth errors.

### 3. Build

```bash
npm run build
```

This outputs `dist/index.js`.

### 4. Register with Codex or ChatGPT desktop

Codex CLI, the Codex IDE extension, and the ChatGPT desktop app share MCP configuration on the same Codex host. Register the compiled server with the CLI:

```bash
codex mcp add ibu-mcp -- node /absolute/path/to/ibu-mcp/dist/index.js
```

For development without rebuilding:

```bash
codex mcp add ibu-mcp -- npx tsx /absolute/path/to/ibu-mcp/src/index.ts
```

Verify the registration:

```bash
codex mcp list
```

Restart Codex after adding the server. In Codex or ChatGPT desktop, use `/mcp` to check that `ibu-mcp` is connected.

You can configure it manually in `~/.codex/config.toml` instead:

```toml
[mcp_servers.ibu-mcp]
command = "node"
args = ["/absolute/path/to/ibu-mcp/dist/index.js"]
```

In the ChatGPT desktop UI, you can alternatively open **Settings → MCP servers → Add server**, choose **STDIO**, and enter the same Node command. See the [official OpenAI MCP documentation](https://learn.chatgpt.com/docs/extend/mcp).

> [!NOTE]
> ChatGPT on the web does not read local Codex configuration. This local stdio server works with Codex clients and ChatGPT desktop; web-hosted ChatGPT requires a remote MCP server packaged as a plugin.

### 5. Register with Claude Code

**macOS:**

```bash
claude mcp add ibu-mcp node /Users/$(whoami)/Projects/ibu-mcp/dist/index.js
```

**Linux:**

```bash
claude mcp add ibu-mcp node /home/$(whoami)/Projects/ibu-mcp/dist/index.js
```

Or use an absolute path directly:

```bash
claude mcp add ibu-mcp node /absolute/path/to/ibu-mcp/dist/index.js
```

**Dev mode** (no build step, runs TypeScript directly):

```bash
claude mcp add ibu-mcp npx tsx /absolute/path/to/ibu-mcp/src/index.ts
```

Verify it's registered:

```bash
claude mcp list
```

### 6. Register with Gemini CLI

Add the server to `~/.gemini/settings.json` (create it if it doesn't exist):

```json
{
  "mcpServers": {
    "ibu-mcp": {
      "command": "node",
      "args": ["/absolute/path/to/ibu-mcp/dist/index.js"]
    }
  }
}
```

**Dev mode:**

```json
{
  "mcpServers": {
    "ibu-mcp": {
      "command": "npx",
      "args": ["tsx", "/absolute/path/to/ibu-mcp/src/index.ts"]
    }
  }
}
```

## Available Tools

| Tool | Description |
|------|-------------|
| `ibu_get_student_info` | Name, student ID, email, status |
| `ibu_get_student_image` | Student profile image data |
| `ibu_get_active_sanctions` | Active disciplinary sanctions |
| `ibu_get_scholarship_overview` | GPA, scholarship %, points vs required |
| `ibu_get_grades` | Grades for a given academic year and semester |
| `ibu_get_recent_grades` | Recently posted grades |
| `ibu_get_recent_exams` | Recent exam results |
| `ibu_get_upcoming_exams` | Upcoming scheduled exams |
| `ibu_get_exam_dates` | Exam calendar for a date range |
| `ibu_get_curriculum` | Full curriculum course list |
| `ibu_get_syllabus` | Course syllabus for a year and semester |
| `ibu_get_academic_years` | All academic years on record |
| `ibu_get_attendance` | Attendance summary for a semester |
| `ibu_get_attendance_details` | Per-class attendance for a course |
| `ibu_get_preferred_attendance` | Preferred attendance mode |
| `ibu_get_notifications` | Recent notifications |
| `ibu_get_unread_count` | Number of unread notifications |
| `ibu_mark_notification_read` | Mark one notification as read |
| `ibu_mark_all_notifications_read` | Mark all notifications as read |
| `ibu_get_installments` | Upcoming tuition installments |
| `ibu_get_installments_by_year` | Installments for a specific academic year |
| `ibu_get_annexes` | Contract annexes |
| `ibu_get_student_contracts` | Tuition contracts on the account |
| `ibu_get_annex_details` | Line items for a contract annex |
| `ibu_get_non_tuition_fees` | Non-tuition fees for an academic year |
| `ibu_get_scholarship_categories` | Scholarship activity categories |
| `ibu_get_student_activities` | Enrolled scholarship activities |
| `ibu_get_student_activity` | Details for one activity |
| `ibu_delete_student_activity` | Permanently delete an activity entry |
| `ibu_get_activity_overview` | Activity points overview for an academic year |

## Smoke Tests

First verify the MCP handshake and all published tool schemas without contacting IBU:

```bash
npm run test:mcp
```

Then start your MCP client and try:

- *"What are my current grades?"*
- *"Show my attendance for this semester"*
- *"How many unread notifications do I have?"*
- *"What do I owe this semester?"*

## Error Messages

| Error | Meaning |
|-------|---------|
| `Missing IBU_ACCESS_TOKEN in .env` | `.env` is missing or the access token is empty |
| `Missing IBU_USER_JWT in .env` | `.env` is missing or the user token is empty |
| `Session expired. Update IBU_USER_JWT in your .env file.` | JWT expired — re-copy from DevTools |
| `Account blocked: unpaid fees.` | Contact accounting@ibu.edu.ba |
| `Account locked.` | Contact student-affairs-office@ibu.edu.ba |
| `Mandatory survey pending.` | Complete the survey at mine.ibu.edu.ba |
