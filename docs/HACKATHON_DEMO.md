# Luminous AI — Hackathon Judging & Live Demonstration Guide

Welcome to **Luminous AI** — the Autonomous Campus Safety, Emergency Response & Risk Intelligence Platform built for Luminous University.

This guide provides self-contained, step-by-step instructions for hackathon judges and evaluators to test and experience the complete end-to-end autonomous safety workflow. **No developer assistance is required.**

---

## 🎯 Core Demonstration Story Arc

Our story demonstrates how an emergency is reported by a student, evaluated autonomously by **Gemini 3.7 Flash**, dispatched to security, reflected live on geospatial maps and command centers, and synthesized into long-term preventative risk directives for administrators:

```
[Student Reports Incident]
         ↓
[Gemini 3.7 Flash Real-Time Triage]
         ↓ (Severity: CRITICAL • Hazard Evacuation SOP)
[Security Operations Desk & Dispatch]
         ↓ (Capt. Vikram Sharma Dispatches Unit Alpha)
[Live Command Center & Geospatial Campus Map]
         ↓ (Threat Level: HIGH_ALERT • Block D Pulsing Hazard)
[AI Risk Intelligence Pattern Clustering]
         ↓ (Identifies 7 Block D Infrastructure Incidents)
[Campus Admin SOP Directive Execution]
```

---

## 🔑 Demo Accounts & Pre-Configured Personas

You can switch personas at any time using the **Quick Persona Switcher** in the sidebar or top bar on `/demo`.

| Persona Role | User Name | Email Credential | Primary Responsibilities |
| :--- | :--- | :--- | :--- |
| 🎓 **Student** | Aanya Patel | `student@luminous.edu` | Emergency SOS trigger, incident reporting, academic ERP |
| 🛡️ **Security Officer** | Capt. Vikram Sharma | `security@luminous.edu` | Real-time dispatch, incident acknowledgment, visitor clearance |
| 🏛️ **Campus Admin** | Marcus Chen | `admin@luminous.edu` | Risk intelligence, SOP directives, institutional safety posture |
| 👑 **Super Admin** | Dr. Evelyn Vance | `superadmin@luminous.edu` | Full system clearance, audit trail governance, campus oversight |

---

## ⏱️ Option A: 3-Minute Express Demo Script (Quick Judging)

Use this script for a rapid 3-minute walkthrough of the core story arc.

### 📍 Step 1: Open the Demo Control Hub
1. Navigate to `/demo` using the sidebar link **"Hackathon Demo Hub"**.
2. Click **`Reset Demo State`** (top right) to ensure a clean initial environment.

### 📍 Step 2: Student Reports Hero Incident
1. Select the **Student Persona** (Aanya Patel).
2. Click **`Trigger Hero Test Case`** (or open the incident modal at `/incidents`).
3. **Exact Inputs Used**:
   - **Title**: `Smoke & Burning Odor near Block D Electrical Room`
   - **Description**: `There is smoke coming from the electrical room near Block D. I can also smell something burning.`
   - **Location**: `Engineering Block`
   - **Category**: `Fire / Smoke`
   - **Emergency Flag**: `Checked (True)`
4. **Expected UI Changes**:
   - Incident `INC-20260821-xxxx` is generated.
   - Stepper progresses to **Stage 2 (Gemini AI Triage)**.

### 📍 Step 3: Observe Gemini AI Triage Output
1. Review the generated **Gemini 3.7 Flash Triage Card**:
   - **Severity**: `CRITICAL` (Red Badge with AI Sparkle icon)
   - **Confidence**: `98%`
   - **Summary**: *"Active smoke and potential electrical fire hazard detected near Block D. Immediate containment, evacuation, and circuit isolation required."*
   - **Recommended Directives**:
     - *Dispatch Campus Rapid Security & Hazmat Team immediately*
     - *Isolate local electrical main distribution breakers*
     - *Initiate Level 1 localized building evacuation*
   - **Routed Departments**: `Security`, `Maintenance`, `Administration`

### 📍 Step 4: Security Officer Acknowledges & Dispatches
1. Click **`Acknowledge & Dispatch Unit Alpha`** (or switch to Security persona and visit `/security`).
2. **Expected UI Changes**:
   - Incident status transitions to `dispatched`.
   - Security officer **Capt. Vikram Sharma** is assigned to lead response.
   - Immutable audit trail logs `OFFICER_DISPATCHED`.

### 📍 Step 5: Verify Live Map & Command Center
1. Click **`Open Geospatial Map (/campus-map)`**.
2. **Expected UI Changes**:
   - **Engineering Block (ENG-D)** displays a pulsing red radar wave animation.
   - Threat level escalates to **`HIGH_ALERT`**.
   - Active Emergency Alert banner appears at the top of the interface.

---

## ⏳ Option B: 5-Minute Deep-Dive Demo Script (Complete Feature Set)

Use this script to explore AI Risk Intelligence, AI Copilot, and full role-based governance.

### 📍 Steps 1-5: Complete the 3-Minute Express Script Above
Follow Steps 1 through 5 from the 3-Minute script.

### 📍 Step 6: Admin AI Risk Pattern Intelligence
1. Switch persona to **Campus Admin** (`admin@luminous.edu` / Marcus Chen).
2. Navigate to **`/safety/risk-intelligence`**.
3. **Observe AI Pattern Clustering**:
   - AI identifies **Cluster #1**: *"Block D (Engineering) Recurrent Infrastructure & Electrical Strain"*.
   - **Grounded Evidence**: Highlights 7 incidents in Block D over the past 30 days (including lab power surges, fan motor bearing failures, and smoke alerts).
   - **Root Cause**: Heavy GPU experiment power draw causing thermal strain on sub-panels.
4. Click **`Execute Directive & Schedule Inspection`**.
5. **Expected UI Changes**:
   - Status updates to **"Directive Applied & Work Order Dispatched"**.
   - Audit trail records `AI_INSIGHT_RECOMMENDATION_EXECUTED`.

### 📍 Step 7: Interact with CampusShield AI Copilot
1. Click the floating **`Gemini 3.7 Copilot`** button in the bottom-right corner (or topbar).
2. Type or select the quick query:
   - *"What is the active security situation at Block D?"*
3. **Expected AI Response**:
   - Copilot synthesizes real-time incident data, acknowledges the critical smoke report in Block D, confirms Hazmat Unit Alpha dispatch, and outlines active safety protocols.

---

## 🤖 Predictable AI Triage & Fallback Behavior

### Live Gemini API Mode vs. Deterministic Fallback Engine

Luminous AI is engineered with dual-layer AI reliability:

1. **Live Gemini 3.7 Flash Mode**:
   - When `GEMINI_API_KEY` or `GOOGLE_AI_API_KEY` is configured in environment variables, the system executes real-time server-side generation via Google Generative Language APIs.
   - User inputs are sanitized and fenced within `<incident_report>` tags to prevent prompt injection.

2. **Deterministic Expert Engine Fallback**:
   - If the API key is not present or if network connectivity is interrupted during a live presentation, the system automatically uses the `deterministicTriageFallback` engine.
   - **Guaranteed Triage Outcome**: Recognizes smoke/burning/electrical keywords in Block D, outputting identical `CRITICAL` severity, `98%` confidence, and Hazmat directives within sub-1ms response time.
   - **No Faked Data in Normal Product**: The fallback logic is cleanly isolated, fully functional, and explicitly reported in telemetry cards.

### Testing the AI Sandbox
1. Go to `/demo` and scroll to **`Gemini 3.7 Flash Real-Time AI Triage Sandbox`**.
2. Select any preset (e.g., *Medical: Collapsed Student in Library* or *Security Breach: Server Room B*).
3. Click **`Run Gemini Triage`**.
4. Observe the response latency (in ms), structured Zod-validated JSON output, severity badge, and department routing.

---

## 🔄 Demo Reset Functionality

At any time during testing, click the **`Reset Demo State`** button on `/demo` or run `resetDemoData()` from the UI.

This operation:
- Clears browser `localStorage` state keys (`campusshield_incidents_v3`, `audit_logs`, etc.).
- Restores the 14 realistic seeded campus incidents across 10 official facilities.
- Resets campus Threat Level to `ELEVATED`.
- Resets notification feeds and visitor logs to initial clean baseline.

---

## 📋 Evaluation & Judging Checklist

| Feature Criteria | Verification Path | Status |
| :--- | :--- | :--- |
| **Student Incident Reporting** | `/demo` Step 1 or `/incidents` modal | ✅ Verified |
| **Gemini AI Structured Triage** | `/api/ai/classify-incident` / Triage Card | ✅ Verified |
| **Security Operations Desk** | `/security` (Acknowledge & Dispatch) | ✅ Verified |
| **Geospatial Campus Map** | `/campus-map` (Pulsing hazard node) | ✅ Verified |
| **Command Center & Threat Level** | `/safety/command-center` (HIGH_ALERT) | ✅ Verified |
| **Emergency Alerts Broadcast** | `/safety/emergency` & Topbar Banner | ✅ Verified |
| **AI Risk Pattern Mining** | `/safety/risk-intelligence` (Block D cluster) | ✅ Verified |
| **Admin Directive Execution** | Work order dispatch on Risk Intelligence | ✅ Verified |
| **Role-Based Clearance (RBAC)** | Persona Switcher in Sidebar / Topbar | ✅ Verified |
| **Deterministic Fallback Engine** | Tested in Sandbox & Service layer | ✅ Verified |
| **Clean Demo Reset** | `Reset Demo State` on `/demo` | ✅ Verified |

---

*Luminous AI — Autonomous Safety, Security & Risk Intelligence for Modern Higher Education.*
