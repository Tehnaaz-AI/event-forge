# EventForge 🌟
### Enterprise Multi-Track Conference & Event Operating System

> **Plan. Connect. Orchestrate. Measure.**  
> EventForge is a premier, production-grade corporate event orchestration platform engineered for high-concurrency summits, multi-track agendas, atomic ticket registrations, on-site optical badge validation, and generative AI content synthesis.

---

## 🏛️ System Architecture

```
EventForge/
├── backend/                         Node.js + Express.js REST API
│   ├── src/
│   │   ├── config/                  MongoDB connection & Super Admin bootstrap
│   │   ├── controllers/             Zod-validated request handlers
│   │   ├── middleware/              JWT authentication, RBAC & defensive ObjectId guards
│   │   ├── models/                  Mongoose schemas (16 interrelated collections)
│   │   ├── routes/                  REST API endpoints (ordered for route safety)
│   │   ├── services/                Business logic, MongoDB aggregations & AI engine
│   │   ├── app.js                   Express application & security middleware (Helmet, CORS)
│   │   └── server.js                Server entrypoint with graceful shutdown
│   └── .env                         Environment credentials & bootstrap configurations
├── frontend/                        React 18 + Vite 6 Single Page Application
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/              Floating curved navbar, badges, UI elements
│   │   │   ├── organizer/           Overview analytics, Staff, Sessions, Speakers, Sponsors, AI Studio
│   │   │   └── public/              AI Session Finder, Ticket Checkout, Badge Print View
│   │   ├── layouts/                 PublicLayout with dynamic auth-aware footer
│   │   ├── pages/                   Home, Explore, About, Features, Dashboard, Login, Profile
│   │   ├── services/                Axios API client with dynamic base URL support
│   │   ├── styles.css               Tailwind CSS v4 + Warm Beige luxury design system
│   │   └── main.jsx                 Root React entrypoint with TanStack Query provider
│   └── index.html                   HTML5 boilerplate with Google Fonts & SEO meta tags
└── README.md
```

---

## 🎨 Luxury Editorial Design System
EventForge adopts an executive **Warm Beige, Sand, Cream, Gold, and Deep Espresso** palette:
- **Backgrounds**: Pure Ivory (`#FDFAF5`), Warm Sand (`#FAF8F5`), Crisp White (`#FFFFFF`).
- **Borders & Accents**: Soft Linen (`#EFE8DA`), Golden Honey (`#C28E27`), Warm Amber (`#B45309`).
- **Typography**: Deep Espresso (`#1C1917`), Charcoal (`#292524`).
- **Custom Fonts**:
  - `Dancing Script`: Signature cursive brand accents.
  - `Playfair Display` & `Cinzel`: Editorial luxury headers.
  - `Plus Jakarta Sans`: High-legibility modern UI body copy.
  - `JetBrains Mono`: Pass codes, ticket numbers, and diagnostic logs.
- **Micro-Interactions**: Floating curved navbar with backdrop blur, slim warm-beige custom scrollbars (`.scrollbar-beige`), hover-lift card elevations, and tactile scanline animations.

---

## 👥 6 Integrated Role Portals & Workflows

### 1. Platform Super Administrator (`PLATFORM_ADMIN`)
- **Bootstrap Initialization**: Initialized automatically on backend launch from `ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` in `backend/.env`.
- **Master Console** (`/dashboard/admin`): Cross-tenant telemetry (total users, active conferences, total GMV volume, enterprise organizations).
- **User Directory**: Search, role filtering, instant privilege modification, and platform-wide deletion.
- **Conference Roster**: Global oversight of all drafts, published events, and live conferences across all organizers.

### 2. Event Organizer Workspace (`ORGANIZER`)
Accessed via `/dashboard/organizer` and `/dashboard/organizer/events/:id`:
- **Executive Overview**: 100% dynamic analytics calculated via MongoDB time-series aggregations (Gross pass revenue, registration velocity curves, tier distribution donut, and live door check-in rates).
- **Door Staff & Crew Manager**: Provision gatekeepers with dedicated duty roles (`CHECK_IN`, `SUPPORT`, `MANAGER`) and copyable credentials.
- **Sessions & Multi-Track Scheduler**: Conflict-free room and time scheduling, track tagging, and speaker linking.
- **Keynote Speakers Studio**: Onboard keynote luminaries, panel moderators, biographies, headshots, and session track assignments.
- **Sponsors & Packages Hub**: Create custom partnership tiers (Platinum, Gold, Silver) with price and spot limits, and onboard brand sponsors.
- **EventForge AI Studio**: Multi-pipeline generative engine for marketing copywriting, agenda ideation, and speaker abstracts.
- **Broadcast Announcements**: Send instant updates to registered attendees.
- **Event Configuration**: Update venue, category, dates, and lifecycle status (`DRAFT`, `PUBLISHED`, `REGISTRATION_OPEN`, `LIVE`, `COMPLETED`).

### 3. Attendee Pass Hub (`ATTENDEE`)
- **Public Discovery** (`/explore`): Search summits by title, category, date, and location.
- **Atomic Checkout**: Transactional pass registration with MongoDB inventory decrements to prevent overbooking.
- **My Passes & Badges** (`/dashboard/attendee`): View confirmed tickets, generated dynamic QR admission badges, and one-click printable badge generator formatted for physical conference lanyards.
- **AI Session Matchmaker**: Natural language matching against event session tracks based on attendee learning goals.

### 4. Door Staff Optical Scanner (`STAFF`)
- **Live Camera Scanner** (`/dashboard/staff`): Real-time optical video QR scanner with targeting HUD and animated laser scanlines.
- **Manual Verification**: Rapid manual ticket code validation for backup check-in.
- **Instant Door Feedback**: Visual approval banners and Web Audio API synthesized audio chimes for gatekeepers.
- **Live Arrivals Stream**: Real-time log of verified entries.

### 5. Speaker Management (`SPEAKER`)
- Profile bios, expertise tags, talk abstracts, and multi-track session assignments.

### 6. Corporate Brand Sponsors (`SPONSOR`)
- Package deliverable tracking, booth allocations, and sponsor brand showcase.

---

## 🤖 Real Multi-Model AI Engine

EventForge features an enterprise multi-provider AI engine ([`backend/src/services/aiService.js`](file:///d:/Projects/EventForge/backend/src/services/aiService.js)):
- **Supported Providers & Models**:
  - **Google Gemini**: `gemini-2.0-flash`, `gemini-1.5-flash`, `gemini-2.5-flash`, `gemini-flash-latest`
  - **Anthropic Claude**: `claude-3-5-sonnet-20241022`, `claude-3-haiku-20240307`
  - **OpenAI**: `gpt-4o`, `gpt-4o-mini`, `gpt-3.5-turbo`
  - **Groq Cloud**: `llama-3.3-70b-versatile`, `mixtral-8x7b-32768`
  - **DeepSeek AI**: `deepseek-chat`, `deepseek-reasoner`
  - **OpenRouter & BIOS Cloud**: Multi-model routing gateways
- **Purpose-Driven Synthesis Pipelines**:
  1. 🚀 **Marketing Copywriter**: Synthesizes social posts (X/Twitter), LinkedIn executive announcements, and targeted email invitations.
  2. 💡 **Multi-Track Ideation**: Generates 3 comprehensive breakout sessions with learning objectives and speaker profiles.
  3. 🎙️ **Keynote Speech & Q&A Coach**: Creates minute-by-minute stage pacing, teleprompter cue notes, and predicted audience Q&A.
  4. 🎯 **Attendee Matchmaker**: Recommends personalized event agendas based on attendee interests with scrollable summaries.
- **Fault-Tolerant Fallback**: If an API key is not configured or encounters network issues, EventForge automatically executes its local high-fidelity synthesis engine without crashing the UI.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v20 or higher)
- MongoDB Atlas Cloud Database connection

### 1. Environment Setup

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
ADMIN_PASSWORD=Password123!

# AI Engine Configuration
AI_PROVIDER=gemini
GEMINI_API_KEY=your_gemini_api_key_here
AI_MODEL=gemini-1.5-flash
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
*Backend runs on `http://localhost:3100` (Health check: `http://localhost:3100/api/health`)*

#### Start the Frontend Web Application:
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:5173`*

#### Run Automated Unit Tests:
```bash
cd backend
npm test
```

#### Build Production Bundle:
```bash
cd frontend
npm run build
```

---

## 🔒 Security & Data Integrity
- **MongoDB Atlas Cloud Persistence**: Production cloud database storage with zero local mock data dependencies.
- **Defensive Route Ordering**: Static sub-routes precede parameterized paths to prevent Mongoose CastErrors.
- **Atomic Booking**: MongoDB transactions ensure ticket categories never oversell beyond total capacity.
- **Role-Based Access Control**: Strict middleware verification for `PLATFORM_ADMIN`, `ORGANIZER`, `STAFF`, and `ATTENDEE`.
- **QR Code Cryptographic Signatures**: Gate check-in parses JSON payloads, `EVENTFORGE:...` signatures, and ticket identifiers.
