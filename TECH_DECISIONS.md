# CampusShield AI — Tech Decisions

> Rationale for every technology choice, optimized for hackathon velocity + demo impact.

---

## 1. Frontend Framework: Next.js 14 (App Router)

**Decision**: Use Next.js 14 with App Router and Server Components.

**Rationale**:
- **App Router** gives us route groups `(auth)` and `(dashboard)` for clean layout separation
- **Server Components** reduce client bundle — most ERP pages are read-heavy and can render on server
- **Route Handlers** (`/api/*`) replace the need for a separate backend
- **Middleware** gives us a single auth/RBAC enforcement point
- **Built-in** file-based routing eliminates router configuration
- **Vercel deployment** is one-click (critical for hackathon demo)

**Tradeoffs**:
- App Router has a learning curve vs Pages Router
- Server/Client component boundary requires careful planning
- We accept this because the architecture benefits outweigh the cost

**Server vs Client Component Split**:
| Component Type | Rendering | Why |
|---|---|---|
| Layout, Sidebar | Server | Static structure, role-based nav |
| Data Tables (ERP) | Server | Fetch data on server, render HTML |
| Incident Form | Client | Interactive, needs state + AI streaming |
| Command Center | Client | Realtime updates via Supabase |
| Campus Map | Client | Interactive SVG with click handlers |
| Charts (Recharts) | Client | Recharts requires browser APIs |
| SOS Button | Client | Needs geolocation + immediate interaction |

---

## 2. UI Library: shadcn/ui + Tailwind CSS

**Decision**: Use shadcn/ui for component primitives, Tailwind CSS for styling.

**Rationale**:
- **shadcn/ui** is NOT a dependency — it copies components into our repo, giving us full control
- Components are **accessible by default** (built on Radix UI)
- **Consistent design system** out of the box (buttons, dialogs, cards, tables, forms, dropdowns)
- **Tailwind** enables rapid prototyping without writing CSS files
- Both are the **most popular** choice in the Next.js ecosystem — abundant examples

**Components we'll use heavily**:
- `Card` — stat cards, incident cards, insight cards
- `Table` + `DataTable` — all ERP list views
- `Dialog` / `Sheet` — incident detail, SOS modal
- `Form` + `Input` + `Select` — incident report form
- `Badge` — severity badges, status badges
- `Alert` — emergency alerts
- `Tabs` — command center sections
- `Tooltip` — campus map pins
- `Toast` — notifications
- `Skeleton` — loading states
- `DropdownMenu` — user menu, actions

---

## 3. Database + Backend: Supabase

**Decision**: Use Supabase as a unified backend (PostgreSQL, Auth, Storage, Realtime).

**Rationale**:
- **Single platform** for DB + Auth + Storage + Realtime = less integration work
- **PostgreSQL** gives us proper relational modeling, JSONB for AI responses, and RLS
- **Row Level Security** is our final authorization layer — defense in depth
- **Supabase Auth** handles JWT tokens, session management, password hashing
- **Supabase Realtime** gives us WebSocket-based live updates for the command center without building our own WebSocket server
- **Supabase Storage** for evidence photos, visitor ID proofs
- **Free tier** is sufficient for hackathon (500MB DB, 1GB storage, 50k monthly active users)
- **Dashboard** provides instant DB management during development

**Why not Firebase?**
- PostgreSQL > Firestore for relational ERP data (joins, complex queries)
- RLS is more powerful than Firebase Security Rules for our RBAC model
- SQL migrations are version-controllable

**Why not a separate Express/Fastify backend?**
- Next.js Route Handlers eliminate the need for a separate server
- One deployment target (Vercel) instead of two
- Supabase handles what a custom backend would provide (auth, realtime, storage)

**Client Architecture**:
```
Browser Supabase Client (lib/supabase/client.ts)
  → Used in Client Components
  → Uses anon key
  → Subject to RLS policies

Server Supabase Client (lib/supabase/server.ts)
  → Used in Server Components + Route Handlers
  → Uses anon key with user's cookies
  → Subject to RLS policies

Admin Supabase Client (lib/supabase/admin.ts)
  → Used ONLY in Route Handlers
  → Uses service_role key
  → Bypasses RLS (for audit logs, admin operations)
  → NEVER exposed to the browser
```

---

## 4. AI: Gemini 2.0 Flash

**Decision**: Use Gemini 2.0 Flash via the `@google/generative-ai` SDK.

**Rationale**:
- **Fast** — Flash model has lowest latency in the Gemini family (~1-2s responses)
- **Cheap** — generous free tier, low cost per token
- **Structured output** — native JSON mode reduces parsing errors
- **Large context window** — can include historical incident data for trend analysis
- **Good at classification** — well-suited for categorization and severity assessment

**Why not GPT-4 / Claude?**
- Gemini Flash is faster for real-time classification (demo impact)
- Free tier is more generous for hackathon
- Structured output mode is natively supported
- Google AI SDK is simpler than OpenAI SDK for basic use cases

**AI Integration Pattern**:
```typescript
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({
  model: 'gemini-2.0-flash',
  generationConfig: {
    responseMimeType: 'application/json',
    temperature: 0.1,  // Deterministic for classification
  },
});
```

**Critical Security Decision**: Gemini has NO database access. It receives text input and returns structured JSON. All database writes go through our validated API layer.

---

## 5. Authentication: Supabase Auth with Cookie-Based Sessions

**Decision**: Use Supabase Auth with `@supabase/ssr` for cookie-based sessions.

**Rationale**:
- **HTTP-only cookies** are more secure than localStorage tokens
- **`@supabase/ssr`** handles cookie management for both server and client
- **Next.js Middleware** can read cookies for route protection
- **Server Components** can access the session without client-side JS
- **Supabase Auth** supports email-based authentication **and** OAuth/social login through its built-in provider federation

**Auth Methods**:
- **Email-based authentication** — implemented (sign-up, sign-in, sign-out, password recovery, email verification states).
- **OAuth / social login** — supported by Supabase Auth; the login UI exposes provider buttons that call `signInWithOAuth`. The OAuth flow is fully functional **once the desired provider(s) are enabled in the Supabase project** (Auth → Providers) and the project callback/redirect URL is configured. **Status: partially implemented (UI + client wired; requires Supabase provider configuration and verification).**

**Authentication vs. Authorization**: Supabase Auth is only responsible for establishing identity and issuing the session/JWT. Institutional roles (student, faculty, security, admin, warden, parent, placement_officer, super_admin) are resolved **server-side from the `profiles` table**, never accepted from client input. Access is enforced separately by Next.js middleware + route-handler RBAC and by PostgreSQL Row Level Security policies keyed on the authenticated JWT.

**Session Flow**:
1. User authenticates (email/password via `signInWithPassword`; or an OAuth provider via `signInWithOAuth`) → Supabase creates a JWT / session
2. `@supabase/ssr` stores the session in HTTP-only cookies
3. Middleware reads the cookie on every request, refreshes if needed, and verifies an authenticated user exists
4. Server Components use `createServerClient` to get the authenticated user
5. Route Handlers use `createServerClient` to verify auth before DB operations, then resolve the role server-side

**Why not NextAuth?**
- Supabase Auth is already integrated with our database
- NextAuth would add unnecessary complexity when we're already using Supabase
- One less dependency to manage

---

## 6. RBAC: Custom Middleware-Based with Database Roles

**Decision**: Implement RBAC using a custom middleware + role field in `profiles` table.

**Rationale**:
- **Simple and fast** — role is a single column on the profiles table
- **Middleware enforcement** — checked on every navigation before page renders
- **API enforcement** — checked in every Route Handler before any mutation
- **RLS enforcement** — Supabase policies provide the last line of defense
- **No external RBAC library needed** — our role hierarchy is flat enough

**Why not CASL / Casbin?**
- Over-engineered for 9 roles with straightforward permission matrices
- Custom solution is ~50 lines of code
- Faster to debug during hackathon

**Implementation**:
```typescript
// Simple, fast, debuggable
function hasPermission(role: string, resource: string, action: string): boolean {
  return PERMISSIONS[resource]?.[action]?.includes(role) ?? false;
}
```

---

## 7. Realtime: Supabase Realtime Channels

**Decision**: Use Supabase Realtime for live updates on the command center, incident list, and campus map.

**Rationale**:
- **Zero infrastructure** — Supabase manages WebSocket connections
- **Postgres Changes** — subscribe to INSERT/UPDATE on specific tables
- **Broadcast** — custom events for emergency alerts
- **Already included** in Supabase — no additional cost or setup

**Channels We Subscribe To**:
```typescript
// Command Center subscribes to all incident changes
supabase.channel('incidents')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'incidents'
  }, handleIncidentChange)
  .subscribe();

// Emergency alerts broadcast to all users
supabase.channel('emergency')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'emergency_alerts'
  }, handleNewAlert)
  .subscribe();
```

**Fallback**: If Realtime has issues, implement 5-second polling as a backup.

---

## 8. Charts: Recharts

**Decision**: Use Recharts for all data visualizations.

**Rationale**:
- **React-native** — declarative, composable API
- **Responsive** — `ResponsiveContainer` handles resizing
- **Good defaults** — charts look professional with minimal configuration
- **Well-documented** — easy to look up during hackathon
- **Lightweight** — smaller bundle than alternatives like Chart.js

**Charts We'll Build**:
| Chart | Type | Data |
|-------|------|------|
| Incident Trend | LineChart / AreaChart | Incidents over time |
| Severity Distribution | PieChart / DonutChart | Critical/High/Medium/Low |
| Category Breakdown | BarChart | By incident category |
| Hourly Heatmap | BarChart (horizontal) | Incidents by hour of day |
| Location Hotspots | BarChart | Top incident locations |
| Response Time | LineChart | Average resolution time |

---

## 9. Campus Map: Custom SVG

**Decision**: Use a custom SVG-based campus map instead of Google Maps / Mapbox.

**Rationale**:
- **No API key needed** — Google Maps requires billing setup
- **Full control** — we can style pins, buildings, zones exactly how we want
- **Lightweight** — no heavy map library in bundle
- **Fast** — renders instantly, no tile loading
- **Demo-friendly** — a fictional campus map is more compelling than a real map for hackathon judges

**Implementation**:
- Design a simple campus layout as SVG (buildings, roads, green areas)
- Plot incidents as colored pins on the SVG
- Click pin → show incident details in a popup/dialog
- Color code: Red (critical), Orange (high), Yellow (medium), Blue (low)
- Pulsing animation on active/critical incidents

**Tradeoff**: Not a real geo map, but much faster to build and more visually appealing for demo.

---

## 10. Icons: Lucide React

**Decision**: Use Lucide icons throughout the application.

**Rationale**:
- **Tree-shakeable** — only imports the icons we use
- **Consistent style** — clean, modern line icons
- **1000+ icons** — covers all our needs (shield, alert, map-pin, users, clipboard, etc.)
- **React components** — `<Shield size={20} />` is cleaner than icon fonts

---

## 11. Form Validation: Zod

**Decision**: Use Zod for both frontend form validation and backend API validation.

**Rationale**:
- **Single schema, dual use** — same Zod schema validates frontend forms AND backend API input
- **TypeScript inference** — `z.infer<typeof schema>` gives us types for free
- **AI output validation** — critical for validating Gemini's structured responses
- **Composable** — schemas can extend and combine
- **Standard** in Next.js ecosystem

---

## 12. Deployment: Vercel

**Decision**: Deploy to Vercel for the hackathon demo.

**Rationale**:
- **Zero config** for Next.js — push to main, auto-deploy
- **Edge functions** for middleware (fast auth checks)
- **Free tier** is sufficient
- **Custom domain** in minutes if needed
- **Preview deployments** on every PR

---

## 13. State Management: React Context + Supabase

**Decision**: Use React Context for auth/role state. No Redux/Zustand.

**Rationale**:
- **Server Components** handle most data fetching — no client-side cache needed
- **Supabase Realtime** handles live data updates — no global store needed
- **Auth Context** is the only global client state we need
- Adding a state management library would be over-engineering for this scope

---

## 14. Styling Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Color scheme | Dark-capable with safety-focused palette | Red (critical), Orange (high), Yellow (medium), Blue (info) |
| Primary color | Blue (#3B82F6) | Professional, trustworthy |
| Danger color | Red (#EF4444) | Universal danger signal |
| Font | Inter (system/Google) | Clean, professional, good readability |
| Border radius | 0.5rem (shadcn default) | Modern, not too rounded |
| Spacing | Tailwind default scale | Consistent 4px grid |
| Dark mode | Not for v1 (light only) | Saves time, looks fine for demo |

---

## Summary: Why This Stack Works for a Hackathon

| Concern | Solution | Speed Factor |
|---------|----------|-------------|
| Need a full-stack framework | Next.js (frontend + API in one) | 2x faster than separate frontend + backend |
| Need auth + database + storage + realtime | Supabase (all-in-one) | 3x faster than building each separately |
| Need professional UI fast | shadcn/ui + Tailwind | 2x faster than custom CSS |
| Need AI integration | Gemini Flash (fast, structured output) | Simple SDK, instant results |
| Need live updates | Supabase Realtime (built-in) | 5x faster than custom WebSocket server |
| Need deployment | Vercel (zero-config for Next.js) | Deploy in 2 minutes |
| Need charts | Recharts (declarative React) | 2x faster than D3 |
| Need a map | Custom SVG (no API keys) | 3x faster than Google Maps setup |

**Total estimated integration overhead**: ~2 hours (vs ~8-12 hours with separate tools)

This stack is optimized for **velocity**, **demo impact**, and **code quality** in a 24–48 hour window.
