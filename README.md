# EventForge 🌟
### The AI Operating System for Live Events

> **EventForge is a real-time AI Event Operating System for planning, operating, and analyzing live events.**  
> It transforms static event management into continuous operational intelligence: streaming live state, detecting anomalies deterministically, compiling concrete evidence, synthesizing AI recommendations, enforcing human approval, executing backend actions, and recording immutable audit trails.

---

## 🎯 Product Definition & Operational Intelligence Loop

EventForge is not a simple CRUD application. The platform runs a continuous closed-loop event operating system:

```text
REAL EVENT DATA (Badge Scans, Room Capacities, Ticket Sales)
      ↓
REAL-TIME STATE (EventBus / Server-Sent Events / Telemetry)
      ↓
DETECTION (Deterministic Thresholds, Attendance Gaps, Room Congestion)
      ↓
EVIDENCE (Live Occupancy Ratios, Seat Headroom, Demand Multipliers)
      ↓
AI / RULE-BASED REASONING (Gemini 2.0 Flash / Fallback Synthesis)
      ↓
RECOMMENDATION (Relocations, Overflows, Reminders, Staff Reassignments)
      ↓
HUMAN APPROVAL (Organizer Command Center with One-Click Execution)
      ↓
BACKEND ACTION (Atomic MongoDB Updates, Announcements)
      ↓
AUDIT TRAIL (Immutable EventAction Records)
      ↓
UPDATED REAL-TIME STATE (Real-time SSE Broadcasts to All Consoles)
```

---

## ⚡ Core Capabilities

### 1. Live Event Pulse Command Center
- **Real-time Event Health Score (0–100)**: Fully explainable weighted index:
  - *Attendance Health (25%)*: Proportion of expected arrivals checked in against dynamic arrival curve.
  - *Capacity Health (25%)*: Room occupancy headroom and overflow prevention.
  - *Schedule Health (20%)*: Active session flow, room conflicts, speaker readiness.
  - *Check-In Health (15%)*: Velocity of attendee badge scans and queue flow.
  - *Session Demand (15%)*: Demand vs room capacity balance across tracks.
- **Live Room & Multi-Track Intelligence**: Tracks room occupancy in real time (`HEALTHY`, `NEAR_CAPACITY`, `CAPACITY_RISK`, `OVERFLOW`).
- **Dynamic Arrival Curve**: Forecasts expected attendance velocity based on event elapsed time and calculates real-time attendance gaps.
- **Zero-Reload Real-time Sync**: Uses Server-Sent Events (`/api/events/:eventId/intelligence/stream`) to update consoles instantly on badge scans, room updates, and operational actions.

### 2. Evidence-Backed AI Recommendations & Human-in-the-Loop Actions
- AI never silently alters consequential event state.
- Operational risks automatically compile concrete evidence:
  - Live room occupancy percentage and seat headroom
  - Registered session demand ratio
  - Comparative hall capacity
- Proposes actionable mitigations (`MOVE_SESSION`, `OPEN_OVERFLOW_ROOM`, `BROADCAST_ANNOUNCEMENT`, `REASSIGN_STAFF`).
- **Idempotent Human Approval**: The organizer can review, approve, or dismiss proposals. Server-side validation checks authorization and state freshness before executing updates in MongoDB and logging audit records in `EventAction`.

### 3. Autonomous AI Event Copilot
- Natural language command assistant grounded strictly in live database records.
- Organizers can query:
  - *"What needs my attention right now?"*
  - *"Why is Hall A at risk?"*
  - *"Which session has the highest demand?"*
  - *"How many attendees have not checked in?"*
  - *"Give me a 30-minute operational status report."*
- Structured query processing -> live MongoDB context -> evidence-backed synthesis with deterministic offline fallback and explicit engine attribution (`Gemini` vs `Event Intelligence (Live Database Telemetry)`).

### 4. Operational Recovery Mode
- Calculated mitigations against real backend state:
  - **Speaker Sudden Cancellation**: Proposes speaker substitution, rescheduling, and attendee broadcast.
  - **Room Evacuation / AV Failure**: Proposes immediate session relocation to halls with available headroom.
  - **Gate Scanner Outage**: Switches staff to degraded offline validation mode.
  - **Hall Overflow Surge**: Proposes simulcast video overflow hall opening.

### 5. Live Event Simulation Engine
- Development and demo simulation tool:
  - **Scenario A (Normal Arrivals)**: Injects steady badge check-ins and normal room flows.
  - **Scenario B (Capacity Surge 94%)**: Injects high-density bursts to trigger capacity alerts and AI overflow proposals.
  - **Reset Telemetry**: Clears simulated state and restores live database numbers.

### 6. Offline-Friendly Check-In Scanner
- Staff check-in includes automatic connectivity detection:
  - **Online Mode (🟢)**: Direct server validation and instant badge verification.
  - **Offline Mode (🟠)**: Locally caches scanned badges with `locally accepted` status, displaying queued scan counts and supporting one-click batch synchronization upon reconnect.

### 7. Post-Event AI Intelligence Report
- Compiles complete event lifecycle metrics:
  - Attendance show-up rate vs no-show percentage
  - Peak room and track capacity utilization
  - Full operational mitigation audit trail
  - AI strategic takeaways and capacity recommendations for future summits
  - One-click printable/exportable dossier

---

## 🏛️ System Architecture

```
EventForge/
├── backend/                         Node.js + Express.js REST API
│   ├── src/
│   │   ├── config/                  MongoDB Atlas connection, super admin bootstrap, demo seeder
│   │   ├── controllers/             Zod-validated controllers (Events, Intelligence, Sponsors, Speakers, Auth)
│   │   ├── middleware/              JWT authentication, strict tenant isolation & event ownership guards
│   │   ├── models/                  Mongoose models (Event, Telemetry, Alert, Recommendation, Action, Ticket, etc.)
│   │   ├── realtime/                EventBus (EventEmitter) & Server-Sent Events (SSE) streaming handler
│   │   ├── routes/                  REST API routers with endpoint rate limiters
│   │   ├── services/                Event Intelligence, AI Engine, Lifecycle & Waitlist Engine
│   │   ├── app.js                   Express application, Helmet, CORS, RequestId observability & error contract
│   │   └── server.js                Server entrypoint with graceful shutdown
│   └── tests/                       Comprehensive unit & integration test suite (24 passing tests)
├── frontend/                        React 18 + Vite 6 Single Page Application
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/              Floating luxury navbar, badges, footer
│   │   │   ├── organizer/           EventPulse, PostEventReport, StageRunOfShow, AIAssistant, TicketManager
│   │   │   └── public/              Public event page, atomic checkout, badge print
│   │   ├── pages/                   Organizer, Attendee, Staff, Admin, Public pages
│   │   ├── services/                Axios API client with dynamic base URL support
│   │   └── styles.css               Tailwind CSS v4 luxury warm-editorial design system
│   └── dist/                        Production build bundle
└── README.md
```

---

## 🔒 Security & Data Integrity Hardening

1. **Strict Tenant Isolation**: Event modification and access requires explicit ownership (`PLATFORM_ADMIN`, `event.organizer === user._id`, or matching `event.organization`). Cross-tenant access is rejected with HTTP 403.
2. **Authoritative Server Role Assignment**: Public registration restricts user self-assignment to `ATTENDEE` or `ORGANIZER` with organization. Escalation attempts to `PLATFORM_ADMIN` or `STAFF` are prevented.
3. **Cryptographically Secure Credentials**: Removed all hardcoded credentials. All staff and speaker invitations generate crypto-random temporary tokens.
4. **Atomic Inventory & Waitlist Promotion**: Ticket categories decrement inventory atomically. On cancellation, seats are restored and oldest waitlisted attendees are automatically promoted with QR badges and notifications.
5. **No Key Leakage**: AI provider keys are protected server-side and never returned in API payloads, database models, or logs.
6. **Observability & Request Tracing**: Every request is assigned a unique `requestId` and tracked with latency, HTTP status, and user context.
7. **Health & Readiness Probes**: `/api/health` reports uptime and liveness, while `/api/ready` validates active database connectivity.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v20 or higher)
- MongoDB Atlas Cloud Database connection

### 1. Environment Configuration

#### Backend (`backend/.env`):
```env
PORT=3100
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/eventforge?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=8h
CLIENT_URL=http://localhost:5173

# Super Admin Bootstrap Credentials
ADMIN_NAME=Platform Administrator
ADMIN_EMAIL=admin@eventforge.com
ADMIN_PASSWORD=your_secure_password_here

# AI Engine Configuration (Gemini API)
AI_PROVIDER=gemini
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.0-flash
```

#### Frontend (`frontend/.env`):
```env
VITE_API_URL=http://localhost:3100/api
```

---

### 2. Running Locally

#### Start the Backend API:
```bash
cd backend
npm install
npm run dev
```
*Backend runs on `http://localhost:3100` (Health: `http://localhost:3100/api/health`, Ready: `http://localhost:3100/api/ready`)*

#### Seed Realistic Demo Data (Optional):
```bash
cd backend
npm run seed
```

#### Start the Frontend Web Application:
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:5173`*

#### Run Automated Test Suite (24 Tests):
```bash
cd backend
npm test
```

#### Build Frontend Production Bundle:
```bash
cd frontend
npm run build
```

---

## ☁️ Deployment Guide

### Backend (Render / Railway / Fly.io)
1. Set Root Directory to `backend/`.
2. Build Command: `npm install`.
3. Start Command: `npm start`.
4. Add Environment Variables: `MONGODB_URI`, `JWT_SECRET`, `CLIENT_URL`, `GEMINI_API_KEY`.
5. Health Check Path: `/api/health`.

### Frontend (Vercel / Netlify / Cloudflare Pages)
1. Set Root Directory to `frontend/`.
2. Framework Preset: `Vite`.
3. Build Command: `npm run build`.
4. Output Directory: `dist`.
5. Add Environment Variable: `VITE_API_URL=https://<your-backend-domain>/api`.

---

## 🎬 Live Demonstration Walkthrough

1. **Before Event (Planning & Forecasting)**:
   - Organizer configures multi-track sessions, speakers, and pricing tiers.
   - AI Content Assistant generates executive marketing campaigns and stage run-of-show pacing.
2. **Live Event (Real-time Operations)**:
   - Door staff scan attendee badges (online or offline).
   - Organizer views **Event Pulse Command Center** live telemetry updating via SSE in real time.
3. **Anomaly Detected**:
   - In Simulator mode, trigger **94% Capacity Risk** surge in Hall A.
   - Deterministic alert flags capacity risk with concrete evidence (occupancy, rated capacity, remaining seats).
4. **AI Recommendation & Human Approval**:
   - AI recommends relocating session to Hall B.
   - Evidence card displays exact headroom comparisons.
   - Organizer clicks **[Approve & Execute]**.
   - System updates session room in MongoDB and broadcasts schedule change announcement over real-time EventBus.
5. **Post-Event (AI Intelligence Report)**:
   - Organizer opens **Post-Event AI Report** to review attendance rates, session utilization, and strategic takeaways for the next conference.
