# OKR/KPI HR Management System - User Guide

## 1. Introduction

OKR/KPI HR Management System helps teams manage:
- objectives
- key results
- KPIs
- check-ins
- role-based dashboard views
- Funny Assistant for guided questions and insights

The system is designed for 3 main roles:
- `admin`
- `manager`
- `employee`

---

## 2. Sign In

1. Open the login page.
2. Enter your email or username.
3. Enter your password.
4. Click `Enter workspace`.

Demo accounts:
- `admin@okr.local / Admin@123`
- `manager.eng@okr.local / Manager@123`
- `manager.sales@okr.local / Manager@123`
- `manager.hr@okr.local / Manager@123`
- `lan@okr.local / Employee@123`
- `nam@okr.local / Employee@123`
- `ha@okr.local / Employee@123`

---

## 3. Role Overview

### Admin
- View the full system dashboard
- Manage users and departments
- Review top performers and departments needing attention
- Use Funny Assistant for global summary and insights

### Manager
- Review team risks
- Track low progress objectives
- Monitor risky KPIs
- Follow up on pending check-ins

### Employee
- View personal objectives and KPIs
- Submit check-ins
- See what needs attention next
- Use Funny Assistant for personal summary and explanations

---

## 4. Main Navigation

### Dashboard
The dashboard shows:
- key summary cards
- progress charts
- risks and alerts
- top performers
- recommended next actions

### Objectives
Use this page to:
- create objectives
- assign owners
- link objectives to cycles
- monitor progress and status

### Key Results
Use this page to:
- define measurable outcomes under objectives
- update current values
- review progress and status

### KPIs
Use this page to:
- track operational metrics
- compare target and current values
- identify risky KPIs quickly

### Check-ins
Use this page to:
- submit progress updates
- add notes
- keep objective and KPI reporting current

### Users
Available for admin and manager scope.

Use this page to:
- create users
- assign roles
- manage activation and departments

### Departments
Use this page to:
- create departments
- assign department managers
- organize ownership cleanly

### Cycles
Use this page to:
- create planning cycles
- manage active and closed cycles

### Profile
Use this page to review:
- your account info
- your role
- your current workspace context

---

## 5. Funny Assistant

Funny Assistant is a guided assistant workspace for OKR/KPI operations.

You can use it to:
- ask preset questions
- ask your own question
- open recommended questions
- review insights
- follow quick actions
- read role-based summary
- open explain/help cards

### What Funny can return
- `answer`
- related links
- quick actions
- suggestions
- insights
- role-based summary
- explain/help responses

### Typical questions
- Which KPIs are at risk?
- What should I focus on next?
- Explain KPI progress
- Explain objective progress
- Show my summary
- Show team risks

### Notes
- If AI narrative is available, Funny may generate a richer summary.
- If AI is unavailable, Funny still works with deterministic fallback responses.

---

## 6. How To Use The New UI

### Sidebar
Use the sidebar to move quickly between:
- Dashboard
- Funny Assistant
- Objectives
- Key Results
- KPIs
- Check-ins
- Users
- Departments
- Cycles
- Profile

### Topbar
The topbar includes:
- breadcrumbs
- page context
- open guide button
- download guide button
- theme toggle
- sign out

### Tables and Forms
Most management pages now include:
- a creation or edit form
- search
- live data table
- empty states
- faster visual scanning

---

## 7. Open Or Download This Guide

You can access this guide directly from the frontend:
- `Open guide`
- `Download guide`

These buttons are available in:
- the login page
- the main layout topbar
- the sidebar help section

Backend guide endpoints:
- `GET /api/guides/user-guide`
- `GET /api/guides/user-guide/raw`
- `GET /api/guides/user-guide/download`

---

## 8. Quick Demo Flow

Recommended hackathon demo flow:

1. Sign in with `admin@okr.local`
2. Open `Dashboard`
3. Show summary cards, charts, and risk section
4. Open `Funny Assistant`
5. Show recommended questions, insights, and role summary
6. Ask:
   - `Which KPIs are at risk?`
   - `Explain KPI progress`
7. Open `Objectives` or `KPIs`
8. Show search, progress bars, and cleaner table layout
9. Open `Check-ins`
10. End by showing `Open guide` or `Download guide`

---

## 9. Troubleshooting

### Cannot sign in
Check:
- backend is running
- database is running
- credentials are correct

### Dashboard does not load
Check:
- backend API is reachable
- frontend `VITE_API_BASE_URL` is correct
- token is still valid

### Funny Assistant has no AI narrative
This is acceptable.

Funny still works in fallback mode if:
- Gemini is not configured
- AI request fails
- timeout happens

### Data looks empty for a role
This may be caused by current seeded data.

Example:
- a manager account may have limited team data in the demo seed

---

## 10. Technical Notes

Frontend:
- React + Vite

Backend:
- Node.js + Express

Database:
- PostgreSQL

API prefix:
- `/api`

Core modules:
- auth
- users
- departments
- cycles
- objectives
- key results
- check-ins
- KPIs
- dashboard
- Funny Assistant

---

## 11. Release Checklist

Before demo or release:
1. Start database
2. Start backend
3. Start frontend or serve built frontend
4. Verify login
5. Verify dashboard loads
6. Verify Funny Assistant loads
7. Verify one CRUD page
8. Verify guide buttons open correctly
