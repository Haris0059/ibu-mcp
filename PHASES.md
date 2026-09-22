# IBU MCP Server — Development Phases

Derived from `PLAN.md`. Each phase is self-contained and testable before moving on.

---

## Phase 1 — Project Scaffold

**Goal:** Runnable TypeScript project with no logic yet.

| Task | File |
|------|------|
| Package manifest | `package.json` |
| TypeScript config | `tsconfig.json` |
| Git ignore | `.gitignore` |
| Env template | `.env.example` |

**Done when:** `npm install` succeeds and `npx tsx --version` runs without errors.

---

## Phase 2 — Core Infrastructure

**Goal:** Auth loading and HTTP client working end-to-end.

| Task | File |
|------|------|
| Token loader + JWT decoder | `src/auth.ts` |
| `ibufetch()` with headers + error mapping | `src/client.ts` |

**Done when:** Importing `auth.ts` with a valid `.env` returns parsed student identity; a bad JWT surfaces the `401` message.

---

## Phase 3 — Student & Grades Tools

**Goal:** Highest-value tools working. First end-to-end MCP smoke test.

| Task | File | Tools |
|------|------|-------|
| Student info + scholarship | `src/tools/student.ts` | `ibu_get_student_info`, `ibu_get_scholarship_overview` |
| Grades, exams, curriculum | `src/tools/grades.ts` | `ibu_get_grades`, `ibu_get_recent_grades`, `ibu_get_recent_exams`, `ibu_get_upcoming_exams`, `ibu_get_exam_dates`, `ibu_get_curriculum`, `ibu_get_academic_years` |
| MCP server entry (partial) | `src/index.ts` | registers Phase 3 tools only |

**Done when:** Claude Desktop can answer *"What are my current grades?"* and *"Show my scholarship status."*

---

## Phase 4 — Attendance & Notifications

**Goal:** Two more tool files; extend `src/index.ts`.

| Task | File | Tools |
|------|------|-------|
| Attendance summary + details | `src/tools/attendance.ts` | `ibu_get_attendance`, `ibu_get_attendance_details` |
| Notifications | `src/tools/notifications.ts` | `ibu_get_notifications`, `ibu_get_unread_count` |

**Done when:** Claude answers *"Show my attendance for this semester"* and *"How many unread notifications do I have?"*

---

## Phase 5 — Finances & Activities

**Goal:** Complete the full tool surface.

| Task | File | Tools |
|------|------|-------|
| Installments, annexes, non-tuition fees | `src/tools/finances.ts` | `ibu_get_installments`, `ibu_get_installments_by_year`, `ibu_get_annexes`, `ibu_get_non_tuition_fees` |
| Scholarship categories + activities | `src/tools/activities.ts` | `ibu_get_scholarship_categories`, `ibu_get_student_activities`, `ibu_get_activity_overview` |

**Done when:** Claude answers *"What do I owe this semester?"* and *"What activities am I enrolled in?"*

---

## Phase 6 — Integration & Release

**Goal:** Server complete, Claude Desktop config documented, verified clean.

| Task |
|------|
| Wire all tool modules into `src/index.ts` |
| Write `README.md` (setup, `.env` instructions, Claude Desktop config) |
| Verify `.env` is gitignored |
| Run full verification checklist from `PLAN.md` |
| `npm run build` → confirm `dist/index.js` works |

**Done when:** All four smoke-test prompts pass, error paths return clean messages, repo is safe to push.

---

## Phase 7 — Post-MVP (future)

Blocked on IT-side changes. Track separately.

- `ibu-mcp login` CLI — browser OAuth flow, auto-saves JWT
- Dedicated `sis-access-token` from IT
- Longer JWT expiry / refresh token support
- `ibu_get_timetable` — once missing parameter is identified
- `ibu_get_professors` + `ibu_get_professor_schedule`

---

## Phase 8 — npm Publish

**Goal:** Any IBU student can set up the tool with a single command.

**Blocked on:** Phase 7 auth (IT endpoint + `ibu-mcp login` working end-to-end).

| Task | Notes |
|------|-------|
| Add `bin` field to `package.json` | `"ibu-mcp": "./dist/cli.js"` |
| Create `src/cli.ts` | Handles `ibu-mcp login` and `ibu-mcp start` commands |
| Wire `ibu-mcp login` to OAuth flow | Opens browser → token saved automatically |
| Create npm account | npmjs.com |
| `npm run build` | Confirm `dist/cli.js` is produced |
| `npm publish` | Package name: `ibu-mcp` |
| Update `README.md` | Setup becomes: `npx ibu-mcp login` + one JSON snippet for AI assistant config |

**Done when:** A student with no prior setup can run `npx ibu-mcp login`, get redirected to mine.ibu.edu.ba, see "Verification successful", and immediately use the MCP server with their AI assistant of choice.
