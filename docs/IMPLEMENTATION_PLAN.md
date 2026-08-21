# CampusShield AI — Implementation Plan

> Optimized for 24–48 hour hackathon sprint
> Total estimated time: ~36 hours of focused development

---

## Development Phases

### Phase 0: Foundation (Hours 0–3) ⏱️
> Sequential — must complete before anything else

| # | Task | Est. | Dependencies | Owner |
|---|------|------|-------------|-------|
| 0.1 | Initialize Next.js 14 project with TypeScript | 15m | — | Lead |
| 0.2 | Configure Tailwind CSS + shadcn/ui | 20m | 0.1 | Lead |
| 0.3 | Set up Supabase project (cloud) | 15m | — | Backend |
| 0.4 | Configure environment variables | 10m | 0.1, 0.3 | Lead |
| 0.5 | Set up Supabase client helpers (browser, server, admin) | 30m | 0.4 | Backend |
| 0.6 | Run database migrations (all tables) | 30m | 0.3 | Backend |
| 0.7 | Set up basic project structure (folders, layout shells) | 30m | 0.1 | Lead |
| 0.8 | Configure Next.js middleware for auth | 30m | 0.5 | Backend |
| 0.9 | Seed demo data | 20m | 0.6 | Backend |

**Gate**: All team members can run `npm run dev` and see a working shell with auth.

---

### Phase 1: Auth + Layout (Hours 3–6) ⏱️
> Can partially parallelize

| # | Task | Est. | Dependencies | Owner | Parallel? |
|---|------|------|-------------|-------|-----------|
| 1.1 | Login page UI | 45m | 0.7 | Frontend A | ✅ with 1.3 |
| 1.2 | Register page UI | 30m | 1.1 | Frontend A | |
| 1.3 | Auth API (login, register, logout hooks) | 45m | 0.5, 0.8 | Backend | ✅ with 1.1 |
| 1.4 | Profile creation trigger (DB function) | 20m | 0.6 | Backend | |
| 1.5 | Dashboard layout (sidebar + topbar) | 60m | 0.7 | Frontend B | ✅ with 1.1, 1.3 |
| 1.6 | Role-based sidebar navigation | 30m | 1.5, 1.3 | Frontend B | |
| 1.7 | Auth context provider + useAuth hook | 30m | 1.3 | Backend | |
| 1.8 | RBAC middleware + useRole hook | 30m | 1.7 | Backend | |

**Gate**: Users can register, login, see role-based sidebar, and be redirected based on role.

---

### Phase 2: 🔴 HERO — AI Incident System (Hours 6–14) ⏱️
> This is the CORE. Spend the most time here.

| # | Task | Est. | Dependencies | Owner | Parallel? |
|---|------|------|-------------|-------|-----------|
| 2.1 | Gemini client setup + system prompts | 45m | 0.4 | AI Dev | ✅ with 2.3 |
| 2.2 | AI output Zod schemas | 30m | 2.1 | AI Dev | |
| 2.3 | Incident report form UI (multi-step) | 90m | 1.5 | Frontend A | ✅ with 2.1 |
| 2.4 | `/api/ai/classify-incident` route | 60m | 2.1, 2.2 | AI Dev | |
| 2.5 | AI classification display (real-time cards) | 60m | 2.3 | Frontend A | |
| 2.6 | `/api/incidents` POST route (create with AI) | 60m | 2.4, 0.6 | Backend | |
| 2.7 | `/api/incidents` GET route (list, filtered) | 30m | 0.6 | Backend | ✅ with 2.6 |
| 2.8 | Incident list page UI | 45m | 2.7 | Frontend B | |
| 2.9 | Incident detail page + timeline UI | 60m | 2.7 | Frontend B | ✅ with 2.6 |
| 2.10 | Incident status update API + UI | 45m | 2.6 | Backend | |
| 2.11 | Supabase Realtime subscriptions (incidents) | 45m | 2.6 | Backend | ✅ with 2.8 |
| 2.12 | Integration test: full incident flow | 30m | 2.1–2.11 | Lead | |

**Gate**: Full demo flow works — student reports → AI classifies → incident created → list updates in real-time.

---

### Phase 3: 🔴 Command Center + Campus Map (Hours 14–20) ⏱️
> The visual showpiece

| # | Task | Est. | Dependencies | Owner | Parallel? |
|---|------|------|-------------|-------|-----------|
| 3.1 | Command Center layout (grid dashboard) | 90m | 2.11 | Frontend A | ✅ with 3.4 |
| 3.2 | Live incident feed widget | 45m | 2.11 | Frontend A | |
| 3.3 | Stat cards (active incidents, severity breakdown) | 30m | 2.7 | Frontend A | |
| 3.4 | SVG Campus Map component | 90m | Phase 2 | Frontend B | ✅ with 3.1 |
| 3.5 | Plot incidents on map (color-coded pins) | 45m | 3.4, 2.7 | Frontend B | |
| 3.6 | Map click → incident detail popup | 30m | 3.5 | Frontend B | |
| 3.7 | Emergency alert creation API | 30m | 2.6 | Backend | ✅ with 3.1 |
| 3.8 | Emergency alert banner component | 30m | 3.7 | Frontend A | |
| 3.9 | Realtime alert notifications (toast/banner) | 30m | 3.7, 2.11 | Frontend A | |
| 3.10 | Command center realtime updates | 30m | 3.1, 2.11 | Backend | |
| 3.11 | Department routing notification display | 30m | 2.6 | Frontend B | |

**Gate**: Admin opens command center → sees live incidents, map with pins, stats, emergency alerts. All update in real-time.

---

### Phase 4: Safety Features (Hours 20–26) ⏱️
> Deepen the safety story

| # | Task | Est. | Dependencies | Owner | Parallel? |
|---|------|------|-------------|-------|-----------|
| 4.1 | SOS panic button UI | 45m | 1.5 | Frontend A | ✅ with 4.4 |
| 4.2 | SOS API (trigger + respond + resolve) | 45m | 0.6 | Backend | ✅ with 4.1 |
| 4.3 | SOS realtime on command center | 30m | 4.2, 3.10 | Backend | |
| 4.4 | Safety Analytics page layout | 45m | 1.5 | Frontend B | ✅ with 4.1 |
| 4.5 | `/api/ai/safety-insights` route | 60m | 2.1 | AI Dev | ✅ with 4.4 |
| 4.6 | Recharts: incident trends over time | 45m | 4.4, 2.7 | Frontend B | |
| 4.7 | Recharts: severity distribution pie chart | 30m | 4.4, 2.7 | Frontend B | |
| 4.8 | Recharts: incidents by location bar chart | 30m | 4.4, 2.7 | Frontend B | |
| 4.9 | AI insight cards on analytics page | 30m | 4.5 | Frontend B | |
| 4.10 | Visitor management CRUD UI | 45m | 1.5 | Frontend A | ✅ with 4.5 |
| 4.11 | Visitor management API | 30m | 0.6 | Backend | ✅ with 4.10 |
| 4.12 | Security operations dashboard | 45m | 3.1 | Frontend A | |
| 4.13 | Audit logs page + API | 45m | 0.6 | Backend | ✅ with 4.12 |

**Gate**: SOS works, analytics show charts + AI insights, visitors tracked, audit logs visible.

---

### Phase 5: ERP Features (Hours 26–34) ⏱️
> Build quickly — these are secondary to safety

| # | Task | Est. | Dependencies | Owner | Parallel? |
|---|------|------|-------------|-------|-----------|
| 5.1 | Shared DataTable component | 45m | 1.5 | Frontend A | |
| 5.2 | Students page (list + basic CRUD) | 45m | 5.1 | Frontend A | ✅ with 5.3 |
| 5.3 | Faculty page (list + basic CRUD) | 45m | 5.1 | Frontend B | ✅ with 5.2 |
| 5.4 | Students/Faculty API routes | 45m | 0.6 | Backend | ✅ with 5.2 |
| 5.5 | Attendance page (mark + view) | 60m | 5.4 | Frontend A | |
| 5.6 | Attendance API | 30m | 0.6 | Backend | ✅ with 5.5 |
| 5.7 | Timetable page (grid view) | 45m | 1.5 | Frontend B | ✅ with 5.5 |
| 5.8 | Exams page (schedule + results) | 45m | 5.1 | Frontend A | ✅ with 5.7 |
| 5.9 | Hostel page | 30m | 5.1 | Frontend B | ✅ with 5.8 |
| 5.10 | Transport page | 30m | 5.1 | Frontend A | ✅ with 5.9 |
| 5.11 | Complaints page + API | 45m | 5.1 | Frontend B | ✅ with 5.10 |
| 5.12 | Placements page | 30m | 5.1 | Frontend A | ✅ with 5.11 |
| 5.13 | Communication/Announcements page | 30m | 5.1 | Frontend B | ✅ with 5.12 |
| 5.14 | Parent portal (read-only views) | 30m | 5.4 | Frontend A | |
| 5.15 | ERP API routes (batch) | 60m | 0.6 | Backend | ✅ with 5.2 |

**Gate**: All ERP pages show data, basic CRUD works, parent can view child data.

---

### Phase 6: Polish + Demo Prep (Hours 34–38) ⏱️
> Make it shine

| # | Task | Est. | Dependencies | Owner | Parallel? |
|---|------|------|-------------|-------|-----------|
| 6.1 | Role-based dashboard landing pages | 60m | All phases | Frontend A | ✅ with 6.2 |
| 6.2 | Mobile responsive check + fixes | 45m | All phases | Frontend B | ✅ with 6.1 |
| 6.3 | Loading states + skeletons | 30m | All phases | Frontend A | |
| 6.4 | Error handling + toast notifications | 30m | All phases | Frontend B | |
| 6.5 | Refresh demo seed data | 30m | All phases | Backend | ✅ with 6.1 |
| 6.6 | Performance check (Lighthouse) | 15m | All phases | Lead | |
| 6.7 | Bug fixes + edge cases | 60m | All phases | All | |
| 6.8 | Prepare demo script with talking points | 30m | All phases | Lead | |
| 6.9 | Record backup demo video | 30m | 6.8 | Lead | |
| 6.10 | Final deployment to Vercel | 15m | All phases | Lead | |

**Gate**: Demo runs smoothly end-to-end, no crashes, looks professional.

---

## Parallelization Strategy

### What MUST Be Sequential

```
Foundation (Phase 0)
  → Must complete before ANY other work
  → Database, auth, project setup are hard dependencies

Auth + Layout (Phase 1)
  → Login/Register before incident system
  → Sidebar before any dashboard pages

AI Setup (Task 2.1–2.2)
  → Must happen before AI classification endpoint
  → Must happen before incident creation with AI

Incident Create API (Task 2.6)
  → Must happen before command center
  → Must happen before analytics
```

### What CAN Be Parallelized

```
PARALLEL TRACK A: Frontend UI
  - Incident form (2.3) ∥ Gemini setup (2.1)
  - Command center layout (3.1) ∥ Campus map (3.4)
  - SOS UI (4.1) ∥ Analytics layout (4.4)
  - All ERP pages (5.2–5.14) can run in parallel

PARALLEL TRACK B: Backend APIs
  - Incident list API (2.7) ∥ Incident create API (2.6)
  - Alert API (3.7) ∥ Command center UI (3.1)
  - SOS API (4.2) ∥ Visitor API (4.11)
  - All ERP APIs (5.4, 5.6, 5.15) can run in parallel

PARALLEL TRACK C: AI Development
  - AI safety insights (4.5) ∥ Safety analytics UI (4.4)
  - AI risk assessment ∥ Other analytics components
```

### Recommended Team Split (3 Developers)

```
Developer 1 (Lead / Full-Stack):
  Phase 0 → Phase 1 (auth) → Phase 2 (AI integration) → Phase 6 (polish/demo)

Developer 2 (Frontend Focus):
  Phase 1 (layout) → Phase 2 (incident UI) → Phase 3 (command center) → Phase 5 (ERP)

Developer 3 (Backend Focus):
  Phase 0 (DB) → Phase 2 (APIs) → Phase 4 (safety APIs) → Phase 5 (ERP APIs)
```

### Solo Developer Strategy

If working alone, prioritize the demo flow:

```
Hours 0–3:   Foundation (Phase 0)
Hours 3–5:   Auth + Layout (Phase 1, minimal)
Hours 5–12:  HERO: AI Incident System (Phase 2)
Hours 12–18: Command Center + Map (Phase 3)
Hours 18–22: Safety Features (Phase 4, SOS + Analytics)
Hours 22–28: ERP (Phase 5, top 4-5 pages only)
Hours 28–30: Polish + Demo (Phase 6, minimal)
```

Skip if short on time (in order):
1. Parent portal
2. Transport page
3. Hostel page
4. Placements page
5. Exams page
6. Communication page

**Never skip**: Incident system, Command center, Campus map, SOS, Analytics

---

## Risk Mitigation

| Risk | Mitigation |
|------|-----------|
| Gemini API rate limits | Cache AI responses, implement retry with backoff |
| Supabase Realtime issues | Fallback to polling every 5 seconds |
| Time crunch on ERP | Use the shared DataTable for fast page creation |
| AI returns invalid output | Zod validation + fallback to manual classification |
| Demo fails live | Pre-record backup demo video |
| Auth bugs block everything | Test auth in Phase 0, don't proceed until working |

---

## Definition of Done (Per Phase)

- [ ] All listed tasks completed
- [ ] No TypeScript errors
- [ ] Basic responsive layout
- [ ] Console has no critical errors
- [ ] Demo scenario runs without crashes
- [ ] Git committed with clear messages
