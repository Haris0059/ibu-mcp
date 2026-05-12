# IBU REST API Reference

Reverse-engineered from `mine.ibu.edu.ba` SPA (vtpl templates + JS controllers + live probing).

**Base URL:** `https://rest.ibu.edu.ba/rest/`

**Required headers on every request:**
```
sis-access-token: <app token>
sis-user-token: <student JWT>
Origin: https://mine.ibu.edu.ba
Referer: https://mine.ibu.edu.ba/
```

**Error codes:**
| Code | Meaning | Action |
|------|---------|--------|
| 401 | Expired/invalid JWT | Prompt student to refresh token |
| 402 | Unpaid fees | Contact accounting@ibu.edu.ba |
| 403 | Account locked | Contact student-affairs-office@ibu.edu.ba |
| 301 | Mandatory survey pending | Complete at mine.ibu.edu.ba/#survey |

---

## Student Info

> Profile data (name, student_id, email, birth_date, etc.) comes from **JWT payload decode** — no API call needed.

| Method | Path | Response |
|--------|------|----------|
| GET | `student/get_student_image/` | `{image: "<base64>"}` or `{}` — fallback to `google_avatar` from JWT |
| GET | `student/get_active_sanctions` | `[]` or array of sanctions |

---

## Grades & Courses

| Method | Path | Params | Response |
|--------|------|--------|----------|
| GET | `student/recent_grades` | — | `[{id, code, name, ects, grade_numeric, grade_varchar, course_status, total, exams:[{type, percentage, description, grade, points, date}]}]` |
| GET | `student/recent_exams` | — | `[{course_name, exam_name, exam_type, exam_percentage, student_grade}]` |
| GET | `student/upcoming_exams` | — | `[]` or array |
| GET | `student/get_grades/{academic_year}/{semester}` | semester = `FALL`\|`SPRING`; `?course_status=ACTIVE_CURRICULUM\|ELECTIVE\|ALL` | Same shape as `recent_grades` |
| GET | `student/get_distinct_academic_years` | — | `[{academic_year, id, name}]` |
| GET | `student/get_curriculum_courses` | — | `{semesters:[...], curriculum_courses:[{id, code, name, ects, semester, type}], course_grades:[...]}` |
| GET | `student/get_syllabus/{course_id}/{academic_year}/{semester}` | — | Syllabus content |
| GET | `student/get_syllabus_pdf/{course_id}/{academic_year}/{semester}` | — | PDF binary |
| POST | `student/apply_for_exam` | body TBD | — |
| POST | `student/cancel_exam_application` | body TBD | — |

---

## Attendance

| Method | Path | Params | Response |
|--------|------|--------|----------|
| GET | `student/attendance/{academic_year}/{semester}` | semester = `FALL`\|`SPRING` | `[{id, code, name, ects, lab_present, lab_absent, lesson_present, lesson_absent, present, absent, total, lab_total, lesson_total}]` |
| GET | `student/attendance_details/{student_course_id}` | — | `[{id, student_course_id, date, status, description, type, class_number, number_of_classes, date_formatted}]` |
| GET | `student/get_preferred_attendence` | — | `{pref_attendance: null\|"online"\|"combined"}` |
| POST | `student/set_preferred_attendence` | body TBD | — |
| POST | `student/log_attendance` | body TBD | — |

---

## Exam Calendar

| Method | Path | Params | Response |
|--------|------|--------|----------|
| GET | `student/get_exam_dates` | `?start=YYYY-MM-DD&end=YYYY-MM-DD` | `[{title, start, end, room}]` (FullCalendar event format) |

---

## Notifications

| Method | Path | Response |
|--------|------|----------|
| GET | `student/unread_notifications` | `{total: N}` |
| GET | `student/get_recent_notifications` | `[{id, employee, subject, message}]` |
| GET | `student/get_notifications` | Full notification list |
| GET | `student/read_notification/{id}` | Marks notification as read |
| GET | `student/delete_notification/{id}` | Deletes notification |

---

## Finances

| Method | Path | Params | Response |
|--------|------|--------|----------|
| GET | `student/upcoming_installments` | — | `{installments: []}` |
| GET | `student/get_student_installments_for_academic_year/{year}` | — | Installment list |
| GET | `student/get_student_contracts` | — | Contract list |
| GET | `student/get_annexes` | — | `[{id, status, contract_number, amount, institution, annex_number, academic_year, semester, discount, date_of_creation}]` |
| GET | `student/get_annex_details/{annex_id}` | — | Annex line items |
| GET | `student/get_annexes_pdf` | — | PDF binary |
| GET | `student/get_student_non_tuition_fees/{student_id}/{academic_year}` | — | `{success: bool, data: []}` |

---

## Scholarship

| Method | Path | Params | Response |
|--------|------|--------|----------|
| GET | `student/get_scholarship_overview` | — | `{gpa, cycle, min_gpa, points, req_points, failed_courses, max_failed_courses, passed_courses, na_courses, gpa_with_points, current_scholarship}` |
| GET | `scholarship/get_categories` | — | `[{id, name, estimated_points, order}]` |
| GET | `student/get_student_activity/{id}` | — | Single activity detail |
| POST | `student/add_student_activity` | body TBD | — |
| DELETE | `student/delete_student_activity/{id}` | — | — |

---

## Student Activities (extracurricular)

| Method | Path | Params | Response |
|--------|------|--------|----------|
| GET | `student/get_student_activities` | — | `{iTotalRecords, iTotalDisplayRecords, data:[]}` |
| GET | `student/get_activity_overview` | `?academic_year=YYYY-YYYY` | `{student, faculty, department, applied_activities, pending_activities, realized_activities, max_points}` |
| GET | `student/get_active_activities` | `?status=ACTIVE\|PENDING\|...` | `{iTotalRecords, iTotalDisplayRecords, data:[]}` |
| POST | `student/submit_student_activity/{id}` | `{submission: string}` | — |
| DELETE | `student/delete_activity_application/{id}` | — | — |

---

## Timetable & Schedule

| Method | Path | Params | Response |
|--------|------|--------|----------|
| GET | `student/get_timetable_data` | **5 params unknown** — CI error: `get_timetable_by_params() 4 passed, 5 expected`. Try: `academic_year`, `semester`, `student_id`, `course_id`, `employee_id`, `day` | TBD |
| GET | `student/get_professors` | — | Professor list |
| GET | `student/get_professor_weekly_schedule` | `?employee_id={id}` | Weekly schedule |

---

## Graduation

| Method | Path |
|--------|------|
| GET | `student/graduation_status` |
| GET | `student/graduation_data` |
| GET | `student/graduation_survey_status` |
| POST | `student/graduation_survey` |

---

## Auth

| Method | Path | Body | Response |
|--------|------|------|----------|
| POST | `user/email` | `{email}` | `{redirect_uri}` — Google OAuth URL |
