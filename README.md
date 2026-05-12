# ibu-mcp

MCP server for the International Burch University student information system (mine.ibu.edu.ba). Lets you query grades, attendance, finances, notifications, and more via Claude Code or Gemini CLI.

## Requirements

- Node.js 18+
- Claude Code CLI (`claude`) or Gemini CLI (`gemini`)
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
3. Reload the page and click any API request going to `api.ibu.edu.ba`
4. Copy the `sis-access-token` and `sis-user-token` request headers into `.env`

Tokens expire when your session ends — re-copy them when you get auth errors.

### 3. Build

```bash
npm run build
```

This outputs `dist/index.js`.

### 4. Register with Claude Code

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

### 5. Register with Gemini CLI (alternative)

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
| `ibu_get_scholarship_overview` | GPA, scholarship %, points vs required |
| `ibu_get_grades` | Grades for a given academic year and semester |
| `ibu_get_recent_grades` | Recently posted grades |
| `ibu_get_recent_exams` | Recent exam results |
| `ibu_get_upcoming_exams` | Upcoming scheduled exams |
| `ibu_get_exam_dates` | Exam calendar for a date range |
| `ibu_get_curriculum` | Full curriculum course list |
| `ibu_get_academic_years` | All academic years on record |
| `ibu_get_attendance` | Attendance summary for a semester |
| `ibu_get_attendance_details` | Per-class attendance for a course |
| `ibu_get_notifications` | Recent notifications |
| `ibu_get_unread_count` | Number of unread notifications |
| `ibu_get_installments` | Upcoming tuition installments |
| `ibu_get_installments_by_year` | Installments for a specific academic year |
| `ibu_get_annexes` | Contract annexes |
| `ibu_get_non_tuition_fees` | Non-tuition fees for an academic year |
| `ibu_get_scholarship_categories` | Scholarship activity categories |
| `ibu_get_student_activities` | Enrolled scholarship activities |
| `ibu_get_activity_overview` | Activity points overview for an academic year |

## Smoke Tests

Once registered, start a Claude Code or Gemini CLI session and try:

- *"What are my current grades?"*
- *"Show my attendance for this semester"*
- *"How many unread notifications do I have?"*
- *"What do I owe this semester?"*

## Error Messages

| Error | Meaning |
|-------|---------|
| `Session expired. Update IBU_USER_JWT in your .env file.` | JWT expired — re-copy from DevTools |
| `Account blocked: unpaid fees.` | Contact accounting@ibu.edu.ba |
| `Account locked.` | Contact student-affairs-office@ibu.edu.ba |
| `Mandatory survey pending.` | Complete the survey at mine.ibu.edu.ba |
