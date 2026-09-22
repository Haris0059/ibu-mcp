# IBU MCP Server — Build Plan

## Context

Building a Model Context Protocol (MCP) server (`ibu-mcp`) that lets students query their IBU student information system (mine.ibu.edu.ba) via AI assistants (Claude, Gemini). The server runs locally on the student's machine. Auth is manual (JWT + access token from `.env`) until IT enables a proper auth endpoint.

See `ibu-api.md` for the full API reference.

---

## Stack

| Tool | Choice |
|------|--------|
| Language | TypeScript |
| Runtime | Node.js LTS |
| MCP SDK | `@modelcontextprotocol/sdk` |
| Validation | `zod` |
| HTTP | native `fetch` (Node 18+) |
| Env | `dotenv` |
| Dev runner | `tsx` |
| Build | `tsc` |

---

## Project Structure

```
ibu-mcp/
├── src/
│   ├── index.ts              # MCP server entry, tool registration
│   ├── client.ts             # IBU REST API client (auth headers, error handling)
│   ├── auth.ts               # Load tokens from .env, decode JWT
│   └── tools/
│       ├── student.ts        # Student info + scholarship overview
│       ├── grades.ts         # Grades, exams, curriculum, exam calendar
│       ├── attendance.ts     # Attendance summary + per-class details
│       ├── notifications.ts  # Notifications
│       ├── finances.ts       # Installments, annexes, non-tuition fees
│       └── activities.ts     # Scholarship categories + student activities
├── ibu-api.md                # Full API reference
├── PLAN.md                   # This file
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

---

## Core Infrastructure

### `src/auth.ts`
- Load `IBU_ACCESS_TOKEN` and `IBU_USER_JWT` from `.env`
- Decode JWT payload (base64) to extract `id`, `student_id`, `first_name`, `last_name`, `email`
- Fail fast with a clear error message if tokens are missing

### `src/client.ts`
- Single `ibufetch(path, init?)` function
- Injects `sis-access-token`, `sis-user-token`, `Origin`, `Referer` on every request
- Maps error codes to human-readable messages:
  - `401` → `"Session expired. Update IBU_USER_JWT in your .env file."`
  - `402` → `"Account blocked: unpaid fees. Contact accounting@ibu.edu.ba"`
  - `403` → `"Account locked. Contact student-affairs-office@ibu.edu.ba"`
  - `301` → `"Mandatory survey pending. Complete it at mine.ibu.edu.ba/#survey"`

---

## MCP Tools

All tools return `{ content: [{ type: 'text', text: string }] }` with JSON responses pretty-printed.

### `src/tools/student.ts`
| Tool | Source | Notes |
|------|--------|-------|
| `ibu_get_student_info` | JWT decode | No API call — name, student_id, email, status, city |
| `ibu_get_scholarship_overview` | `student/get_scholarship_overview` | GPA, scholarship %, points vs required |

### `src/tools/grades.ts`
| Tool | Endpoint | Input |
|------|----------|-------|
| `ibu_get_grades` | `student/get_grades/{year}/{sem}` | `academic_year`, `semester`, optional `course_status` |
| `ibu_get_recent_grades` | `student/recent_grades` | none |
| `ibu_get_recent_exams` | `student/recent_exams` | none |
| `ibu_get_upcoming_exams` | `student/upcoming_exams` | none |
| `ibu_get_exam_dates` | `student/get_exam_dates` | `start`, `end` (YYYY-MM-DD) |
| `ibu_get_curriculum` | `student/get_curriculum_courses` | none |
| `ibu_get_academic_years` | `student/get_distinct_academic_years` | none |

### `src/tools/attendance.ts`
| Tool | Endpoint | Input |
|------|----------|-------|
| `ibu_get_attendance` | `student/attendance/{year}/{sem}` | `academic_year`, `semester` |
| `ibu_get_attendance_details` | `student/attendance_details/{id}` | `student_course_id` |

### `src/tools/notifications.ts`
| Tool | Endpoint |
|------|----------|
| `ibu_get_notifications` | `student/get_recent_notifications` |
| `ibu_get_unread_count` | `student/unread_notifications` |

### `src/tools/finances.ts`
| Tool | Endpoint | Input |
|------|----------|-------|
| `ibu_get_installments` | `student/upcoming_installments` | none |
| `ibu_get_installments_by_year` | `student/get_student_installments_for_academic_year/{year}` | `academic_year` |
| `ibu_get_annexes` | `student/get_annexes` | none |
| `ibu_get_non_tuition_fees` | `student/get_student_non_tuition_fees/{student_id}/{year}` | `academic_year` (student_id from JWT) |

### `src/tools/activities.ts`
| Tool | Endpoint | Input |
|------|----------|-------|
| `ibu_get_scholarship_categories` | `scholarship/get_categories` | none |
| `ibu_get_student_activities` | `student/get_student_activities` | none |
| `ibu_get_activity_overview` | `student/get_activity_overview` | `academic_year` |

---

## Implementation Order

1. ✅ `ibu-api.md` — API reference
2. ✅ `PLAN.md` — this file
3. Project scaffold — `package.json`, `tsconfig.json`, `.gitignore`, `.env.example`
4. `src/auth.ts` + `src/client.ts` — foundation
5. `src/tools/student.ts` — simplest, verifies auth loading
6. `src/tools/grades.ts` — highest student value
7. `src/tools/attendance.ts`
8. `src/tools/notifications.ts`
9. `src/tools/finances.ts`
10. `src/tools/activities.ts`
11. `src/index.ts` — wire all tools together
12. Claude Desktop config + smoke test

---

## Claude Desktop Integration

**Linux** (`~/.config/claude-desktop/claude_desktop_config.json`):
```json
{
  "mcpServers": {
    "ibu-mcp": {
      "command": "node",
      "args": ["/home/haris/Projects/ibu-mcp/dist/index.js"]
    }
  }
}
```

Dev mode (no build step needed):
```json
{
  "mcpServers": {
    "ibu-mcp": {
      "command": "npx",
      "args": ["tsx", "/home/haris/Projects/ibu-mcp/src/index.ts"]
    }
  }
}
```

---

## Verification

1. `npm run dev` starts without errors
2. Claude prompts to test: *"What are my current grades?"*, *"Show my attendance for this semester"*, *"How many unread notifications do I have?"*, *"What do I owe this semester?"*
3. Force a 401 with a bad JWT → verify clean error message surfaces
4. Confirm `.env` is gitignored before first push

---

## Post-MVP (after IT enables auth endpoint)

- `ibu-mcp login` CLI command — opens browser → catches callback → saves JWT automatically
- Dedicated `sis-access-token` from IT for `ibu-mcp` client identity
- Longer JWT expiry (30–90 days) or refresh token support
- `ibu_get_timetable` tool — once the 5th missing param is identified
- `ibu_get_professors` + `ibu_get_professor_schedule` tools
