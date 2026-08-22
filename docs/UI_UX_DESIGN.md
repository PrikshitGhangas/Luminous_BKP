# CampusShield AI — Complete UI/UX Design System

> **Author**: Senior Product Designer & UI Architect  
> **Version**: 1.0  
> **Date**: 2026-08-21  
> **Scope**: All 22 screens, component hierarchy, design tokens, responsive behavior

---

## Table of Contents

1. [Design Philosophy](#1-design-philosophy)
2. [Design System — Tokens](#2-design-system--tokens)
3. [Typography System](#3-typography-system)
4. [Color System](#4-color-system)
5. [Spacing & Grid](#5-spacing--grid)
6. [Component Library](#6-component-library)
7. [Layout Architecture](#7-layout-architecture)
8. [Page Designs](#8-page-designs)
   - [8.1 Landing Page](#81-landing-page)
   - [8.2 Login](#82-login)
   - [8.3 Admin Dashboard](#83-admin-dashboard)
   - [8.4 Student Dashboard](#84-student-dashboard)
   - [8.5 Security Dashboard](#85-security-dashboard)
   - [8.6 Faculty Dashboard](#86-faculty-dashboard)
   - [8.7 Parent Dashboard](#87-parent-dashboard)
   - [8.8 Hostel Dashboard](#88-hostel-dashboard)
   - [8.9 Placement Dashboard](#89-placement-dashboard)
   - [8.10 Incident Reporting](#810-incident-reporting)
   - [8.11 Incident Details](#811-incident-details)
   - [8.12 Incident Management](#812-incident-management)
   - [8.13 Safety Command Center](#813-safety-command-center)
   - [8.14 Campus Safety Map](#814-campus-safety-map)
   - [8.15 Emergency Alerts](#815-emergency-alerts)
   - [8.16 Visitor Management](#816-visitor-management)
   - [8.17 Complaints](#817-complaints)
   - [8.18 Attendance](#818-attendance)
   - [8.19 Timetable](#819-timetable)
   - [8.20 AI Safety Analytics](#820-ai-safety-analytics)
   - [8.21 Campus AI Copilot](#821-campus-ai-copilot)
   - [8.22 Audit Logs](#822-audit-logs)
9. [Component Hierarchy](#9-component-hierarchy)
10. [Responsive Behavior](#10-responsive-behavior)
11. [Animation & Motion](#11-animation--motion)
12. [Accessibility Standards](#12-accessibility-standards)
13. [Icon Reference](#13-icon-reference)

---

## 1. Design Philosophy

### Brand Identity

CampusShield AI is an **enterprise-grade institutional platform**. Every design decision must communicate:

- **Institutional authority** — the platform that administrators and security personnel trust with life-safety decisions
- **Information density with clarity** — like Bloomberg Terminal meets modern SaaS, not a startup landing page
- **Operational efficiency** — security officers must be able to act within 3 seconds of seeing any alert
- **Calm confidence** — the platform should never feel panicked, even when displaying critical incidents

### The Three Modes

The UI must fluidly serve three emotional registers:

| Mode | Context | Design Register |
|------|---------|----------------|
| **Operational** | Daily academic tasks, ERP functions | Professional, clean, efficient |
| **Alert** | Active incidents, warnings | Heightened contrast, clear hierarchy |
| **Emergency** | Critical incidents, SOS, lockdowns | Stark, high-contrast, action-first |

### Anti-Patterns (Strictly Avoided)

- [FAIL] Glassmorphism cards with backdrop blur everywhere
- [FAIL] Gradient backgrounds as primary surfaces
- [FAIL] Decorative illustrations that dilute information density
- [FAIL] Generic Bootstrap-style cards and layouts
- [FAIL] Heavy drop shadows on every element
- [FAIL] Colorful sidebars that compete with data
- [FAIL] Generic icon-heavy hero sections
- [FAIL] Footer-heavy marketing layout patterns

---

## 2. Design System — Tokens

### CSS Custom Properties

```css
/* ─── FOUNDATION ─────────────────────────────────────────────── */
:root {
  /* Brand Identity */
  --brand-name: "CampusShield AI";

  /* ─── SURFACE PALETTE ─────────────────────────────────────── */
  /* Application shell and container surfaces */
  --surface-canvas:   #F8F9FB;   /* Page background */
  --surface-base:     #FFFFFF;   /* Card, panel backgrounds */
  --surface-raised:   #FFFFFF;   /* Elevated modals, dropdowns */
  --surface-overlay:  rgba(15, 23, 42, 0.6); /* Modal backdrops */
  --surface-sunken:   #F1F5F9;   /* Input backgrounds, inset sections */
  --surface-sidebar:  #0F172A;   /* Sidebar navigation */
  --surface-sidebar-hover: #1E293B; /* Sidebar item hover */
  --surface-topbar:   #FFFFFF;   /* Top navigation bar */

  /* ─── BORDER PALETTE ──────────────────────────────────────── */
  --border-subtle:    #E2E8F0;   /* Dividers, card borders */
  --border-default:   #CBD5E1;   /* Input borders */
  --border-strong:    #94A3B8;   /* Focused inputs, emphasis */
  --border-inverse:   #334155;   /* Borders on dark surfaces */

  /* ─── TEXT PALETTE ────────────────────────────────────────── */
  --text-primary:     #0F172A;   /* Headings, primary content */
  --text-secondary:   #475569;   /* Secondary labels, metadata */
  --text-tertiary:    #94A3B8;   /* Placeholders, disabled */
  --text-inverse:     #F8FAFC;   /* Text on dark surfaces */
  --text-inverse-muted: #94A3B8; /* Muted text on dark surfaces */

  /* ─── PRIMARY ACCENT — INSTITUTIONAL BLUE ────────────────── */
  --blue-50:   #EFF6FF;
  --blue-100:  #DBEAFE;
  --blue-200:  #BFDBFE;
  --blue-400:  #60A5FA;
  --blue-500:  #3B82F6;   /* Primary CTA, interactive elements */
  --blue-600:  #2563EB;   /* Primary hover */
  --blue-700:  #1D4ED8;   /* Primary active */
  --blue-900:  #1E3A8A;   /* Deep navy accent */

  /* ─── SEMANTIC — CRITICAL / DANGER (Red) ─────────────────── */
  /* ONLY for life-safety critical incidents, SOS, lockdowns */
  --red-50:    #FFF1F2;
  --red-100:   #FFE4E6;
  --red-400:   #F87171;
  --red-500:   #EF4444;   /* Critical severity */
  --red-600:   #DC2626;   /* Critical hover */
  --red-700:   #B91C1C;   /* Critical active/deep */

  /* ─── SEMANTIC — WARNING (Amber) ─────────────────────────── */
  /* High severity, warnings, cautions */
  --amber-50:  #FFFBEB;
  --amber-100: #FEF3C7;
  --amber-400: #FBBF24;
  --amber-500: #F59E0B;   /* High severity, warnings */
  --amber-600: #D97706;   /* Warning hover */

  /* ─── SEMANTIC — SUCCESS / SAFE (Green) ──────────────────── */
  /* Resolved, safe, success states */
  --green-50:  #F0FDF4;
  --green-100: #DCFCE7;
  --green-400: #4ADE80;
  --green-500: #22C55E;   /* Success, resolved, safe */
  --green-600: #16A34A;   /* Success hover */

  /* ─── SEMANTIC — NEUTRAL / INFO (Slate) ──────────────────── */
  /* Low severity, informational states */
  --slate-50:  #F8FAFC;
  --slate-100: #F1F5F9;
  --slate-200: #E2E8F0;
  --slate-300: #CBD5E1;
  --slate-400: #94A3B8;
  --slate-500: #64748B;
  --slate-600: #475569;
  --slate-700: #334155;
  --slate-800: #1E293B;
  --slate-900: #0F172A;

  /* ─── COMPONENT TOKENS ────────────────────────────────────── */
  --radius-sm:   4px;
  --radius-md:   8px;
  --radius-lg:   12px;
  --radius-xl:   16px;
  --radius-full: 9999px;

  /* ─── ELEVATION (Minimal, purposeful) ────────────────────── */
  --shadow-sm:  0 1px 2px 0 rgba(15, 23, 42, 0.05);
  --shadow-md:  0 4px 6px -1px rgba(15, 23, 42, 0.07), 0 2px 4px -2px rgba(15, 23, 42, 0.05);
  --shadow-lg:  0 10px 15px -3px rgba(15, 23, 42, 0.08), 0 4px 6px -4px rgba(15, 23, 42, 0.04);
  --shadow-xl:  0 20px 25px -5px rgba(15, 23, 42, 0.08), 0 8px 10px -6px rgba(15, 23, 42, 0.04);

  /* ─── TRANSITIONS ─────────────────────────────────────────── */
  --transition-fast:   150ms ease;
  --transition-base:   200ms ease;
  --transition-slow:   300ms ease;
}
```

---

## 3. Typography System

### Font Stack

```css
/* Primary: Inter — for all UI copy, labels, data */
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;

/* Monospace: Geist Mono — for IDs, codes, technical data */
--font-mono: 'Geist Mono', 'JetBrains Mono', 'Fira Code', monospace;
```

### Type Scale

| Token | Size | Weight | Line-height | Letter-spacing | Usage |
|-------|------|--------|------------|----------------|-------|
| `display-lg` | 36px / 2.25rem | 700 | 1.15 | -0.025em | Landing page hero |
| `display-md` | 30px / 1.875rem | 700 | 1.2 | -0.02em | Page-level headings |
| `display-sm` | 24px / 1.5rem | 600 | 1.25 | -0.015em | Section headings |
| `heading-lg` | 20px / 1.25rem | 600 | 1.3 | -0.01em | Card headings, dialog titles |
| `heading-md` | 16px / 1rem | 600 | 1.4 | -0.005em | Widget headings, labels |
| `heading-sm` | 14px / 0.875rem | 600 | 1.4 | 0em | Small headings, nav labels |
| `body-lg` | 16px / 1rem | 400 | 1.6 | 0em | Primary body copy |
| `body-md` | 14px / 0.875rem | 400 | 1.6 | 0em | Standard UI copy |
| `body-sm` | 13px / 0.8125rem | 400 | 1.5 | 0.01em | Secondary information |
| `caption` | 12px / 0.75rem | 400 | 1.4 | 0.02em | Timestamps, metadata |
| `label` | 12px / 0.75rem | 500 | 1.4 | 0.05em | Form labels, badge text |
| `mono-md` | 13px / 0.8125rem | 400 | 1.5 | 0em | IDs, incident numbers |
| `mono-sm` | 12px / 0.75rem | 400 | 1.4 | 0em | Technical codes |

### Typography Rules

- **No decorative fonts** — Inter only for all UI text
- **Numeric data**: Always use `font-variant-numeric: tabular-nums` for alignment in tables
- **IDs and codes**: Always monospace — incident numbers, visitor passes, employee IDs
- **Weight discipline**: Use 400 for body, 500 for labels/emphasis, 600 for headings, 700 for display only
- **No text-transform uppercase** on body copy; uppercase only for short `LABEL` tokens (12px, 0.05em tracking)

---

## 4. Color System

### Severity Color Matrix

The severity system is the most critical design decision in the platform. It must be immediately legible without training.

| Severity | Background (light) | Background (dark) | Text | Border | Icon | Usage |
|----------|-------------------|-------------------|------|--------|------|-------|
| **Critical** | `#FFF1F2` (red-50) | `#B91C1C` (red-700) | `#B91C1C` | `#FCA5A5` | `AlertOctagon` | Life-threatening, fire, assault, SOS |
| **High** | `#FFFBEB` (amber-50) | `#B45309` (amber-700) | `#92400E` | `#FCD34D` | `AlertTriangle` | Serious, needs urgent attention |
| **Medium** | `#EFF6FF` (blue-50) | `#1D4ED8` (blue-700) | `#1E40AF` | `#93C5FD` | `Info` | Concerning, respond within hours |
| **Low** | `#F0FDF4` (green-50) | `#15803D` (green-700) | `#166534` | `#86EFAC` | `CheckCircle` | Minor, normal operations |

### Status Color Matrix

| Status | Color Token | Dot Color | Badge Background |
|--------|-------------|-----------|-----------------|
| `reported` | blue-500 | `#3B82F6` | blue-50 |
| `acknowledged` | amber-500 | `#F59E0B` | amber-50 |
| `investigating` | amber-600 | `#D97706` | amber-100 |
| `responding` | blue-600 | `#2563EB` | blue-100 |
| `resolved` | green-500 | `#22C55E` | green-50 |
| `closed` | slate-400 | `#94A3B8` | slate-100 |
| `false_alarm` | slate-500 | `#64748B` | slate-100 |

### Role Color Accents (Sidebar context dots only)

| Role | Accent | Purpose |
|------|--------|---------|
| super_admin / admin | blue-500 | Authority |
| security | red-500 | Safety ops |
| faculty | slate-600 | Academic |
| student | blue-400 | Learning |
| parent | green-500 | Observation |
| warden | amber-500 | Residential |
| receptionist | slate-500 | Reception |

---

## 5. Spacing & Grid

### Spacing Scale (8px base unit)

```
4px   — xs   (tight, badge padding)
8px   — sm   (compact row gap)
12px  — md   (card internal padding small)
16px  — lg   (standard gap, card padding)
20px  — xl   (section gap)
24px  — 2xl  (card padding)
32px  — 3xl  (section padding)
40px  — 4xl  (page section gap)
48px  — 5xl  (hero spacing)
64px  — 6xl  (major section break)
```

### Layout Grid

```
Desktop (≥1280px):
  Dashboard shell: Sidebar(260px) + Content(flex-1)
  Content grid:    12-column, 24px gutters, 32px margin
  Max content width: 1440px (uncapped on Command Center)

Tablet (768px–1279px):
  Dashboard shell: Collapsed sidebar(60px) + Content(flex-1)
  Content grid:    8-column, 16px gutters, 24px margin

Mobile (<768px):
  Dashboard shell: Bottom nav + full-width content
  Content grid:    4-column, 16px gutters, 16px margin
```

### Page-Level Layout Regions

```
┌─────────────────────────────────────────────────────────┐
│  SIDEBAR (260px, fixed, left)                           │
│  ┌────────────────────────────────────────────────────┐ │
│  │ TOPBAR (64px, sticky, top)                         │ │
│  │────────────────────────────────────────────────────│ │
│  │ ALERT BANNER (conditional, 48px, pushes content)   │ │
│  │────────────────────────────────────────────────────│ │
│  │                                                    │ │
│  │  PAGE CONTENT AREA (flex-1, scroll)                │ │
│  │  ┌──────────────────────────────────────────────┐  │ │
│  │  │  Page Header (breadcrumb + title + actions)  │  │ │
│  │  │──────────────────────────────────────────────│  │ │
│  │  │                                              │  │ │
│  │  │  Main Content (role/page specific)           │  │ │
│  │  │                                              │  │ │
│  │  └──────────────────────────────────────────────┘  │ │
│  └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

---

## 6. Component Library

### 6.1 Sidebar Navigation

```
Component: <Sidebar />
Width: 260px (expanded) | 60px (collapsed)
Background: --surface-sidebar (#0F172A)
Position: fixed, left-0, full-height
Transition: width 200ms ease

Structure:
┌──────────────────────────────────────┐
│  [Logo mark]  CampusShield AI   [←] │  ← 60px header, collapse toggle
│──────────────────────────────────────│
│  [Avatar]  Harsh Patel              │  ← User identity block
│            Admin · CSE Dept         │  ← Role + department
│──────────────────────────────────────│
│  SAFETY                             │  ← Section label (12px, uppercase, slate-400)
│  [icon] Command Center              │  ← Nav item (active = blue-500 left border)
│  [icon] Incidents              [3]  │  ← With badge count
│  [icon] Campus Map                  │
│  [icon] Emergency Alerts       [1]  │
│──────────────────────────────────────│
│  OPERATIONS                         │
│  [icon] Security Dashboard          │
│  [icon] Visitor Management          │
│  [icon] AI Analytics                │
│  [icon] Audit Logs                  │
│──────────────────────────────────────│
│  ACADEMIC ERP                       │
│  [icon] Attendance                  │
│  [icon] Timetable                   │
│  [icon] Complaints                  │
│  [icon] Placements                  │
│  [icon] Hostel                      │
│──────────────────────────────────────│
│  (spacer, flex-1)                   │
│──────────────────────────────────────│
│  [icon] Settings                    │
│  [icon] Logout                      │
└──────────────────────────────────────┘

Nav Item anatomy:
┌────────────────────────────────────┐
│ [4px accent] [icon 18px] Label [badge] │
└────────────────────────────────────┘
Active state: 4px left blue-500 border, slate-800 bg, white text
Hover state: slate-800 bg, slate-200 text, 150ms transition
Inactive: transparent bg, slate-400 text
```

### 6.2 Topbar

```
Component: <Topbar />
Height: 64px
Background: --surface-topbar (#FFFFFF)
Border-bottom: 1px solid --border-subtle
Position: sticky top-0, z-50

Structure:
┌─────────────────────────────────────────────────────────────┐
│  [Breadcrumb: Home / Command Center]    [Search]  [3] [?] │
│                                                             │
│                              │──────────│  [Avatar] Harsh ▾ │
└─────────────────────────────────────────────────────────────┘

Left:    Breadcrumb navigation (text-secondary, ">" separator)
Center:  Global search bar (280px, slate-100 bg, Search icon)
Right:   Help icon | Notification bell with badge | User avatar dropdown

User dropdown:
  Profile | Settings | Switch Role (admin only) | ─── | Sign Out
```

### 6.3 Alert Banner

```
Component: <AlertBanner />
Height: 48px
Position: below topbar, above page content
Renders conditionally when emergency_alerts.is_active = true

Critical alert:
  Background: red-600
  Text: white
  [AlertOctagon icon] LOCKDOWN IN EFFECT: Chemistry Lab — Remain indoors · Updated 2 min ago  [Dismiss (admin)]

High alert:
  Background: amber-500
  Text: white (high contrast)
  [AlertTriangle] Weather Warning: Heavy rain expected. Outdoor events suspended.

Multiple alerts: Rotates with "1 of 3 alerts" counter, prev/next chevrons
Pulse animation on critical only (subtle opacity pulse, 2s, no movement)
```

### 6.4 Stat Card

```
Component: <StatCard />
Background: white
Border: 1px solid --border-subtle
Border-radius: --radius-lg (12px)
Padding: 20px 24px
Shadow: --shadow-sm

Anatomy:
┌──────────────────────────────────────────┐
│  [Icon 20px]     [Trend indicator]       │
│                                          │
│  42                          ↑ 12%      │
│  Active Incidents             vs last wk │
│                                          │
│  ████████████░░░░  [Progress optional]  │
└──────────────────────────────────────────┘

Variants:
  default:   white bg, slate icon
  critical:  red-50 bg, red border-l-4, red icon
  warning:   amber-50 bg, amber border-l-4, amber icon
  success:   green-50 bg, green border-l-4, green icon
  primary:   blue-50 bg, blue border-l-4, blue icon

Number: 36px, 700 weight, text-primary
Label: 14px, 400, text-secondary
Trend: 12px, green-600 (positive) or red-600 (negative)
Icon: Lucide, 20px, in 40px circle with tinted background
```

### 6.5 Incident Card

```
Component: <IncidentCard />
Background: white
Border: 1px solid --border-subtle
Border-radius: --radius-lg
Padding: 16px 20px
Left accent border: 4px solid (severity color)

Anatomy:
┌──[critical left border]───────────────────────────────────┐
│  INC-20260821-0042          [CRITICAL badge]  [FIRE badge] │
│  ──────────────────────────────────────────────────────── │
│  Fire at Chemistry Laboratory, 2nd Floor                   │
│  Sciences Block · Reported by Priya S. (Student)           │
│  ──────────────────────────────────────────────────────── │
│  AI Confidence: ●●●●● 95%                  AI Classified │
│  Assigned: Officer Sharma (Security Ops)                   │
│  ──────────────────────────────────────────────────────── │
│  [ Sciences Block]  [ 2 min ago]  [RESPONDING →]      │
└────────────────────────────────────────────────────────────┘

Critical variant: red-50 tinted background, pulsing left border
AI confidence: dot indicator (5 filled = 100%, proportional)
Status chip: colored badge, right-aligned
Action button: "View Details →" or "Acknowledge" (role-dependent)
```

### 6.6 Severity Badge

```
Component: <SeverityBadge />
Sizes: sm (20px h) | md (24px h) | lg (28px h)

CRITICAL  → red-700 text, red-100 bg, red-200 border
HIGH      → amber-700 text, amber-100 bg, amber-200 border
MEDIUM    → blue-700 text, blue-100 bg, blue-200 border
LOW       → green-700 text, green-100 bg, green-200 border

Typography: 11px, 600 weight, 0.04em letter-spacing, uppercase
Border-radius: --radius-full
Padding: 2px 8px (sm), 3px 10px (md), 4px 12px (lg)

AI Classified variant: adds robot icon prefix [ CRITICAL]
```

### 6.7 Data Table

```
Component: <DataTable />
Container: white bg, border, border-radius-lg, overflow-hidden

Header row:
  Background: slate-50
  Font: 12px, 600, uppercase, slate-500, 0.05em tracking
  Padding: 12px 16px
  Border-bottom: 1px solid border-subtle
  Sortable columns: up/down arrows, hover state

Data rows:
  Padding: 14px 16px
  Border-bottom: 1px solid border-subtle (last row no border)
  Font: 14px, text-primary
  Hover: slate-50 background, 150ms

Zebra: Disabled (use hover instead for clean look)
Pagination: below table, right-aligned
  "[←] Previous    Page 1 of 12    Next [→]"
  Items per page: 10 / 25 / 50 dropdown
  Total count: "Showing 1–25 of 284 incidents"

Column types:
  Text: left-aligned
  Numbers: right-aligned, tabular-nums
  Badges/chips: left or centered
  Actions: right-aligned, icon buttons only (no text on table rows)
  Timestamps: mono-sm, text-secondary, right-aligned
  Checkboxes: 40px fixed width, left
```

### 6.8 SOS Button

```
Component: <SOSButton />
Only shown for: student, faculty roles

Size: 56px × 56px circle (floating) | Full variant: 100%×48px button
Background: red-600
Icon: Phone (24px white)
Label (full variant): "SOS — Get Help Now"
Shadow: 0 4px 14px rgba(220, 38, 38, 0.4)

Float position: Fixed, bottom-24px, right-24px
Float behavior: Expand on hover to show "EMERGENCY SOS" label

Activation:
  Press: 3-second hold with circular progress indicator
  Purpose: Prevent accidental triggers
  On confirm: Pulse animation, sends SOS, shows "Help is on the way" state

States:
  default:   red-600 bg
  hold:      red-700 bg + circular countdown ring
  confirmed: green-600 bg + CheckCircle icon + "Help Coming"
  disabled:  slate-300 (when already active SOS)
```

### 6.9 AI Insight Card

```
Component: <AIInsightCard />
Background: white
Border: 1px solid blue-100
Border-left: 4px solid blue-500
Border-radius: --radius-lg
Padding: 16px 20px

Anatomy:
┌──[blue left border]──────────────────────────────────────┐
│  [Sparkles icon blue-500]  AI Safety Insight             │
│  Confidence: 91% · Generated 5 min ago                   │
│  ──────────────────────────────────────────────────────  │
│  3 fire-related incidents in Sciences Block over the     │
│  past semester. Risk pattern detected.                   │
│  ──────────────────────────────────────────────────────  │
│  Recommended Actions:                                    │
│  • Schedule fire extinguisher audit (Maintenance)        │
│  • Mandatory lab safety refresher (Faculty)              │
│  • Increase security patrols (Security Ops)             │
│                                              [Review →] │
└──────────────────────────────────────────────────────────┘

"AI Generated" disclaimer: 12px, slate-400, italic
Loading state: Skeleton with "AI is analyzing..." animated dots
Error state: Amber warning, "AI unavailable — manual review required"
```

### 6.10 Live Feed Panel

```
Component: <LiveFeedPanel />
Background: slate-900 (dark)
Width: 320px (right sidebar variant) or full-width panel

Header:
  "LIVE FEED" — 11px uppercase, slate-400
  [●] LIVE — pulsing green dot, "Connected" or "Reconnecting..."

Feed items (newest top):
┌───────────────────────────────────────────┐
│  ●  INC-0042 · CRITICAL · Fire            │
│     Sciences Block · 2 min ago            │
│──────────────────────────────────────────│
│  ○  Visitor PASS-0391 checked out         │
│     Main Gate · 5 min ago                 │
│──────────────────────────────────────────│
│  ●  SOS Alert — Priya S. · RESOLVED      │
│     Hostel B · 12 min ago                │
└───────────────────────────────────────────┘

New item animation: Slide in from top, 300ms ease-out
Dot color: severity color for incidents, slate for others
Max displayed: 20 items, "Load more" below
```

### 6.11 Timeline Component

```
Component: <IncidentTimeline />

Structure: Vertical line with event nodes

┌────────────────────────────────────────────────┐
│  ● [Reported]              08:42 AM, Aug 21    │
│  │  Priya S. filed incident report             │
│  │  Category: Fire · Severity: Critical        │
│  │                                             │
│  ● [AI Classified]         08:42:04 AM (4s)   │
│  │  Gemini AI analyzed report                  │
│  │  Severity: CRITICAL · Confidence: 0.95      │
│  │  Recommended: Security + Fire Dept          │
│  │  [View AI Response →]                      │
│  │                                             │
│  ● [Acknowledged]          08:43 AM (+1 min)  │
│  │  Officer Sharma acknowledged incident       │
│  │                                             │
│  ● [Responding]            08:45 AM (+3 min)  │
│  │  Security team dispatched to Sciences Block │
│  │                                             │
│  ○ [Pending Resolution]                        │
└────────────────────────────────────────────────┘

Node colors: Severity-appropriate or action type
Internal-only events: Shown with lock icon, admin/security only
AI events: Blue node with Sparkles icon
System events: Slate node
Human actions: Colored by actor role
```

### 6.12 Campus Map Pin

```
Component: <MapPin />
Shape: Teardrop (standard map pin, 32px×40px)
Colors: severity-mapped
  Critical: red-600 fill, white ring glow
  High:     amber-500 fill
  Medium:   blue-500 fill
  Low:      green-500 fill
  SOS:      red-700 fill, pulsing ring animation

Active SOS pin: Concentric rings, 2s pulse, 3 rings expanding outward
Hover: Tooltip with incident summary (IncidentCard compact)
Click: Opens incident panel slide-in from right
```

---

## 7. Layout Architecture

### Shell Components

```
Authenticated layout (src/app/(dashboard)/layout.tsx):
┌────────────────────────────────────────────────────────────┐
│ <Sidebar role={role} />     │  <div class="flex flex-col"> │
│                             │    <Topbar />                │
│ 260px, fixed                │    <AlertBanner />           │
│                             │    <main>{children}</main>   │
│                             │  </div>                      │
└────────────────────────────────────────────────────────────┘

Command Center override (full-screen, no content padding):
  Same shell but main has p-0, grid layout fills viewport
```

### Page Header Pattern

```
Component: <PageHeader />
Height: variable (80px typical)
Padding: 24px 32px

┌──────────────────────────────────────────────────────┐
│  Dashboard / Incidents                               │  ← Breadcrumb
│  Incident Management                    [+ Report]  │  ← Title + CTA
│  24 active · 6 critical · Last updated 30s ago     │  ← Subtitle/meta
└──────────────────────────────────────────────────────┘

Left: Breadcrumb (slate-400 separator) + H1 page title + subtitle
Right: Primary CTA button + optional secondary actions
Border-bottom: 1px solid border-subtle
Background: Inherits page background
```

### Card Grid Patterns

```
Stats row (4-up):
  grid-cols-4, gap-6 (desktop)
  grid-cols-2, gap-4 (tablet)
  grid-cols-1, gap-4 (mobile)

Content grid (primary + sidebar):
  grid-cols-[1fr_320px], gap-6 (desktop)
  grid-cols-1, gap-4 (tablet/mobile, sidebar stacks below)

3-column content:
  grid-cols-3, gap-6 (desktop)
  grid-cols-2 + 1 full-width (tablet)
  grid-cols-1 (mobile)
```

---

## 8. Page Designs

---

### 8.1 Landing Page

**Route**: `/` (public, pre-auth)  
**Audience**: Prospective institutions, evaluators, unauthenticated visitors

```
┌─────────────────────────────────────────────────────────────────┐
│  NAVBAR (sticky, white, border-bottom)                          │
│  [CampusShield AI logo]          [Features] [Security] [Login] │
│                                          [Get Demo →] (blue)   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  HERO SECTION (min-h-screen, slate-900 background)             │
│                                                                 │
│  [Centered content, max-w-4xl, py-24]                          │
│                                                                 │
│  [Shield icon, 48px, blue-400]                                  │
│  [Badge: AI-POWERED · REAL-TIME SAFETY]                        │
│                                                                 │
│  Enterprise Campus Safety &                                     │
│  Intelligence Platform                                          │
│  [display-lg, 700, white, -0.025em tracking]                   │
│                                                                 │
│  Unified incident response, AI-powered risk intelligence,       │
│  and complete ERP in one institutional-grade platform.          │
│  [body-lg, slate-400, max-w-2xl]                               │
│                                                                 │
│  [Request Demo →] [blue-500 bg, white text, 48px h]            │
│  [View Platform →] [transparent, white border, 48px h]         │
│                                                                 │
│  ─────────────────────────────────────────────────             │
│  Trusted by institutions managing 50,000+ students             │
│  [Logos: 5 placeholder institution marks, grayscale]           │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  COMMAND CENTER PREVIEW (white bg, py-24)                       │
│                                                                 │
│  [Label: THE SAFETY COMMAND CENTER]                             │
│  Live Campus Situational Awareness                              │
│                                                                 │
│  [Realistic dashboard screenshot/mockup, max-w-6xl]            │
│  [Rounded-xl border, shadow-xl, subtle zoom animation on load] │
│  Caption: Real-time incident monitoring · AI classification     │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  FEATURES GRID (slate-50 bg, py-24)                            │
│                                                                 │
│  Why CampusShield AI?                                          │
│  [3-column grid, gap-8]                                        │
│                                                                 │
│  ┌────────────────────┐ ┌────────────────────┐ ┌────────────┐  │
│  │ [Shield icon]      │ │ [Sparkles icon]    │ │ [Map icon] │  │
│  │ AI-Classified      │ │ Predictive Risk    │ │ Live Campus│  │
│  │ Incidents          │ │ Intelligence       │ │ Safety Map │  │
│  │                    │ │                    │ │            │  │
│  │ Gemini AI triages  │ │ Pattern detection  │ │ Real-time  │  │
│  │ every report with  │ │ across incident    │ │ incident   │  │
│  │ 95%+ accuracy in   │ │ history with       │ │ pins with  │  │
│  │ under 4 seconds.   │ │ actionable recs.   │ │ severity.  │  │
│  └────────────────────┘ └────────────────────┘ └────────────┘  │
│                                                                 │
│  + 3 more: SOS Response | Complete ERP | Audit Compliance      │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  ROLE SHOWCASE (white, py-24)                                   │
│                                                                 │
│  Built for Every Stakeholder                                    │
│  [Tab row: Admin | Security | Faculty | Students | Parents]    │
│                                                                 │
│  [Selected tab content animates in]                            │
│  [Left: role description + feature list]                       │
│  [Right: screen preview, rounded-lg, shadow]                   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  CTA SECTION (slate-900 bg, py-24, centered)                   │
│  Ready to secure your campus?                                   │
│  [Request Demo →]  [Talk to Sales]                             │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  FOOTER (slate-900 bg, border-top border-slate-800, py-12)     │
│  [Logo]   Product | Security | Legal | Contact                 │
│           © 2026 CampusShield AI. All rights reserved.         │
└─────────────────────────────────────────────────────────────────┘
```

---

### 8.2 Login

**Route**: `/login` (public)  
**Layout**: Full-screen split, no sidebar/topbar

```
┌──────────────────────────────────────────────────────────────────┐
│   LEFT PANEL (50vw, slate-900 bg)  │  RIGHT PANEL (50vw, white)  │
│                                    │                              │
│  [Centered content, max-w-md]      │  [Centered form, max-w-sm]  │
│                                    │                              │
│  [Shield logo, 48px, blue-400]     │  Sign in to                 │
│  CampusShield AI                   │  CampusShield AI            │
│  [display-sm, white]               │  [heading-lg, text-primary]  │
│                                    │                              │
│  Your campus.                      │  [Label] Email address      │
│  Protected.                        │  [Input, full width]        │
│  [display-md, 700, white]          │                              │
│                                    │  [Label] Password           │
│  ──────────────────                │  [Input+show toggle]        │
│                                    │  [Forgot password? →]       │
│  [Role pills: Student | Faculty    │                              │
│   Admin | Security | Parent]       │  [Sign In →] (blue-600, full│
│  [slate-700 bg, white text]        │   width, 48px)              │
│                                    │                              │
│  ──────────────────                │  ─────────────────────────  │
│                                    │  Demo Access:               │
│  "AI classification reduced our    │  [Student] [Admin] [Securi] │
│   incident response time by 73%"   │  [Faculty] [Parent]         │
│   — Campus Safety Officer          │  [Quick-login chips,        │
│  [slate-400, italic, 14px]         │   slate-100 bg]             │
│                                    │                              │
│                                    │  Don't have an account?     │
│                                    │  Contact your administrator │
└────────────────────────────────────┴──────────────────────────────┘

Mobile: Single column, left panel content collapses to a compact
        header banner (slate-900, 80px) above the form.

Form validation:
  Error state: red border + red helper text below field
  Success: No visual change until navigation
  Loading: Button shows spinner, disabled state
```

---

### 8.3 Admin Dashboard

**Route**: `/` → redirect to `/admin` (admin, super_admin roles)  
**Primary user**: Institution administrators, HODs

```
PAGE HEADER:
  "Good morning, Dr. Kumar"  [display-sm]
  Thursday, 21 August 2026 · Institution Overview  [caption, slate-500]
  Right: [+ New Alert] [View Command Center →]

─────────────────────────────────────────────────────────────────

ROW 1: CRITICAL STAT CARDS (4-column)
┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│ [AlertOct]  │ │ [Activity]  │ │ [Users]     │ │ [Shield]    │
│     6       │ │    24       │ │  2,847      │ │    98.2%    │
│ Critical    │ │ Active      │ │ On Campus   │ │ Safety      │
│ Incidents   │ │ Incidents   │ │ Today       │ │ Score       │
│ ↑ 2 today  │ │ ↓ 3 vs yest │ │ ─────────── │ │ ↑ 1.2%     │
│ [red card]  │ │ [amber card]│ │ [blue card] │ │[green card] │
└─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘

─────────────────────────────────────────────────────────────────

ROW 2: MAIN CONTENT (2/3 + 1/3 grid)

LEFT (2/3):
┌─────────────────────────────────────────────────────────────┐
│  Recent Critical & High Incidents        [View All →]       │
│  ─────────────────────────────────────────────────────────  │
│  [IncidentCard: CRITICAL] Fire — Chemistry Lab   2m ago    │
│  [IncidentCard: HIGH]     Theft — Library         1h ago   │
│  [IncidentCard: MEDIUM]   Vandalism — Parking     2h ago   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  Incident Trend — Last 30 Days                              │
│  [Line chart, Recharts, slate-900 line + blue area fill]    │
│  X: dates, Y: incident count, Tooltip on hover              │
│  Legend: Total | Critical | Resolved                        │
└─────────────────────────────────────────────────────────────┘

RIGHT (1/3):
┌───────────────────────────┐
│  Active Alerts       [+]  │
│  ─────────────────────── │
│  [red] Chem Lab lockdown  │
│  [amber] Weather advisory │
│                           │
│  ─────────────────────── │
│  Incident Categories      │
│  [Donut chart, 200px]    │
│  Fire 18% | Theft 24%    │
│  Medical 15% | Other 43% │
│                           │
│  ─────────────────────── │
│  Department Response      │
│  Security   ████ 94%     │
│  Medical    ███░ 87%     │
│  Maint.     ██░░ 71%     │
└───────────────────────────┘

─────────────────────────────────────────────────────────────────

ROW 3: ERP SUMMARY (3-column)
┌───────────────────┐ ┌───────────────────┐ ┌───────────────────┐
│ Attendance Today  │ │ Visitor Activity  │ │ Placement Updates │
│ 94.2% (2,678/2,84)│ │ 12 checked in    │ │ 3 drives upcoming │
│ [Sparkline chart] │ │ 3 pending         │ │ 47 registrations  │
│ [View Attendance] │ │ [View Visitors]   │ │ [View Placements] │
└───────────────────┘ └───────────────────┘ └───────────────────┘

─────────────────────────────────────────────────────────────────

ROW 4: AI INSIGHTS
┌─────────────────────────────────────────────────────────────┐
│  [AIInsightCard] 3 patterns detected this week              │
│  Sciences Block fire risk · Hostel B noise complaints       │
│  Library theft cluster · [View Full Analytics →]            │
└─────────────────────────────────────────────────────────────┘
```

---

### 8.4 Student Dashboard

**Route**: `/student` (student role)  
**Primary user**: Students accessing their academic + safety info

```
PAGE HEADER:
  "Good morning, Priya"
  B.Tech CSE · Semester 5 · Section A · Roll: CS2022041
  Right: [Report Incident] [SOS ↗]

─────────────────────────────────────────────────────────────────

EMERGENCY QUICK ACTIONS (prominent, if no active alerts: subtle)
┌─────────────────────────────────────────────────────────────┐
│  [AlertTriangle amber]  Campus Safety                       │
│  [Report Incident →] (blue outline)  [SOS Emergency] (red) │
└─────────────────────────────────────────────────────────────┘

─────────────────────────────────────────────────────────────────

ROW 1: MY ACADEMIC SNAPSHOT (4-column stats)
┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐
│ Attendance │ │ CGPA       │ │ Next Class │ │ Active     │
│   87.4%   │ │   8.2      │ │ 11:00 AM   │ │ Complaints │
│ [amber]   │ │ [green]    │ │ DS Lab 204 │ │     1      │
└────────────┘ └────────────┘ └────────────┘ └────────────┘

─────────────────────────────────────────────────────────────────

ROW 2: TODAY'S SCHEDULE + CAMPUS STATUS (2/3 + 1/3)

LEFT:
┌─────────────────────────────────────────────────┐
│  Today's Timetable — Thursday, Aug 21           │
│  ─────────────────────────────────────────────  │
│  09:00-10:00  Mathematics III    Room 301 past │
│  10:00-11:00  Data Structures    Lab 204  ← NOW │
│  11:00-12:00  Computer Networks  Room 205       │
│  [Timeline-style, current slot highlighted blue] │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│  My Attendance — This Semester                  │
│  [Progress bars per subject, color by ≥75%]     │
│  Mathematics     ████████░░  82%               │
│  Data Structures ██████████  96%               │
│  Networks        ██████░░░░  71% [amber ]    │
└─────────────────────────────────────────────────┘

RIGHT:
┌──────────────────────────┐
│  Campus Status    [●Live]│
│  ─────────────────────── │
│  [●] All Clear           │
│  No active emergencies   │
│  ─────────────────────── │
│  My Incidents            │
│  1 Open · 2 Resolved     │
│  [View My Incidents →]   │
│  ─────────────────────── │
│  Hostel Info             │
│  Block B · Room 214      │
│  [Warden: Mrs. Mehta]    │
│  ─────────────────────── │
│  Placement Update        │
│  TCS drive in 3 days     │
│  [Register by Aug 24]    │
└──────────────────────────┘

─────────────────────────────────────────────────────────────────

ROW 3: ANNOUNCEMENTS
┌─────────────────────────────────────────────────────────────┐
│  Campus Announcements                       [All →]         │
│  ─────────────────────────────────────────────────────────  │
│  [ URGENT] Mid-term exam schedule released · Admin · 1h  │
│  [Normal] Sports day on Saturday — Register by 5PM · 4h    │
│  [Normal] Library extended hours this week · Library · 1d  │
└─────────────────────────────────────────────────────────────┘

FLOATING SOS BUTTON: Fixed bottom-right (red circle, 56px)
```

---

### 8.5 Security Dashboard

**Route**: `/security` (security role)  
**Primary user**: Security officers, shift supervisors

```
PAGE HEADER:
  Security Operations                [ LIVE]
  Shift: Morning (06:00-14:00) · Officer Sharma · Sector: North Zone
  Right: [New Incident] [Dispatch →] [Command Center ↗]

─────────────────────────────────────────────────────────────────

PRIORITY QUEUE (full width, red-50 bg if critical)
┌─────────────────────────────────────────────────────────────┐
│  REQUIRES ACTION                                            │
│  ─────────────────────────────────────────────────────────  │
│  [CRITICAL] INC-0042  Fire — Chemistry Lab  [Acknowledge]  │
│  [HIGH]     INC-0039  Suspicious activity   [Respond]      │
└─────────────────────────────────────────────────────────────┘

─────────────────────────────────────────────────────────────────

ROW 1: SECURITY STATS (5-column, compact)
┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│Active SOS│ │Open INC  │ │Visitors  │ │On Duty   │ │Avg Resp  │
│    0     │ │   24     │ │   12     │ │    6     │ │  4.2 min │
│[green ] │ │[amber ] │ │[blue]    │ │[slate]   │ │[green]   │
└──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘

─────────────────────────────────────────────────────────────────

ROW 2: LIVE OPERATIONS (3-column)

COL 1: ACTIVE INCIDENTS LIST
┌──────────────────────────────┐
│  Active Incidents    Sort ▾  │
│  ─────────────────────────── │
│  [CRITICAL] Chem Lab         │
│  [HIGH]     Library theft    │
│  [MEDIUM]   Parking issue    │
│  [MEDIUM]   Hostel B noise   │
│  [LOW]      Broken fence     │
│  ─────────────────────────── │
│  [View All 24 →]             │
└──────────────────────────────┘

COL 2: MINI CAMPUS MAP
┌──────────────────────────────┐
│  Live Map     [Expand ↗]    │
│  [SVG campus map, 300px]    │
│  [Red pin: Chem Lab]        │
│  [Amber pin: Library]       │
│  [View Full Map →]          │
└──────────────────────────────┘

COL 3: LIVE FEED + SOS
┌──────────────────────────────┐
│  LIVE FEED        [●] LIVE  │
│  [Dark panel, LiveFeedPanel] │
│  ─────────────────────────── │
│  SOS Alerts                  │
│  [green] No active SOS       │
│  Last: Priya S. · 2h ago    │
│  [Resolved] · 3 min resp.   │
└──────────────────────────────┘

─────────────────────────────────────────────────────────────────

ROW 3: VISITOR LOG + AI INSIGHTS (2-column)
┌────────────────────────────────┐ ┌──────────────────────────────┐
│  Today's Visitors (12)         │ │  AI Risk Assessment          │
│  [Compact table: Name, Host,   │ │  [AIInsightCard]             │
│  Check-in, Status, Action]     │ │  High-risk periods detected  │
│  [View All Visitors →]         │ │  Thursday 6-8pm: Elevated    │
└────────────────────────────────┘ └──────────────────────────────┘
```

---

### 8.6 Faculty Dashboard

**Route**: `/faculty` (faculty role)  
**Primary user**: Faculty members for academic management + safety

```
PAGE HEADER:
  Welcome, Prof. Meera Nair
  Associate Professor · Computer Science · Office: Room 412
  Right: [Report Incident] [Mark Attendance]

─────────────────────────────────────────────────────────────────

ROW 1: FACULTY STATS (4-column)
┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐
│ My Classes │ │ Avg Attend │ │ Pending    │ │ Incidents  │
│  Today: 3  │ │   81.4%   │ │ Attendance │ │ Reported   │
│ Total: 5   │ │ [amber]   │ │    2 cls   │ │     1      │
└────────────┘ └────────────┘ └────────────┘ └────────────┘

ROW 2: TODAY'S SCHEDULE + MY CLASSES (2/3 + 1/3)

LEFT: Today's teaching schedule (timeline similar to student)
      + per-class: Attendance marked? / Mark Now button

RIGHT:
  My Students at Risk
  (attendance <75%): Student list, percentage, [Notify]
  
  My Incidents
  1 filed, 0 pending response

ROW 3: ATTENDANCE QUICK-MARK
  Subject selector → Date (today) → Student list with checkboxes
  [Mark All Present] [Submit Attendance] (bulk actions)

ROW 4: ANNOUNCEMENTS (same as student, filtered by role)
```

---

### 8.7 Parent Dashboard

**Route**: `/parent-portal` (parent role)  
**Primary user**: Parents monitoring their ward's academic + safety status

```
PAGE HEADER:
  Parent Portal
  Viewing: Priya Patel (CS2022041) · B.Tech CSE Sem 5
  Right: [Emergency Contact] [Switch Ward ▾] (if multiple children)

─────────────────────────────────────────────────────────────────

SAFETY STATUS BANNER (prominent, green if all clear)
┌─────────────────────────────────────────────────────────────┐
│  [CheckCircle green]  Priya is Safe                        │
│  Last seen on campus: 10:32 AM today · Current: Lab 204    │
│  No active emergencies on campus                           │
└─────────────────────────────────────────────────────────────┘

[If danger: Red banner, SOS info, security contact]

─────────────────────────────────────────────────────────────────

ROW 1: WARD STATUS (4-column)
┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐
│ Attendance │ │ CGPA       │ │ Hostel     │ │ Transport  │
│   87.4%   │ │   8.2      │ │ Room B-214 │ │ Bus Route 3│
└────────────┘ └────────────┘ └────────────┘ └────────────┘

ROW 2: ACADEMIC SUMMARY + RECENT ACTIVITY (2/3 + 1/3)

LEFT:
  Today's schedule (read-only view)
  Attendance per subject (progress bars)
  Recent exam results (if available)

RIGHT:
  Recent Alerts & Updates
  [green] Attendance marked for DS Lab
  [amber] Networks attendance at 71% — below threshold
  Campus Announcements (filtered)

ROW 3: HOSTEL + TRANSPORT INFO
  Room allocation details | Mess schedule | Transport stop times
  Emergency contacts (Warden, Security hotline)
```

---

### 8.8 Hostel Dashboard

**Route**: `/hostel` (warden, admin roles)  
**Primary user**: Hostel wardens, administrators

```
PAGE HEADER:
  Hostel Management — Block B (Girls)
  Warden: Mrs. Mehta · 84 Rooms · 168 Capacity
  Right: [+ Allocate Room] [+ Report Issue]

─────────────────────────────────────────────────────────────────

ROW 1: HOSTEL STATS (4-column)
┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐
│ Occupancy  │ │ Available  │ │ Maintenance│ │ Complaints │
│ 156/168    │ │    12      │ │     3      │ │     2      │
│   92.8%   │ │ [green]    │ │ [amber]    │ │ [blue]     │
└────────────┘ └────────────┘ └────────────┘ └────────────┘

ROW 2: ROOM GRID + OCCUPANT LIST (1/2 + 1/2)

LEFT: Room Grid Visual
  Visual grid of all rooms (block layout)
  Color coded: green=occupied, amber=partial, red=maintenance, slate=empty
  Click room → room detail slide-in

RIGHT: Quick Lists
  Late Returns (after curfew 10PM)
  Recent Complaints
  Maintenance Issues

ROW 3: ALLOCATIONS TABLE
  DataTable: Room | Block | Students | Status | Actions
  Filters: Block | Status | Search by student

ROW 4: COMPLAINTS (hostel-category)
  Open complaints for this hostel block
```

---

### 8.9 Placement Dashboard

**Route**: `/placements` (admin, student roles — different views)  
**Primary user**: Placement office, students

```
──── ADMIN/PLACEMENT OFFICER VIEW ────────────────────────────────

PAGE HEADER:
  Placement Management 2025-26
  3 drives upcoming · 47 total registrations · 12 offers made
  Right: [+ New Drive]

ROW 1: PLACEMENT STATS (4-column)
┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐
│ Companies  │ │ Drives     │ │ Registered │ │ Placed     │
│    8       │ │  3 active  │ │   234      │ │    12      │
└────────────┘ └────────────┘ └────────────┘ └────────────┘

DRIVES TABLE:
  Company | Role | Package | Drive Date | Eligible | Registered | Status | Actions

REGISTRATION MANAGEMENT:
  Per-drive: view applicants, shortlist, mark results

──── STUDENT VIEW ────────────────────────────────────────────────

PAGE HEADER:
  Placement Portal — Your Opportunities
  Eligible for 5 upcoming drives · 2 registered
  Right: [View Profile]

UPCOMING DRIVES (card grid, 3-col):
┌──────────────────────┐
│  TCS Digital          │
│  Software Engineer    │
│  ₹7.5 LPA            │
│  Drive: Aug 24, 2026  │
│  B.Tech CSE/IT · CGPA≥7.0│
│  [ You're eligible] │
│  [Register →]        │
└──────────────────────┘

MY REGISTRATIONS: List with status chips (Applied/Shortlisted/Offered/Rejected)
PACKAGE ANALYSIS: Simple bar chart of packages by company
```

---

### 8.10 Incident Reporting

**Route**: `/incidents/new` (all authenticated except parent)  
**Primary user**: Anyone reporting a safety incident

```
PAGE HEADER:
  Report an Incident
  Your identity is protected. All reports are handled confidentially.
  Right: [Cancel]

─────────────────────────────────────────────────────────────────

LAYOUT: Single-column, max-w-2xl, centered

FORM STRUCTURE:
┌─────────────────────────────────────────────────────────────┐
│  Step 1 of 2: Incident Details                              │
│  ● ─────── ○                                               │
│  [Progress: 50%]                                           │
└─────────────────────────────────────────────────────────────┘

SECTION 1: What happened?
┌─────────────────────────────────────────────────────────────┐
│  Describe the incident *                                    │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Tell us what happened in as much detail as possible.│   │
│  │ Include: what, where, who was involved, when.       │   │
│  │                                              0/2000 │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Location *                                                 │
│  [Campus Location dropdown — from campus_locations table]   │
│  [Or: describe location freely ─────────────────────────]  │
│                                                             │
│  Date & Time of Incident *                                  │
│  [Date picker] [Time picker]                                │
└─────────────────────────────────────────────────────────────┘

AI ANALYSIS PANEL (appears after typing 50+ chars, non-blocking):
┌─────────────────────────────────────────────────────────────┐
│  [Sparkles blue]  AI Safety Analysis                        │
│  ─────────────────────────────────────────────────────────  │
│  Analyzing...                                               │
│                                                             │
│  [After response]                                           │
│  Category:  [FIRE badge]          Severity: [CRITICAL badge]│
│  Confidence: ●●●●● 95%                                     │
│  Summary: Potential fire incident at laboratory facility.   │
│  Routed to: Security Operations + Fire Safety Team         │
│  Recommended: Evacuate area, contact security immediately   │
│                                                             │
│  You may override the AI classification below.             │
└─────────────────────────────────────────────────────────────┘

SECTION 2: Classification (pre-filled by AI, user can override)
┌─────────────────────────────────────────────────────────────┐
│  Category (AI Suggested: Fire)                              │
│  [Category picker, 6-column icon grid]                     │
│  Fire  Medical  Substance  Vandalism               │
│  [ALERT]Assault  Harassment  Suspicious  Natural           │
│  Infrastructure  Traffic  Cybercrime  Other          │
│                                                             │
│  Severity (AI Suggested: Critical)                         │
│  ○ Low  ○ Medium  ● Critical [pre-selected]               │
└─────────────────────────────────────────────────────────────┘

SECTION 3: Evidence & Privacy
┌─────────────────────────────────────────────────────────────┐
│  Attach Evidence (optional)                                 │
│  [Dropzone: "Drop files or click to upload"]               │
│  Supported: JPG, PNG, MP4, PDF · Max 50MB                  │
│                                                             │
│    Report anonymously                                      │
│     Your name will not be shown to anyone except admins    │
└─────────────────────────────────────────────────────────────┘

SUBMIT:
┌─────────────────────────────────────────────────────────────┐
│  [← Back]                        [Submit Report →] (blue)  │
└─────────────────────────────────────────────────────────────┘

SUCCESS STATE (full-width, replaces form):
┌─────────────────────────────────────────────────────────────┐
│  [CheckCircle green, 64px]                                  │
│  Incident Reported Successfully                             │
│  INC-20260821-0043  [copy]                                  │
│  Your report has been received and routed to Security Ops   │
│  An emergency alert has been issued (critical incidents)    │
│  ─────────────────────────────────────────────────────────  │
│  [Track This Incident →]  [Report Another]  [Dashboard]    │
└─────────────────────────────────────────────────────────────┘
```

---

### 8.11 Incident Details

**Route**: `/incidents/[id]`  
**Primary user**: Reporters (own), security, admin

```
PAGE HEADER:
  Incidents / INC-20260821-0042
  Fire at Chemistry Laboratory, 2nd Floor
  [CRITICAL] [FIRE] [RESPONDING]   Right: [Update Status ▾] [Assign]

─────────────────────────────────────────────────────────────────

LAYOUT: 2-column (3/5 content + 2/5 sidebar)

─── LEFT COLUMN (main content) ───────────────────────────────────

INCIDENT OVERVIEW CARD:
┌─────────────────────────────────────────────────────────────┐
│  [4px red left border]                                      │
│  INC-20260821-0042  ·  Reported by Priya Sharma (Student)  │
│  Aug 21, 2026, 08:42 AM  ·  5 min ago                     │
│  ─────────────────────────────────────────────────────────  │
│  Description:                                               │
│  "There is a fire in the chemistry lab on the 2nd floor.   │
│   Smoke is coming from the windows. Students are           │
│   evacuating the building."                                 │
│  ─────────────────────────────────────────────────────────  │
│  Location: Sciences Block, 2nd Floor, Chemistry Lab        │
│  [ Map preview, 200px, shows pin on campus map]           │
└─────────────────────────────────────────────────────────────┘

AI ANALYSIS CARD:
┌─────────────────────────────────────────────────────────────┐
│  [Sparkles blue]  AI Classification  [Confidence: 0.95]    │
│  ─────────────────────────────────────────────────────────  │
│  Category: Fire        │  Severity: CRITICAL               │
│  Dept: Security Ops    │  Immediate Response: YES          │
│  ─────────────────────────────────────────────────────────  │
│  Risk Factors:                                              │
│  • Occupied laboratory environment                         │
│  • Active smoke reported                                   │
│  • Multiple occupants evacuating                           │
│  ─────────────────────────────────────────────────────────  │
│  Recommended Actions:                                       │
│  1. Evacuate Sciences Block immediately                    │
│  2. Contact fire department                                │
│  3. Alert campus medical center                            │
│  4. Secure surrounding area                                │
│                              [View Raw AI Response ▾]     │
└─────────────────────────────────────────────────────────────┘

EVIDENCE:
┌─────────────────────────────────────────────────────────────┐
│  Evidence (2 files)                                         │
│  [image thumbnail] fire_photo.jpg  [ Admin/Security only] │
│  [document icon]  evacuation_report.pdf                     │
│  [+ Add Evidence] (if authorized)                           │
└─────────────────────────────────────────────────────────────┘

TIMELINE:
┌─────────────────────────────────────────────────────────────┐
│  Incident Timeline                                          │
│  [IncidentTimeline component — full event trail]            │
└─────────────────────────────────────────────────────────────┘

─── RIGHT COLUMN (sidebar) ────────────────────────────────────

STATUS & ASSIGNMENT:
┌────────────────────────────┐
│  Status                    │
│  [RESPONDING dropdown]     │
│  Last changed: 2 min ago   │
│                            │
│  Assigned To               │
│  Officer Sharma            │
│  Security Operations       │
│  [Reassign]                │
│                            │
│  Department                │
│  Security Operations       │
│                            │
│  Priority Score            │
│  ████████████ 9/10         │
└────────────────────────────┘

ACTIONS (role-dependent):
┌────────────────────────────┐
│  Actions                   │
│  [Acknowledge]             │
│  [Mark Responding]         │
│  [Issue Alert ↗]           │
│  [Resolve Incident]        │
│  ─────────────────────     │
│  [Add Comment]             │
└────────────────────────────┘

REPORTER INFO (admin/security only):
┌────────────────────────────┐
│  Reporter [ Restricted]  │
│  Priya Sharma              │
│  B.Tech CSE · Student      │
│  Phone: +91-XXXXXXXX       │
└────────────────────────────┘

RELATED:
┌────────────────────────────┐
│  Related Incidents (2)     │
│  Similar: Sciences Block   │
│  INC-0038 · INC-0031      │
│  [AI recommended]          │
└────────────────────────────┘
```

---

### 8.12 Incident Management

**Route**: `/incidents` (admin, security — full view; others — own incidents)  
**Primary user**: Security officers, administrators

```
PAGE HEADER:
  Incident Management
  24 active · 6 critical · Updated 15s ago  [● LIVE]
  Right: [+ Report Incident] [Export CSV]

─────────────────────────────────────────────────────────────────

FILTER BAR:
┌─────────────────────────────────────────────────────────────┐
│  [ Search incidents, locations, IDs...]                   │
│  [Status ▾] [Severity ▾] [Category ▾] [Date Range ▾] [Dept ▾]│
│  [Active Filters: status:open × ] [Clear All]               │
└─────────────────────────────────────────────────────────────┘

VIEW TOGGLE: [≡ List] [⊞ Grid] [ Map]  (right side)

─── LIST VIEW ────────────────────────────────────────────────────

TABLE COLUMNS:
   | Incident # | Title | Category | Severity | Location | Status | Assigned | Time | →

┌────┬──────────────┬─────────────────────┬───────┬──────────┬──────────┬────────────┬──────────┬────────┬──┐
│   │ INC-0042     │ Fire — Chem Lab      │ Fire│ CRITICAL │ Sci Blk  │ RESPONDING │ O.Sharma │ 5m ago │→ │
│   │ INC-0041     │ Theft — Library     │ Theft│ HIGH    │ Library  │ INVESTIG.  │ O.Kumar  │ 1h ago │→ │
│   │ INC-0040     │ Vandalism — Parking │ Vand│ MEDIUM  │ Parking  │ REPORTED   │ Unassign │ 2h ago │→ │
└────┴──────────────┴─────────────────────┴───────┴──────────┴──────────┴────────────┴──────────┴────────┴──┘

ROW ACTIONS (on hover, right-aligned icon group):
  [Eye: View] [Pencil: Edit status] [User: Assign] [ChevronRight: Detail]

BULK ACTIONS BAR (appears when rows selected):
  [3 selected] → [Assign to...] [Change Status...] [Export] [Archive]

─── GRID VIEW ────────────────────────────────────────────────────
  3-column card grid using <IncidentCard /> component
  Sort: Severity | Most Recent | Priority

─── MAP VIEW ────────────────────────────────────────────────────
  Full-width campus SVG map with all incident pins
  Left sidebar: list of incidents, click to highlight pin
  Severity filter checkboxes at top of sidebar
```

---

### 8.13 Safety Command Center

**Route**: `/command-center` (admin, super_admin, security)  
**Visual Centerpiece** — Full viewport, no padding, high density

```
╔═════════════════════════════════════════════════════════════════╗
║  SAFETY COMMAND CENTER — Full Viewport Dashboard               ║
║  Background: slate-900 (dark mode only for this page)          ║
╚═════════════════════════════════════════════════════════════════╝

TOPBAR (command center variant, dark):
┌─────────────────────────────────────────────────────────────────┐
│  ← Dashboard  CampusShield AI — Safety Command Center          │
│                         [●LIVE] 08:47 AM, Thu Aug 21, 2026    │
│  CAMPUS STATUS: ████ ALL SYSTEMS ACTIVE  [6 CRITICAL] [18 OPEN]│
│  Right: [Full Screen ] [ Alerts 3] [Settings]              │
└─────────────────────────────────────────────────────────────────┘

EMERGENCY BANNER (conditionally rendered, red, full-width):
┌─────────────────────────────────────────────────────────────────┐
│   ACTIVE ALERT: FIRE — SCIENCES BLOCK · Evacuate immediately  │
│  Incident INC-0042 · Issued 5 min ago  [Manage Alert →]        │
└─────────────────────────────────────────────────────────────────┘

─────────────────────────────────────────────────────────────────
MAIN GRID LAYOUT (css grid, fills remaining height):
grid-template-columns: 1fr 2fr 1fr
grid-template-rows: auto 1fr
gap: 2px (tight, cinematic feel)
─────────────────────────────────────────────────────────────────

┌───────────────┬──────────────────────────────┬───────────────┐
│  LEFT PANEL   │  CENTER — CAMPUS MAP         │  RIGHT PANEL  │
│  (stat strip) │  (hero map, fills height)    │  (feed/alerts)│
│               │                              │               │
│  ┌───────────┐│  ┌────────────────────────┐ │┌─────────────┐│
│  │ CRITICAL  ││  │                        │ ││ LIVE FEED   ││
│  │    6      ││  │   SVG CAMPUS MAP       │ ││ ─────────── ││
│  │[red flash]││  │   (dark theme)         │ ││ [Feed items]││
│  └───────────┘│  │                        │ ││             ││
│  ┌───────────┐│  │   [Animated pins]      │ ││ ─────────── ││
│  │ HIGH      ││  │                        │ ││ SOS ALERTS  ││
│  │   10      ││  │   [Red: Chem Lab ●]    │ ││ 0 ACTIVE    ││
│  │[amber]    ││  │   [Amber: Library ●]   │ ││ [green ]   ││
│  └───────────┘│  │                        │ ││             ││
│  ┌───────────┐│  │   [Blue pins: medium]  │ ││ ─────────── ││
│  │ MEDIUM    ││  │                        │ ││ AI INSIGHTS ││
│  │    8      ││  │   Sector overlays:     │ ││ [Sparkles]  ││
│  │[blue]     ││  │   Academic | Hostel    │ ││ 3 patterns  ││
│  └───────────┘│  │   Sports | Admin       │ ││ detected    ││
│  ┌───────────┐│  │                        │ ││ [View →]    ││
│  │ RESOLVED  ││  │   [Legend bottom]      │ ││             ││
│  │   58      ││  │   ● Critical ● High   │ ││ ─────────── ││
│  │[green]    ││  │   ● Medium  ● Low     │ ││ OFFICERS    ││
│  └───────────┘│  │   [Zoom controls +/-] │ ││ 6 on duty   ││
│               │  └────────────────────────┘ ││ [view grid] ││
│  ─────────── ││                              │└─────────────┘│
│  RESPONSE     ││  BOTTOM ROW — INCIDENT TABLE              │
│  METRICS      │├──────────────────────────────────────────────┤
│  Avg: 4.2min  ││  Active Incidents (24) ─── [Filter: All ▾]  │
│  Best: 1.1min ││  [Compact table: ID | Type | Sev | Status | │
│  SLA: 87.4%   ││   Location | Time | Assigned | Action]      │
└───────────────┴──────────────────────────────────────────────┘

─── MAP PANEL DETAILS ────────────────────────────────────────────
Background: slate-800
Campus SVG: Custom SVG with zone overlays
Zones colored:
  Academic zone:   slate-700 buildings
  Hostel zone:     slate-700 buildings  
  Sports zone:     darker green fill
  Admin zone:      slate-700

Active incidents: Animated pins
  Critical: Red pin, 3-ring pulsing glow animation (2s, ease)
  High: Amber pin, 2-ring pulse
  Medium: Blue pin, static
  Low: Green pin, static
  
Selected pin: Opens floating card (incident summary overlay)
  Card: dark floating box, incident details, [Open Full →] button

─── BOTTOM INCIDENT TABLE ────────────────────────────────────────
Background: slate-800
Border-top: 1px solid slate-700
Columns: Type icon | ID | Title | Severity | Status | Location | Time | Assigned | [→]
Max 8 rows visible, then scroll
New row animation: Slide down from top + brief background highlight
Row hover: slate-700 bg
```

### Command Center — State Variations

```
NORMAL STATE:
  Topbar: "CAMPUS STATUS: ████ ALL CLEAR" (green)
  No emergency banner
  Map: Standard colors

HIGH ALERT STATE:
  Topbar: "CAMPUS STATUS: ▓▓▓░ ELEVATED" (amber)
  Amber banner with warning
  Map: Relevant area highlighted amber

CRITICAL / LOCKDOWN STATE:
  Topbar: "CAMPUS STATUS: CRITICAL INCIDENT" (red, pulsing)
  Red full-width banner
  Map: Affected zone flashes red
  Sound: Optional browser notification ping (user opt-in)
  Screen: Red vignette border (3px red border on viewport edge)
```

---

### 8.14 Campus Safety Map

**Route**: `/campus-map` (all authenticated except parent)  
**Primary user**: All authenticated users, security primary

```
PAGE HEADER:
  Campus Safety Map
  Live incident overlay · Updated 45s ago  [●LIVE]
  Right: [Filter Severity ▾] [My Location] [Refresh]

─────────────────────────────────────────────────────────────────

LAYOUT: 2-panel (sidebar 320px + map fills remaining)

─── LEFT SIDEBAR ─────────────────────────────────────────────────
┌─────────────────────────────────────────────────────────────┐
│   Search location...                                       │
│  ─────────────────────────────────────────────────────────  │
│  SEVERITY FILTER                                            │
│   Critical (6)   High (10)   Medium (8)   Low (23)   │
│  ─────────────────────────────────────────────────────────  │
│  ACTIVE INCIDENTS (6 critical)                              │
│  ─────────────────────────────────────────────────────────  │
│  [CRIT] Fire — Chemistry Lab                               │
│  [HIGH] Theft — Library                                    │
│  [MED]  Vandalism — Parking Lot                            │
│  [MED]  Noise — Hostel B                                   │
│  [LOW]  Broken gate — Main entry                           │
│  ─────────────────────────────────────────────────────────  │
│  CAMPUS LOCATIONS                                           │
│  [Search locations, click to navigate]                      │
│  Main Gate · Admin Block · Sciences Block                   │
│  Library · Hostel A · Hostel B · Sports · Cafeteria        │
└─────────────────────────────────────────────────────────────┘

─── MAP AREA ─────────────────────────────────────────────────────
Background: slate-100 (light map theme)
SVG campus map with:
  - Building outlines (white fill, slate-200 stroke)
  - Zone labels (12px, slate-500)
  - Incident pins (see 6.12 MapPin component)
  - Hover tooltips
  - Click to open incident detail panel

MAP CONTROLS (bottom-right):
  [+] Zoom in
  [−] Zoom out
  [] Reset view
  [] Fullscreen

INCIDENT DETAIL PANEL (slide-in from right, 360px):
  Opens on pin click
  Contains: IncidentCard full + [View Full Details →]
  Closes on X or click outside
```

---

### 8.15 Emergency Alerts

**Route**: `/alerts` (all authenticated)  
**Admin/Security**: Can create + manage; Others: Read-only

```
PAGE HEADER:
  Emergency Alerts
  [Admin/Security view] 1 active · 12 past  Right: [+ Issue Alert]
  [Student/Faculty view] Campus Safety Notices

─────────────────────────────────────────────────────────────────

ACTIVE ALERTS (if any — prominent at top):
┌─────────────────────────────────────────────────────────────┐
│  ACTIVE ALERT — CRITICAL                          [Manage]  │
│  ───────────────────────────────────────────────────────    │
│   FIRE — Sciences Block                                   │
│  Evacuate Sciences Block immediately. Do not use elevators. │
│  Contact emergency services if needed.                      │
│  ─────────────────────────────────────────────────────────  │
│  Issued by: Admin Dr. Kumar · 08:47 AM, Aug 21, 2026       │
│  Targeting: All roles · Expires: 4 hours                   │
│  Linked Incident: INC-0042 [View →]                        │
│                                    [Extend] [Deactivate]   │
└─────────────────────────────────────────────────────────────┘

─────────────────────────────────────────────────────────────────

ISSUE ALERT FORM (Admin/Security, collapsible panel or modal):
┌─────────────────────────────────────────────────────────────┐
│  Issue Campus-Wide Alert                                    │
│  ─────────────────────────────────────────────────────────  │
│  Alert Type: [Lockdown] [Evacuation] [Weather] [Medical]   │
│              [Security] [General]                           │
│                                                             │
│  Title:    [────────────────────────────────────────────]  │
│  Message:  [── textarea ─────────────────────────────────] │
│  Severity: ○ Critical  ○ High  ○ Medium  ○ Low            │
│  Target:    Students   Faculty   Security   Parents  │
│  Duration: [1h] [4h] [Until manual dismiss]                │
│  Link to incident: [INC number lookup ─────────────────]  │
│  [Preview] [Issue Alert →]                                 │
└─────────────────────────────────────────────────────────────┘

─────────────────────────────────────────────────────────────────

ALERT HISTORY TABLE:
  Title | Type | Severity | Issued By | Issued At | Expires | Status | Action
  Filters: Type | Severity | Active/Past | Date range
  Sort: Newest first

ALERT DETAIL (expanded row or modal):
  Full message, affected roles, linked incident, timeline
  Admin: [Reactivate] (if expired, same content relevant again)
```

---

### 8.16 Visitor Management

**Route**: `/visitors` (admin, security, receptionist)

```
PAGE HEADER:
  Visitor Management
  12 checked in · 3 pre-registered · 2 pending approval
  Right: [+ Register Visitor] [Export]

─────────────────────────────────────────────────────────────────

STATS ROW (4-column compact):
┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐
│ On Campus │ │ Today     │ │ Pending   │ │ Denied    │
│    12     │ │    47     │ │     3     │ │     1     │
│ [blue]    │ │ [slate]   │ │ [amber]   │ │ [red]     │
└───────────┘ └───────────┘ └───────────┘ └───────────┘

─────────────────────────────────────────────────────────────────

REGISTER VISITOR FORM (prominent, in card above table):
┌─────────────────────────────────────────────────────────────┐
│  Quick Check-In                                             │
│  ─────────────────────────────────────────────────────────  │
│  Visitor Name *  [────────────────────]  Phone [──────────] │
│  Purpose *       [────────────────────]                     │
│  Host (Faculty/Staff) * [search autocomplete ────────────] │
│  ID Type:  [Aadhar] [PAN] [Passport] [DL] [Other]          │
│  [Photo Upload] [ID Proof Upload]                           │
│                             [Pre-Register] [Check In Now →] │
└─────────────────────────────────────────────────────────────┘

─────────────────────────────────────────────────────────────────

VISITOR TABLE (tabbed: Active | Pre-Registered | Today | All):
  Pass # | Name | Purpose | Host | Check-In | Check-Out | Status | Actions

[CHECKED_IN] → green badge, [Check Out] action button
[PRE_REGISTERED] → blue badge, [Check In] button
[CHECKED_OUT] → slate badge
[DENIED] → red badge, denial reason on hover

VISITOR DETAIL (modal/slide-in):
  Photo | Name | ID proof | Purpose | Host | Timeline
  Pass QR code (for gate verification)
  [Check Out] [Deny] [Print Pass] [Flag as Suspicious]
```

---

### 8.17 Complaints

**Route**: `/complaints` (all authenticated)

```
PAGE HEADER:
  Complaints & Grievances
  [Student view] My Complaints · Right: [+ File Complaint]
  [Admin view] All Complaints · Right: [+ New] [Export]

─────────────────────────────────────────────────────────────────

FILE COMPLAINT FORM (collapsible, top of page for student):
┌─────────────────────────────────────────────────────────────┐
│  File a New Complaint                                       │
│  Category: [Hostel] [Mess/Food] [Academic] [Infrastructure] │
│            [Faculty] [Harassment] [Other]                   │
│  Subject: [────────────────────────────────────────────]   │
│  Description: [── textarea ──────────────────────────────] │
│  Priority: ○ Low  ○ Normal  ● High  ○ Urgent              │
│  Anonymous:  File this complaint anonymously              │
│                                    [Submit Complaint →]    │
└─────────────────────────────────────────────────────────────┘

─────────────────────────────────────────────────────────────────

COMPLAINTS TABLE (tabbed: Open | In Progress | Resolved | All):
  Ticket # | Subject | Category | Priority | Filed | Status | Assigned | Action

COMPLAINT DETAIL (modal):
  Ticket # · Category · Priority
  Subject & Description
  Filed by (anonymous or named) · Date
  Assigned to · Department
  Status timeline (open → in progress → resolved)
  Resolution notes (when resolved)
  [Admin: Change status, assign, add note]
```

---

### 8.18 Attendance

**Route**: `/attendance`  
**Faculty**: Mark attendance; **Students/Parents**: View attendance

```
──── FACULTY VIEW ────────────────────────────────────────────────

PAGE HEADER:
  Attendance Management
  DS Lab 204 · Thursday, Aug 21, 2026
  Right: [Select Class ▾]

CLASS SELECTOR:
  [Dropdown: Course / Subject / Section / Date]
  [Today's Classes: quick tabs]

ATTENDANCE MARKING TABLE:
┌─────────────────────────────────────────────────────────────┐
│  [Mark All Present] [Mark All Absent] [Clear]  Export ↓    │
│  ─────────────────────────────────────────────────────────  │
│  Roll # | Name          | Present | Absent | Late | Excused │
│  CS001   Priya Sharma    ●                                   │
│  CS002   Rahul Mehta             ●                          │
│  CS003   Anjali Kumar    ●                                   │
│  ─────────────────────────────────────────────────────────  │
│  Summary: Present: 43 | Absent: 7 | Late: 2               │
│                                       [Submit Attendance →] │
└─────────────────────────────────────────────────────────────┘

ATTENDANCE HISTORY:
  Filter by: Subject | Date range | Student
  Chart: Attendance trend per subject (last 30 days)

──── STUDENT VIEW ────────────────────────────────────────────────

PAGE HEADER:
  My Attendance — Semester 5
  Overall: 87.4%  [amber: below 90%]

SUBJECT BREAKDOWN (cards or table):
  Subject | Total | Present | Absent | Percentage | Status
  [Progress bar per row, colored by threshold]
  [] If < 75%: red warning + "At risk of detention"
  [] If ≥ 90%: green + "Good standing"

MONTH CALENDAR VIEW:
  Heatmap calendar showing present/absent days
  Color: green = present, red = absent, amber = late, slate = holiday
```

---

### 8.19 Timetable

**Route**: `/timetable` (all authenticated)

```
PAGE HEADER:
  Timetable
  B.Tech CSE · Semester 5 · Section A  [Change ▾]
  Right: [Download PDF] [Add to Calendar]

─────────────────────────────────────────────────────────────────

VIEW SWITCHER: [Week View] [Day View] [List View]

─── WEEK VIEW (default) ──────────────────────────────────────────

┌──────┬──────────────┬──────────────┬──────────────┬──────────┐
│ Time │  Monday      │  Tuesday     │  Wednesday   │ Thursday │
├──────┼──────────────┼──────────────┼──────────────┼──────────┤
│ 9AM  │ Mathematics  │              │ Data Struct. │ Maths    │
│      │ Room 301     │              │ Lab 204      │ Room 301 │
│      │ Dr. Sharma   │              │ Prof. Meera  │          │
├──────┼──────────────┼──────────────┼──────────────┼──────────┤
│ 10AM │ Data Struct. │ Networks     │              │[NOW] DS  │
│      │ Room 205     │ Room 301     │              │ Lab 204  │
│      │ Prof. Meera  │ Dr. Kumar    │              │          │
└──────┴──────────────┴──────────────┴──────────────┴──────────┘

Current slot: blue-100 background, blue-600 border-left (highlighted)
Past slots: slate-50 background, text-tertiary
Future slots: white background

Cell hover: Tooltip with faculty name, room, subject code

─── DAY VIEW ─────────────────────────────────────────────────────
Single day with hour grid, full width
Current time indicator: red horizontal line with time label

─── LIST VIEW ────────────────────────────────────────────────────
Simple list: Day | Time | Subject | Faculty | Room
Grouped by day
Today highlighted
```

---

### 8.20 AI Safety Analytics

**Route**: `/safety-analytics` (admin, security, super_admin)

```
PAGE HEADER:
  AI Safety Analytics
  Powered by Gemini AI · Data through Aug 21, 2026
  Right: [Time Range: Last 30 days ▾] [Generate Report]

─────────────────────────────────────────────────────────────────

ROW 1: TOP-LEVEL STATS (5-column)
┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐
│Total    │ │Resolved │ │Avg Resp │ │AI Classif│ │Risk     │
│Incidents│ │  Rate   │ │  Time   │ │Accuracy  │ │Score    │
│   284   │ │  91.2%  │ │ 4.2 min │ │  94.8%   │ │ 72/100  │
└─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘

─────────────────────────────────────────────────────────────────

ROW 2: AI INSIGHTS PANEL (full-width prominent card)
┌─────────────────────────────────────────────────────────────┐
│  [Sparkles blue]  Gemini AI Safety Insights               │
│  Analyzed 284 incidents across 30 days                     │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  KEY PATTERNS IDENTIFIED:                                   │
│                                                             │
│  ① Sciences Block — Fire Risk (High)                       │
│     3 fire incidents in 90 days. Fire extinguishers in     │
│     Chem Lab last checked 11 months ago.                   │
│     Recommendation: Immediate safety audit + training      │
│                                                             │
│  ② Library Theft Cluster (Medium)                          │
│     5 theft incidents, 4 in evening hours (6-8PM).        │
│     Pattern: Low lighting area near periodicals section.   │
│     Recommendation: CCTV coverage + lighting upgrade       │
│                                                             │
│  ③ Hostel B Late-Night Noise (Low)                        │
│     8 complaints in 30 days, weekends 11PM-2AM.           │
│     Recommendation: Enhanced warden rounds on weekends    │
│                                                             │
│  AI Confidence: 91% · Generated: Aug 21, 08:45 AM         │
│  [Regenerate Insights] [Export to PDF] [Review Actions]   │
└─────────────────────────────────────────────────────────────┘

─────────────────────────────────────────────────────────────────

ROW 3: CHARTS (2-column)
┌───────────────────────────────────┐ ┌────────────────────────┐
│  Incident Trend (Line Chart)      │ │ Category Distribution  │
│  X: Week labels, Y: Count         │ │ (Donut chart, 240px)   │
│  Lines: Total | Critical | Resolved│ │ Fire 18% | Theft 24%  │
│  [Recharts, blue primary line,    │ │ Medical 15% | Other 43%│
│   red area for critical, tooltip] │ │ Click segment for drill│
└───────────────────────────────────┘ └────────────────────────┘

┌───────────────────────────────────┐ ┌────────────────────────┐
│  Severity Heatmap — By Day/Hour  │ │ Department Response    │
│  X: Hour (0-23), Y: Day of week   │ │ Time (Bar chart)       │
│  Color intensity = incident count │ │ Security: 3.2 min avg  │
│  Red = hot, blue = cool           │ │ Medical: 8.1 min avg   │
│  [Click cell: list of incidents]  │ │ Maint: 24h avg         │
└───────────────────────────────────┘ └────────────────────────┘

─────────────────────────────────────────────────────────────────

ROW 4: RISK ASSESSMENT + HOTSPOTS
┌─────────────────────────────────────────────────────────────┐
│  Campus Risk Heatmap                                        │
│  [SVG campus map with risk overlay]                         │
│  Color: Red=high risk zone, Amber=medium, Green=low        │
│  Current risk scores by campus zone                         │
│  Sciences Block: 78/100 [red]                              │
│  Library: 54/100 [amber]                                   │
│  Hostels: 32/100 [green]                                   │
└─────────────────────────────────────────────────────────────┘

ROW 5: PREDICTIVE RISK TABLE
  Location | Risk Level | Key Risk Factor | Recommended Action | Priority
  [Sortable, export to CSV]
```

---

### 8.21 Campus AI Copilot

**Route**: `/ai-copilot` (admin, security; read-only summary for faculty)  
**A conversational AI interface for campus intelligence queries**

```
PAGE HEADER:
  Campus AI Copilot
  Ask anything about campus safety, incidents, and operations
  Powered by Gemini AI · Context: Last 90 days of campus data

─────────────────────────────────────────────────────────────────

LAYOUT: 2-column (chat 60% + context panel 40%)

─── LEFT: CHAT INTERFACE ─────────────────────────────────────────
┌─────────────────────────────────────────────────────────────┐
│  [Conversation area, scrollable, fills height]              │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  [Sparkles icon, 40px circle, blue-50 bg]           │   │
│  │  CampusShield AI                                    │   │
│  │                                                     │   │
│  │  Hello Dr. Kumar. I've analyzed your campus data    │   │
│  │  for the last 90 days. Here are key insights:      │   │
│  │                                                     │   │
│  │  • 284 incidents recorded (↑12% vs last semester)  │   │
│  │  • Highest risk zone: Sciences Block               │   │
│  │  • Response time improved: 4.2 min avg (↓23%)     │   │
│  │                                                     │   │
│  │  What would you like to know?                      │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  [User avatar, right-aligned]                       │   │
│  │  Show me theft incidents in the last month           │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  [AI avatar]  Analysis — Theft Incidents (Last 30d) │   │
│  │                                                     │   │
│  │  Found 12 theft incidents:                         │   │
│  │  • 5 in Library (most concentrated)                │   │
│  │  • 3 in Academic Block                             │   │
│  │  • 4 in Parking Lot                                │   │
│  │                                                     │   │
│  │  Peak time: 6PM-8PM (8 of 12 incidents)            │   │
│  │  AI Recommendation: Install CCTV in Library Zone 3 │   │
│  │                                                     │   │
│  │  [View Incidents →] [Generate Report →]            │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘

QUICK PROMPTS (above input, scrollable horizontal):
  [What are the top safety risks this week?]
  [Show me all critical incidents this month]
  [Which campus zone is safest for night events?]
  [How is our SOS response time trending?]
  [Predict weekend safety risk for this campus]

INPUT AREA:
┌─────────────────────────────────────────────────────────────┐
│  [Sparkles]  Ask about campus safety, incidents, patterns...│
│                                           [Attach context] →│
└─────────────────────────────────────────────────────────────┘

─── RIGHT: CONTEXT PANEL ─────────────────────────────────────────
┌────────────────────────────────────┐
│  Data Context                      │
│  ─────────────────────────────── │
│  Time range: Last 90 days          │
│  Incidents: 284                    │
│  AI confidence: 91%                │
│                                    │
│  Active Context:                   │
│  • Incident trends                 │
│  • Location data                   │
│  • Dept performance                │
│  • SOS history                     │
│                                    │
│  Recent Queries:                   │
│  • Theft incidents last month       │
│  • Sciences block risk profile      │
│                                    │
│  [Clear Context] [Export Chat]     │
└────────────────────────────────────┘

DISCLAIMER (fixed at bottom of panel):
  "AI responses are analytical only. All safety decisions 
   require human review and authorization."
  14px, slate-400, italic
```

---

### 8.22 Audit Logs

**Route**: `/audit-logs` (super_admin, admin)

```
PAGE HEADER:
  Audit Logs
  Immutable system activity trail · Read-only
  Right: [Export CSV] [Filter ▾]

─────────────────────────────────────────────────────────────────

FILTER BAR:
┌─────────────────────────────────────────────────────────────┐
│  [ Search by user, action, entity...]                     │
│  [User ▾] [Action Type ▾] [Entity ▾] [Date Range ▾]        │
│  [From: Aug 21 00:00] [To: Aug 21 23:59]                   │
└─────────────────────────────────────────────────────────────┘

─────────────────────────────────────────────────────────────────

AUDIT TABLE:
  Timestamp | User | Role | Action | Entity | Entity ID | IP | Details

┌──────────────────────────────────────────────────────────────────────┐
│ 08:42:04  │ Priya Sharma  │ Student     │ CREATE  │ incident  │ 0042 │
│ 08:42:01  │ System        │ AI Engine   │ CLASSIFY│ incident  │ 0042 │
│ 08:41:58  │ Priya Sharma  │ Student     │ LOGIN   │ session   │ ──   │
│ 08:35:12  │ Officer Sharma│ Security    │ UPDATE  │ incident  │ 0039 │
│ 08:30:00  │ Dr. Kumar     │ Admin       │ CREATE  │ alert     │ ─    │
└──────────────────────────────────────────────────────────────────────┘

Action color codes:
  CREATE:  blue-600 text
  UPDATE:  amber-600 text
  DELETE:  red-600 text
  LOGIN:   green-600 text
  LOGOUT:  slate-500 text
  FAILED:  red-600 text, red-50 row bg

ROW EXPAND (click to expand):
  Shows old_values JSON | new_values JSON side-by-side
  User agent | Full IP address
  [Copy to Clipboard] [Flag for Review]

IMMUTABILITY NOTICE:
┌─────────────────────────────────────────────────────────────┐
│  [LockKeyhole icon]  These records are immutable. Updates   │
│  and deletions to audit log entries are not permitted by    │
│  any user including Super Administrators.                   │
└─────────────────────────────────────────────────────────────┘

STATS ROW (above table):
  Total today: 1,247 | Logins: 89 | Incidents: 14 | Alerts: 3 | Errors: 2
```

---

## 9. Component Hierarchy

### Full Component Tree

```
src/
└── components/
    ├── layout/
    │   ├── <Sidebar>
    │   │   ├── <SidebarBrand>           Logo + name + collapse toggle
    │   │   ├── <SidebarUser>            Avatar + name + role badge
    │   │   ├── <SidebarSection>         Section label (uppercase)
    │   │   ├── <SidebarNavItem>         Icon + label + optional badge
    │   │   └── <SidebarFooter>          Settings + Logout
    │   │
    │   ├── <Topbar>
    │   │   ├── <Breadcrumb>             Path navigation
    │   │   ├── <GlobalSearch>           Command palette trigger
    │   │   ├── <NotificationBell>       Badge + dropdown
    │   │   └── <UserMenu>              Avatar + dropdown
    │   │
    │   ├── <AlertBanner>                Emergency banner (conditional)
    │   ├── <PageHeader>                 Title + breadcrumb + CTA
    │   └── <MobileNav>                  Bottom navigation (mobile)
    │
    ├── safety/
    │   ├── <IncidentCard>               Incident preview card
    │   │   ├── <SeverityBadge>
    │   │   ├── <CategoryBadge>
    │   │   ├── <StatusChip>
    │   │   └── <AIConfidenceMeter>
    │   │
    │   ├── <IncidentForm>               Report + edit form
    │   │   ├── <LocationPicker>
    │   │   ├── <CategoryPicker>
    │   │   ├── <SeveritySelector>
    │   │   ├── <EvidenceUpload>
    │   │   ├── <AnonymousToggle>
    │   │   └── <AIAnalysisPanel>        Real-time AI feedback
    │   │
    │   ├── <IncidentTimeline>           Chronological event trail
    │   │   └── <TimelineEvent>          Individual event node
    │   │
    │   ├── <CampusMapView>              SVG campus map
    │   │   ├── <MapPin>                 Severity-colored incident pin
    │   │   ├── <MapZoneOverlay>         Campus zone shading
    │   │   ├── <MapControls>            Zoom/reset controls
    │   │   └── <MapPinTooltip>          Hover incident summary
    │   │
    │   ├── <CommandCenterGrid>          Full-viewport command center
    │   │   ├── <CommandTopbar>
    │   │   ├── <StatStrip>              Left severity counters
    │   │   ├── <CommandMapPanel>        Center map (dark theme)
    │   │   ├── <CommandFeedPanel>       Right live feed
    │   │   └── <CommandIncidentTable>  Bottom incident table
    │   │
    │   ├── <LiveFeedPanel>              Realtime event stream
    │   │   └── <FeedItem>              Single feed event
    │   │
    │   ├── <AlertBannerSystem>          System-wide alert management
    │   │   └── <AlertBannerItem>        Single alert display
    │   │
    │   ├── <EmergencyAlertForm>         Issue new alert
    │   ├── <SOSButton>                  Panic button with hold
    │   ├── <SOSPanel>                   Admin/Security SOS view
    │   ├── <AIInsightCard>              AI analysis display
    │   └── <AIAnalysisPanel>            Inline incident AI feedback
    │
    ├── charts/
    │   ├── <IncidentTrendChart>        Line chart (Recharts)
    │   ├── <CategoryDonutChart>        Donut/pie (Recharts)
    │   ├── <SeverityBarChart>          Bar (Recharts)
    │   ├── <HeatmapChart>              Day/hour heatmap (custom)
    │   ├── <RiskScoreGauge>            Circular gauge (Recharts Radial)
    │   ├── <AttendanceSparkline>       Mini trend (Recharts)
    │   └── <DepartmentPerformance>     Horizontal bars
    │
    ├── erp/
    │   ├── <AttendanceTable>           Mark/view attendance
    │   ├── <TimetableGrid>             Week/day schedule
    │   ├── <ComplaintCard>             Complaint item
    │   ├── <PlacementCard>             Placement drive card
    │   ├── <VisitorCard>               Visitor record
    │   ├── <VisitorPassQR>             QR code for gate
    │   └── <AnnouncementItem>          News/announcement
    │
    ├── shared/
    │   ├── <DataTable>                 Generic table with sort/filter/page
    │   │   ├── <TableHeader>
    │   │   ├── <TableRow>
    │   │   ├── <TablePagination>
    │   │   └── <BulkActionBar>
    │   │
    │   ├── <StatCard>                  Metric card (variants)
    │   ├── <FilterBar>                 Search + filter chips
    │   ├── <EmptyState>               No-data illustration + action
    │   ├── <LoadingSpinner>            Page/component loading
    │   ├── <SkeletonLoader>            Content skeleton
    │   ├── <Modal>                     Accessible dialog
    │   ├── <SlidePanel>               Slide-in detail panel
    │   ├── <ConfirmDialog>             Destructive action confirm
    │   ├── <Toast>                     Notification toasts
    │   └── <PageTransition>           Route change animation
    │
    └── ui/                            shadcn/ui primitive components
        ├── Button, Input, Select
        ├── Textarea, Checkbox, Radio
        ├── Badge, Avatar, Tooltip
        ├── Dropdown, Popover, Dialog
        ├── Tabs, Accordion, Progress
        └── Calendar, DatePicker
```

---

## 10. Responsive Behavior

### Breakpoint System

```
xs:   < 480px   (small phones)
sm:   480–767px (phones, large phones)
md:   768–1023px (tablets)
lg:   1024–1279px (small laptops)
xl:   1280–1535px (standard laptops/desktops)
2xl:  ≥ 1536px  (large displays)
```

### Layout Adaptations by Screen

#### Sidebar

| Breakpoint | Behavior |
|-----------|---------|
| 2xl/xl | Expanded, 260px, always visible |
| lg | Collapsed to 60px (icon-only), expands on hover |
| md | Hidden, slide-in overlay on hamburger click |
| sm/xs | Hidden, bottom navigation replaces sidebar |

#### Dashboard Grids

| Layout | Desktop (xl) | Tablet (md) | Mobile (sm) |
|--------|------------|------------|------------|
| Stat cards | 4-col | 2-col | 2-col |
| Main content + sidebar | 2/3 + 1/3 | Full-width stacked | Full-width stacked |
| 3-col cards | 3-col | 2-col | 1-col |
| Data table | Full with all cols | Horizontal scroll, hide less-critical cols | Horizontal scroll, minimal cols |

#### Command Center (Special)

| Breakpoint | Behavior |
|-----------|---------|
| xl/2xl | Full 3-panel grid with live map center |
| lg | Map takes full width, panels collapse to tabs |
| md | Map + tab panel (Live Feed / Incidents) |
| sm | Redirects to a simplified mobile safety view |

#### Mobile Navigation

```
Mobile Bottom Nav (≤767px):
┌──────────────────────────────────────────────┐
│  [Home] [Map] [Report] [Alerts] [Profile]    │
│  [icon] [icon] [● SOS] [icon]  [icon]        │
└──────────────────────────────────────────────┘

Center button: Red SOS/Report button (elevated, 56px)
Active: blue-500 icon + label
Inactive: slate-400 icon, no label
```

### Typographic Responsiveness

```
display-lg:   36px → 28px (tablet) → 24px (mobile)
display-md:   30px → 24px (tablet) → 20px (mobile)
display-sm:   24px → 20px (tablet) → 18px (mobile)
body text:    Unchanged (14-16px)
```

---

## 11. Animation & Motion

### Principles

- **Purpose-driven**: Every animation communicates state change or hierarchy
- **Subtle by default**: 150–300ms, ease-out, no spring physics overuse
- **Performance-first**: `transform` and `opacity` only (no layout-thrashing properties)
- **Reduced motion**: All animations respect `prefers-reduced-motion`

### Animation Catalog

```css
/* Page transitions */
@keyframes fade-up-in {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}
.page-enter { animation: fade-up-in 250ms ease-out; }

/* Live feed new item */
@keyframes slide-down {
  from { opacity: 0; transform: translateY(-100%); max-height: 0; }
  to   { opacity: 1; transform: translateY(0); max-height: 100px; }
}

/* Critical incident pulse (left border) */
@keyframes severity-pulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.5; }
}
.critical-pulse { animation: severity-pulse 2s ease-in-out infinite; }

/* SOS pin map pulse */
@keyframes map-ping {
  0%   { transform: scale(1); opacity: 1; }
  75%  { transform: scale(2.5); opacity: 0; }
  100% { transform: scale(2.5); opacity: 0; }
}
.map-pin-critical::after { animation: map-ping 1.5s cubic-bezier(0,0,0.2,1) infinite; }

/* SOS button hold progress */
@keyframes hold-progress {
  from { stroke-dashoffset: 157; }
  to   { stroke-dashoffset: 0; }
}

/* Stat card count-up */
/* Use countUp.js or custom hook, 800ms ease-out */

/* Chart line draw */
/* SVG stroke-dasharray animation, 600ms ease-out */

/* Modal enter */
@keyframes modal-in {
  from { opacity: 0; transform: scale(0.96); }
  to   { opacity: 1; transform: scale(1); }
}

/* Slide panel (right) */
@keyframes slide-panel-in {
  from { transform: translateX(100%); }
  to   { transform: translateX(0); }
}
```

### Interaction States Summary

| Element | Hover | Active | Focus | Disabled |
|---------|-------|--------|-------|----------|
| Button | bg -1 shade, shadow | scale(0.98) | ring 2px blue-500 offset 2px | opacity-50, cursor-not-allowed |
| Nav item | slate-800 bg | slate-700 bg | ring inset | — |
| Card | shadow-md (upgrade) | — | ring 2px blue-300 | — |
| Input | border-strong | — | border-blue-500 + ring | slate-100 bg, text-tertiary |
| Table row | slate-50 bg | slate-100 bg | — | — |
| Map pin | scale(1.1) + tooltip | — | — | — |

---

## 12. Accessibility Standards

### WCAG 2.1 AA Compliance

| Requirement | Implementation |
|------------|----------------|
| Color contrast | All text ≥ 4.5:1 (body), ≥ 3:1 (large/UI) |
| Focus indicators | 2px ring, blue-500, 2px offset — visible on all interactive elements |
| Keyboard nav | All interactive elements reachable via Tab; dropdown with arrow keys |
| Screen readers | `aria-label`, `aria-describedby`, `role` on all custom components |
| Skip link | "Skip to main content" as first focusable element |
| Form labels | All inputs have associated `<label>` elements |
| Error messages | Both color AND icon AND text (not color-only) |
| Loading states | `aria-live="polite"` regions for async updates |
| Dialog | Focus trap in modals; `aria-modal`, `aria-labelledby` |
| Alert banner | `role="alert"` + `aria-live="assertive"` for emergency broadcasts |
| Severity | Never use color alone — always paired with text + icon |
| SOS button | Large touch target (56px+); redundant keyboard shortcut (Alt+S) |

### Color Independence

All severity indicators include:
1. **Color** (red/amber/blue/green)
2. **Icon** (AlertOctagon/AlertTriangle/Info/CheckCircle)
3. **Text label** ("CRITICAL"/"HIGH"/"MEDIUM"/"LOW")

Emergency alerts include audio support (browser notification API, opt-in only).

---

## 13. Icon Reference

All icons from **Lucide React** (consistent, professional, open-source).

### Safety & Security Icons

| Usage | Icon Name | Lucide Component |
|-------|-----------|-----------------|
| Critical incident | Alert octagon | `<AlertOctagon />` |
| High / Warning | Alert triangle | `<AlertTriangle />` |
| SOS / Emergency | Phone (in red circle) | `<Phone />` |
| Security officer | Shield check | `<ShieldCheck />` |
| Lockdown | Lock | `<Lock />` |
| Evacuation | Door open | `<DoorOpen />` |
| Fire | Flame | `<Flame />` |
| Medical | Cross | `<Cross />` |
| Surveillance | Eye | `<Eye />` |
| Resolved/Safe | Check circle | `<CheckCircle />` |
| Campus map | Map pin | `<MapPin />` |
| Live feed | Activity | `<Activity />` |
| AI assistant | Sparkles | `<Sparkles />` |

### ERP & Operations Icons

| Usage | Icon Name |
|-------|-----------|
| Dashboard | `<LayoutDashboard />` |
| Students | `<GraduationCap />` |
| Faculty | `<BookOpen />` |
| Attendance | `<ClipboardCheck />` |
| Timetable | `<CalendarDays />` |
| Hostel | `<Building2 />` |
| Complaints | `<MessageSquare />` |
| Placements | `<Briefcase />` |
| Visitors | `<Users />` |
| Announcements | `<Bell />` |
| Audit Logs | `<ScrollText />` |
| Settings | `<Settings2 />` |
| Analytics | `<BarChart3 />` |
| Export | `<Download />` |
| Filter | `<Filter />` |
| Search | `<Search />` |
| Add/New | `<Plus />` |
| Edit | `<Pencil />` |
| Delete | `<Trash2 />` |
| View detail | `<ChevronRight />` |
| Assign | `<UserCheck />` |
| Evidence | `<Paperclip />` |
| Anonymous | `<EyeOff />` |
| Logout | `<LogOut />` |

---

## Appendix A — Page → Role Access Matrix

| Page | super_admin | admin | security | faculty | student | parent | warden | receptionist |
|------|:-----------:|:-----:|:--------:|:-------:|:-------:|:------:|:------:|:------------:|
| Landing | [PASS] | [PASS] | [PASS] | [PASS] | [PASS] | [PASS] | [PASS] | [PASS] |
| Login | [PASS] | [PASS] | [PASS] | [PASS] | [PASS] | [PASS] | [PASS] | [PASS] |
| Admin Dashboard | [PASS] | [PASS] | [FAIL] | [FAIL] | [FAIL] | [FAIL] | [FAIL] | [FAIL] |
| Student Dashboard | [PASS] | [PASS] | [FAIL] | [FAIL] | [PASS] | [FAIL] | [FAIL] | [FAIL] |
| Security Dashboard | [PASS] | [PASS] | [PASS] | [FAIL] | [FAIL] | [FAIL] | [FAIL] | [FAIL] |
| Faculty Dashboard | [PASS] | [PASS] | [FAIL] | [PASS] | [FAIL] | [FAIL] | [FAIL] | [FAIL] |
| Parent Dashboard | [PASS] | [PASS] | [FAIL] | [FAIL] | [FAIL] | [PASS] | [FAIL] | [FAIL] |
| Hostel Dashboard | [PASS] | [PASS] | [FAIL] | [FAIL] | R | R | [PASS] | [FAIL] |
| Placement Portal | [PASS] | [PASS] | [FAIL] | R | [PASS] | R | [FAIL] | [FAIL] |
| Incident Reporting | [PASS] | [PASS] | [PASS] | [PASS] | [PASS] | [FAIL] | [PASS] | [PASS] |
| Incident Details | [PASS] | [PASS] | [PASS] | Own | Own | [FAIL] | Own | Own |
| Incident Management | [PASS] | [PASS] | [PASS] | [FAIL] | [FAIL] | [FAIL] | [FAIL] | [FAIL] |
| Command Center | [PASS] | [PASS] | [PASS] | [FAIL] | [FAIL] | [FAIL] | [FAIL] | [FAIL] |
| Campus Map | [PASS] | [PASS] | [PASS] | [PASS] | [PASS] | [FAIL] | [PASS] | [PASS] |
| Emergency Alerts (view) | [PASS] | [PASS] | [PASS] | [PASS] | [PASS] | [PASS] | [PASS] | [PASS] |
| Emergency Alerts (manage) | [PASS] | [PASS] | [PASS] | [FAIL] | [FAIL] | [FAIL] | [FAIL] | [FAIL] |
| Visitor Management | [PASS] | [PASS] | [PASS] | [FAIL] | [FAIL] | [FAIL] | [FAIL] | [PASS] |
| Complaints | [PASS] | [PASS] | R | R | [PASS] | [FAIL] | [PASS] | [PASS] |
| Attendance | [PASS] | [PASS] | [FAIL] | CRU | R | R | [FAIL] | [FAIL] |
| Timetable | [PASS] | [PASS] | [FAIL] | R | R | R | [FAIL] | [FAIL] |
| AI Analytics | [PASS] | [PASS] | [PASS] | [FAIL] | [FAIL] | [FAIL] | [FAIL] | [FAIL] |
| AI Copilot | [PASS] | [PASS] | [PASS] | [FAIL] | [FAIL] | [FAIL] | [FAIL] | [FAIL] |
| Audit Logs | [PASS] | [PASS] | [FAIL] | [FAIL] | [FAIL] | [FAIL] | [FAIL] | [FAIL] |

`R` = Read only · `CRU` = Create/Read/Update · `Own` = Own records only

---

## Appendix B — Tailwind Config Tokens

```typescript
// tailwind.config.ts — Design token extension

import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#EFF6FF',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          900: '#1E3A8A',
        },
        surface: {
          canvas:  '#F8F9FB',
          base:    '#FFFFFF',
          sidebar: '#0F172A',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['Geist Mono', 'JetBrains Mono', 'monospace'],
      },
      fontSize: {
        'display-lg': ['2.25rem', { lineHeight: '1.15', letterSpacing: '-0.025em', fontWeight: '700' }],
        'display-md': ['1.875rem', { lineHeight: '1.2', letterSpacing: '-0.02em', fontWeight: '700' }],
        'display-sm': ['1.5rem', { lineHeight: '1.25', letterSpacing: '-0.015em', fontWeight: '600' }],
      },
      borderRadius: {
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
      },
      boxShadow: {
        sm: '0 1px 2px 0 rgba(15, 23, 42, 0.05)',
        md: '0 4px 6px -1px rgba(15, 23, 42, 0.07), 0 2px 4px -2px rgba(15, 23, 42, 0.05)',
        lg: '0 10px 15px -3px rgba(15, 23, 42, 0.08), 0 4px 6px -4px rgba(15, 23, 42, 0.04)',
        xl: '0 20px 25px -5px rgba(15, 23, 42, 0.08), 0 8px 10px -6px rgba(15, 23, 42, 0.04)',
        'sos': '0 4px 14px rgba(220, 38, 38, 0.4)',
      },
      animation: {
        'severity-pulse': 'severity-pulse 2s ease-in-out infinite',
        'map-ping': 'map-ping 1.5s cubic-bezier(0,0,0.2,1) infinite',
        'fade-up': 'fade-up-in 250ms ease-out',
        'slide-panel': 'slide-panel-in 250ms ease-out',
      },
      keyframes: {
        'severity-pulse': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        'map-ping': {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '75%, 100%': { transform: 'scale(2.5)', opacity: '0' },
        },
        'fade-up-in': {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-panel-in': {
          from: { transform: 'translateX(100%)' },
          to: { transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
```

---

## Appendix C — Design Decision Log

| Decision | Rationale |
|----------|-----------|
| **Navy/Slate sidebar, white canvas** | Creates institutional authority without feeling heavy; sidebar recedes, content leads |
| **Red ONLY for critical safety** | Trained user response — red = danger; using it for decorative purposes dilutes the signal |
| **No glassmorphism** | Glassmorphism reduces legibility on safety-critical information; clarity first |
| **Inter font only** | Consistent, highly legible at small sizes, tabular numerics for data alignment |
| **8px spacing base** | Consistent rhythm, works cleanly across all grid sizes |
| **Command Center — dark theme only** | Operator context; dark reduces eye strain in low-light security rooms; creates visual separation from standard ERP pages |
| **SOS 3-second hold** | Prevents accidental triggers in a security-critical system; industry standard for panic buttons |
| **AI insight as card, not popup** | Inline contextual AI is less disruptive than modals; keeps users in workflow |
| **Severity → 4 levels only** | Consistent with the database model; more levels create decision paralysis in emergencies |
| **Lucide icons only** | Single icon system avoids visual inconsistency; Lucide is stroke-consistent and professional |
| **Minimal animation** | Emergency context; excessive motion is distracting when time-critical decisions are being made |
| **Monospace for IDs and codes** | Prevents character confusion (0/O, 1/l/I); standard in professional systems |
| **Right-aligned numeric columns** | Standard accounting/data table practice; enables visual column scanning |
| **Sticky topbar, not sidebar** | On content-heavy pages, topbar actions are always accessible without requiring sidebar interaction |

---

*CampusShield AI — UI/UX Design System v1.0*  
*This document defines the complete visual and interaction language for the platform.*  
*Do not begin implementation until this design is reviewed and approved.*
