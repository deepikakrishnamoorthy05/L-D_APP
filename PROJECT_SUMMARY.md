# Systech L&D Platform — Executive & Developer Summary

## Executive Overview
The **Systech Solutions L&D Learning & Skill Intelligence Platform** is an enterprise single-page application designed to centralize and automate the corporate Learning & Development lifecycle:

$$\text{Learn} \longrightarrow \text{Assess} \longrightarrow \text{Analyze} \longrightarrow \text{Feedback} \longrightarrow \text{Improve} \longrightarrow \text{Certify} \longrightarrow \text{Upskill}$$

The platform replaces fragmented spreadsheets and disconnected tools with a unified operational command center for tracking cohort progress, employee readiness, attendance, technical evaluation scores, qualitative feedback, and certification pathways.

---

## Tech Stack Highlights

| Component | Technology | Description |
|---|---|---|
| **Core Framework** | React 18 + TypeScript 5.3 | Type-safe single-page application |
| **Build System** | Vite 5 | Fast HMR dev server (port 3000) & production bundler |
| **Styling & UI** | Vanilla CSS + Radix UI + Lucide | Dark graphite theme, glassmorphic panels, accessible primitives |
| **Animations & 3D**| Framer Motion 13 + Three.js | Micro-interactions, modal transitions & 3D WebGL particle scene |
| **Data Processing**| SheetJS (`xlsx`) | Native client-side spreadsheet importing & parsing |
| **State Management**| React Context API | Modular state stores (`Auth`, `Bootcamp`, `Trainee`, `Session`, `Assessment`, `Feedback`) |

---

## Key Capabilities & Workflows

1. **L&D Command Center**: Executive KPI dashboard featuring active bootcamps, project-readiness rates, interactive learning trends, at-risk trainee alerts, and daily priorities.
2. **Bootcamp & Curriculum Management**: Full cohort lifecycle (Create, Edit, Duplicate, Archive) with custom module sequence builders and trainer allocations.
3. **Trainee Directory & Skill Passport**: Roster management with multi-criteria filters, drag-and-drop Excel workbook importer, and consolidated employee skill passport views.
4. **Sessions, Calendar & Attendance**: Master schedule views (Month/Week/Day), trainer double-booking conflict detection, meeting link generation, and daily attendance recording (Present/Late/Absent).
5. **Assessments & Evaluation**: Test creation across multiple types (Quizzes, Coding Tests, Assignments, Simulation Projects) with score entries and status transitions.
6. **Qualitative Feedback Engine**: Structured feedback entry across 4 dimensions (Technical, Communication, Problem Solving, Attitude) with automated qualitative insight summaries.
7. **AI Skill Intelligence**: Decision-support engine featuring Skill Copilot, Skill Matrix heatmaps, Project Fit matchers, and Track Allocation tools.
8. **Certification Intelligence**: Employee credential portfolios, certification recommendation engines, and certified talent galleries.
9. **L&D Analytics**: Granular analytics featuring organization-wide overall learning metrics and individual trainee timelines.

---

## Prototype Status & Data Layer

> [!NOTE]
> **Frontend Prototype State**: The application currently executes as a client-side prototype.
> - Data is populated from static TypeScript seed files (`src/data/*.ts`) and held in React Context memory.
> - **Persistence**: Trainee records and user login flags persist across browser refreshes via `localStorage` (`ld_trainees`, `ld_platform_user`). Other context changes operate in memory during the active browser session.
> - **Backend / APIs**: No active HTTP backend endpoints, external LLMs, or mail servers are connected. External operations (email previews, calendar imports, AI Copilot responses) are simulated in browser service modules (`src/services/`).

---

## Developer Quickstart

```bash
# 1. Install dependencies
npm install

# 2. Start local development server (runs on http://localhost:3000)
npm run dev

# 3. Type-check and build production bundle
npm run build

# 4. Preview production build locally
npm run preview
```

### Demo Login Credentials
- **Email**: `admin@ldplatform.com`
- **Password**: `Admin@123`

---

## Strategic Production Roadmap

1. **Backend Integration**: Connect a dedicated backend service (Node/NestJS, ASP.NET Core, or Python FastAPI) with a relational database (PostgreSQL) for durable persistence.
2. **Enterprise Identity (SSO)**: Replace client-side local authentication with Azure AD / Okta OAuth2 OIDC SSO.
3. **Formal URL Routing**: Migrate from custom History API state navigation to React Router (`/bootcamps/:id`, `/trainees/:id`).
4. **Real AI Provider**: Connect the Skill Copilot to Azure OpenAI or Gemini API via a secure backend orchestration proxy.
5. **Automated Testing**: Introduce Vitest unit tests for scoring algorithms and Playwright E2E suites for user journeys.
