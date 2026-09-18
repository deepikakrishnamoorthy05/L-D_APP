# Systech Solutions — AI-Powered L&D Learning & Skill Intelligence Platform
## Complete Technical & Functional Project Documentation

---

## 1. Project Overview

### Project Name
**Systech Solutions — AI-Powered L&D Learning & Skill Intelligence Platform** (`systech-ld-intelligence-platform`)

### Purpose
An internal enterprise platform designed for Systech Solutions to centralize, orchestrate, and analyze the end-to-end Learning and Development (L&D) lifecycle across technical bootcamps, employee upskilling initiatives, continuous performance evaluations, and certification readiness tracking.

### Problem It Solves
Prior to this application, L&D operational data—ranging from training calendars, attendance records, and assessment test scores to qualitative trainer feedback, skill matrices, and certification credentials—was fragmented across disconnected spreadsheets, email threads, and disparate tools. This fragmentation prevented L&D leaders from obtaining a single operational source of truth regarding employee readiness, skill gaps, and learning ROI. The platform solves this by consolidating all L&D operations into a unified intelligence command center.

### Target Users
1. **L&D Administrators**: Primary operational persona. Responsible for monitoring organization-wide learning KPIs, managing bootcamps, analyzing skill readiness, overseeing early interventions, and viewing analytics.
2. **Trainers**: Responsible for executing training sessions, marking attendance, scoring technical assessments/assignments/simulation projects, and submitting qualitative performance feedback.
3. **Coordinators**: Responsible for batch scheduling, tracking trainee submissions, logistics, and calendar management.
4. **Trainees / Employees**: Represented as managed records in the system. The platform tracks their personal learning journey, assessment performance, skill passport, and certification milestones.

### Main Features
- **L&D Command Center**: High-level executive dashboard featuring real-time KPIs, active bootcamp statistics, project-readiness metrics, dynamic learning progress charts, AI-driven learning insights, attention-required trainee table, upcoming training cards, and certification snapshots.
- **Bootcamp & Cohort Management**: Full lifecycle management for training cohorts (create, edit, duplicate, archive, delete), module definitions, instructor/coordinator assignments, and roster allocation.
- **Trainee Directory & Skill Passport**: Employee directory with multi-criteria filtering, search, profile inspection, learning journey tracking, project-readiness indicators, and spreadsheet import/export capabilities.
- **Sessions, Calendar & Attendance**: Operational schedule management featuring calendar views, daily/weekly session timelines, trainer conflict detection, meeting link generation, session rescheduling/cancellations, attendance status marking (Present, Late, Absent), and automated attendance percentage recalculations.
- **Assessments & Assignment Tracking**: Comprehensive assessment engine supporting multiple evaluation types (Quiz, Coding, Presentation, Simulation Project), score entries, status transitions (Draft, Scheduled, In Progress, Grading, Completed), and performance analytics.
- **Qualitative Trainer Feedback**: Capture of multi-category feedback (Technical, Communication, Problem Solving, Attitude) with automated qualitative insight summaries, trainer approvals, and status workflows.
- **AI Skill Intelligence Hub**: Interactive decision-support module offering 6 focused perspectives: Skill Copilot, Skill Matrix, Project Fit Matcher, Track Allocation Engine, Cohort Coverage Heatmap, and Talent Snapshot.
- **Certification Intelligence**: Tracking of employee credential portfolios, automated certification recommendation engine, certification status lifecycle tracking, and certified talent gallery.
- **Comprehensive L&D Analytics**: Deep-dive analytics with dual views—Organization-wide overall learning metrics and Granular individual trainee analytics.

### Current Project Status
The project is currently a **Frontend Single-Page Application (SPA) Prototype** built with React 18, TypeScript 5.3, Vite 5, Framer Motion, and Vanilla CSS.
- **State & Data Layer**: Driven by in-memory React Context stores (`AuthContext`, `BootcampContext`, `TraineeContext`, `SessionContext`, `AssessmentContext`, `FeedbackContext`, `TrainingContext`) pre-populated from static TypeScript mock datasets (`src/data/*.ts`).
- **Persistence**: Trainee records and user authentication flags persist in browser `localStorage` (`ld_trainees`, `ld_platform_user`). Other mutations operate in React memory during the active session.
- **Backend & Network**: No active backend database, server APIs, external LLM endpoints, or mail servers are connected. External operations (email previews, calendar imports, AI Copilot responses) are simulated synchronously in browser services.

---

## 2. Tech Stack

| Technology Layer | Technology / Library | Version | Purpose & Usage Location |
|---|---|---|---|
| **Frontend Framework** | React | `^18.2.0` | Core UI component framework and virtual DOM rendering ([`src/App.tsx`](file:///c:/Users/DeepikaMookanKrishna/OneDrive%20-%20Systech%20Solutions,%20Inc/Desktop/LD_APP/src/App.tsx), [`src/main.tsx`](file:///c:/Users/DeepikaMookanKrishna/OneDrive%20-%20Systech%20Solutions,%20Inc/Desktop/LD_APP/src/main.tsx)) |
| **DOM Renderer** | React DOM | `^18.2.0` | Client-side DOM mounting ([`src/main.tsx`](file:///c:/Users/DeepikaMookanKrishna/OneDrive%20-%20Systech%20Solutions,%20Inc/Desktop/LD_APP/src/main.tsx)) |
| **Programming Language** | TypeScript | `^5.3.3` | Type definitions, interfaces, strict static type checking ([`tsconfig.json`](file:///c:/Users/DeepikaMookanKrishna/OneDrive%20-%20Systech%20Solutions,%20Inc/Desktop/LD_APP/tsconfig.json), [`src/types/*`](file:///c:/Users/DeepikaMookanKrishna/OneDrive%20-%20Systech%20Solutions,%20Inc/Desktop/LD_APP/src/types)) |
| **Build Tool & Dev Server** | Vite | `^5.1.4` | Development server (port 3000), fast HMR, and production bundling ([`vite.config.ts`](file:///c:/Users/DeepikaMookanKrishna/OneDrive%20-%20Systech%20Solutions,%20Inc/Desktop/LD_APP/vite.config.ts)) |
| **UI & Component Primitives** | Radix UI | Dialog `^1.1.23`, Tooltip `^1.2.16`, Select `^2.3.7`, Tabs `^1.1.21`, Dropdown `^2.1.24` | Accessible modal dialogs and tooltip wrappers ([`src/components/ui/Modal.tsx`](file:///c:/Users/DeepikaMookanKrishna/OneDrive%20-%20Systech%20Solutions,%20Inc/Desktop/LD_APP/src/components/ui/Modal.tsx), [`src/components/ui/Tooltip.tsx`](file:///c:/Users/DeepikaMookanKrishna/OneDrive%20-%20Systech%20Solutions,%20Inc/Desktop/LD_APP/src/components/ui/Tooltip.tsx)) |
| **Icon Library** | Lucide React | `^0.344.0` | Vector icon set used across headers, buttons, navigation, and badges |
| **Styling & CSS Architecture** | Vanilla CSS / Custom Design System | Custom | Global design tokens, dark graphite palette, typography, glassmorphism, responsive grid layout ([`src/index.css`](file:///c:/Users/DeepikaMookanKrishna/OneDrive%20-%20Systech%20Solutions,%20Inc/Desktop/LD_APP/src/index.css), [`src/App.css`](file:///c:/Users/DeepikaMookanKrishna/OneDrive%20-%20Systech%20Solutions,%20Inc/Desktop/LD_APP/src/App.css)) |
| **Animations** | Framer Motion | `^13.1.1` | Modal transitions, card hover elevation, page entrance animations, tabs transitions |
| **3D WebGL Rendering** | Three.js | `^0.162.0` | 3D particle canvas and neural visualizer background component ([`src/components/ThreeVisualizer.tsx`](file:///c:/Users/DeepikaMookanKrishna/OneDrive%20-%20Systech%20Solutions,%20Inc/Desktop/LD_APP/src/components/ThreeVisualizer.tsx)) |
| **Spreadsheet Processing** | SheetJS (`xlsx`) | `^0.18.5` | In-browser parsing of uploaded XLSX/CSV trainee workbooks and template generation ([`src/components/Trainees/ImportTraineesModal.tsx`](file:///c:/Users/DeepikaMookanKrishna/OneDrive%20-%20Systech%20Solutions,%20Inc/Desktop/LD_APP/src/components/Trainees/ImportTraineesModal.tsx)) |
| **Class Helper** | `clsx` | `^2.1.1` | Conditional class string composition for UI components ([`src/components/ui/*`](file:///c:/Users/DeepikaMookanKrishna/OneDrive%20-%20Systech%20Solutions,%20Inc/Desktop/LD_APP/src/components/ui)) |
| **State Management** | React Context API | Native | Centralized domain stores for Auth, Bootcamps, Trainees, Sessions, Assessments, Feedback ([`src/context/*`](file:///c:/Users/DeepikaMookanKrishna/OneDrive%20-%20Systech%20Solutions,%20Inc/Desktop/LD_APP/src/context)) |
| **Database & ORM** | Not Implemented (Mock + LocalStorage) | N/A | Local browser storage for trainee data and session state ([`src/context/TraineeContext.tsx`](file:///c:/Users/DeepikaMookanKrishna/OneDrive%20-%20Systech%20Solutions,%20Inc/Desktop/LD_APP/src/context/TraineeContext.tsx)) |
| **Authentication** | Demo Service + LocalStorage | N/A | Hardcoded credentials validation and session persistence ([`src/services/authService.ts`](file:///c:/Users/DeepikaMookanKrishna/OneDrive%20-%20Systech%20Solutions,%20Inc/Desktop/LD_APP/src/services/authService.ts)) |
| **API Layer** | Local Service Modules | N/A | Synchronous TypeScript calculation engines ([`src/services/*`](file:///c:/Users/DeepikaMookanKrishna/OneDrive%20-%20Systech%20Solutions,%20Inc/Desktop/LD_APP/src/services)) |
| **Package Manager** | npm | `^10.x` | Dependency resolution and scripts runner ([`package.json`](file:///c:/Users/DeepikaMookanKrishna/OneDrive%20-%20Systech%20Solutions,%20Inc/Desktop/LD_APP/package.json)) |
| **Deployment & Hosting** | GitHub Pages / Vercel / Netlify | N/A | GitHub Actions workflow ([`.github/workflows/deploy.yml`](file:///c:/Users/DeepikaMookanKrishna/OneDrive%20-%20Systech%20Solutions,%20Inc/Desktop/LD_APP/.github/workflows/deploy.yml)) & SPA rewrites ([`vercel.json`](file:///c:/Users/DeepikaMookanKrishna/OneDrive%20-%20Systech%20Solutions,%20Inc/Desktop/LD_APP/vercel.json)) |

---

## 3. Project Architecture

### Overall Architecture Overview
The platform is structured as a decoupled Single-Page Application. High-level architecture follows a layered unidirectional data flow pattern:

```text
+-----------------------------------------------------------------------------------+
|                                 USER BROWSER                                      |
|                                                                                   |
|   +---------------------------------------------------------------------------+   |
|   |                       REACT 18 SINGLE PAGE APPLICATION                    |   |
|   |                                                                           |   |
|   |  +---------------------+   +---------------------+   +-----------------+  |   |
|   |  |  LoginPage (/login) |   | AppShell Layout     |   | Global Toast    |  |   |
|   |  +---------------------+   +---------------------+   +-----------------+  |   |
|   |                                       |                                   |   |
|   |     +---------------------------------+--------------------------------+  |   |
|   |     |                                                                  |  |   |
|   |     v                                                                  v  |   |
|   |  +-------------------------------+         +------------------------+  |   |
|   |  | Navigation Router State       |         | View Components        |  |   |
|   |  | (window.history + currentNav) |         | - CommandCenterView    |  |   |
|   |  +-------------------------------+         | - BootcampManagement   |  |   |
|   |                                            | - TraineeManagement    |  |   |
|   |                                            | - SessionManagement    |  |   |
|   |                                            | - AssessmentManagement |  |   |
|   |                                            | - SkillIntelligence    |  |   |
|   |                                            | - Certifications       |  |   |
|   |                                            | - AnalyticsView        |  |   |
|   |                                            +------------------------+  |   |
|   |                                                        |               |   |
|   |                                                        v               |   |
|   |   +----------------------------------------------------------------+   |   |
|   |   |                     REACT CONTEXT DOMAIN STORES                |   |   |
|   |   |  AuthContext  |  BootcampContext  | TraineeContext             |   |   |
|   |   |  SessionContext | AssessmentContext | FeedbackContext          |   |   |
|   |   +----------------------------------------------------------------+   |   |
|   |             |                                       |                  |   |
|   |             v                                       v                  |   |
|   |   +-------------------+                   +-------------------------+  |   |
|   |   |  Browser Storage  |                   | Browser Services        |  |   |
|   |   |  - localStorage   |                   | - skillIntelligence     |  |   |
|   |   |    ['ld_trainees']|                   | - certIntelligence      |  |   |
|   |   |    ['ld_user']    |                   | - AICommunication       |  |   |
|   |   +-------------------+                   | - SheetJS FileReader    |  |   |
|   |                                           +-------------------------+  |   |
|   +---------------------------------------------------------------------------+   |
+-----------------------------------------------------------------------------------+
```

### Communication & Data Flow
1. **Routing & Navigation**: Handled in [`src/App.tsx`](file:///c:/Users/DeepikaMookanKrishna/OneDrive%20-%20Systech%20Solutions,%20Inc/Desktop/LD_APP/src/App.tsx) and [`src/components/CommandCenter/AppShell.tsx`](file:///c:/Users/DeepikaMookanKrishna/OneDrive%20-%20Systech%20Solutions,%20Inc/Desktop/LD_APP/src/components/CommandCenter/AppShell.tsx) using HTML5 `window.history.pushState` / `popstate` events synchronized with React `currentNav` state.
2. **Domain State Management**: Context providers wrap the core app in [`src/App.tsx`](file:///c:/Users/DeepikaMookanKrishna/OneDrive%20-%20Systech%20Solutions,%20Inc/Desktop/LD_APP/src/App.tsx). Sub-components consume data and dispatch mutations using custom hooks (`useAuth`, `useBootcamps`, `useTrainees`, `useSessions`, `useAssessments`, `useFeedback`).
3. **Cross-Context Synchronization**: Context actions cascade updates across domain stores. For instance, saving attendance in [`SessionContext`](file:///c:/Users/DeepikaMookanKrishna/OneDrive%20-%20Systech%20Solutions,%20Inc/Desktop/LD_APP/src/context/SessionContext.tsx) updates session stats and automatically recalculates trainee attendance percentages in [`TraineeContext`](file:///c:/Users/DeepikaMookanKrishna/OneDrive%20-%20Systech%20Solutions,%20Inc/Desktop/LD_APP/src/context/TraineeContext.tsx).

---

## 4. Page / Screen Documentation

### Summary Matrix of Application Pages

| # | Page / Screen Name | Path / Route | Access Role | Primary Purpose | Key Components Used |
|---|---|---|---|---|---|
| 1 | **Login Page** | `/login` | Public | Authenticate demo admin users | `LoginPage`, `ThreeVisualizer` |
| 2 | **Command Center** | `/command-center`, `/` | Authenticated Admin | Executive L&D operational monitoring | `CommandCenterView`, `KpiCards`, `LearningOverviewChart`, `DailyBriefCard` |
| 3 | **Bootcamp Management** | `/bootcamps` | Authenticated Admin | Manage training cohorts and modules | `BootcampManagement`, `CreateBootcampModal`, `BootcampOrbit` |
| 4 | **Cohort Details** | State: `bootcamp-details` | Authenticated Admin | Deep-dive cohort inspector & module manager | `BootcampDetails`, `AddModuleModal`, `TraineeSelectionModal` |
| 5 | **Training Management** | `/training` | Authenticated Admin | High-level training plan & trainer allocation | `TrainingManagement`, `PlanTrainingModal`, `TrainerAvailabilityModal` |
| 6 | **Trainees Directory** | `/trainees` | Authenticated Admin | Employee learning directory & file import | `TraineeManagement`, `AddTraineeModal`, `ImportTraineesModal` |
| 7 | **Trainee Profile** | State: `trainee-profile` | Authenticated Admin | Consolidated employee Skill Passport | `TraineeProfile`, `CircularProgressRing`, `StatusBadge` |
| 8 | **Sessions & Calendar** | `/calendar`, `/sessions` | Authenticated Admin | Schedule sessions & monitor training timeline | `SessionManagement`, `CalendarView`, `ScheduleSessionModal` |
| 9 | **Session Details** | State: `session-details` | Authenticated Admin | Specific session details & attendee list | `SessionDetails`, `AIEmailPreviewModal` |
| 10 | **Attendance Record** | State: `attendance-record` | Authenticated Admin | Mark daily session attendance | `AttendanceManagement` |
| 11 | **Assessment Management**| `/assessments` | Authenticated Admin | Create evaluations, log marks, publish results| `AssessmentManagement`, `CreateAssessmentModal`, `EnterScoresModal` |
| 12 | **Feedback Management** | `/feedback` | Authenticated Admin | Capture trainer feedback & generate AI insights| `FeedbackManagement`, `AddTrainerFeedbackModal`, `ImportTrainerFeedbackModal` |
| 13 | **Skill Intelligence** | `/skill-intelligence` | Authenticated Admin | AI decision-support & project readiness | `SkillIntelligenceView`, `CompareTraineesModal`, `ReadinessSimulatorModal` |
| 14 | **Certifications** | `/certifications` | Authenticated Admin | Certifications tracking & recommendations | `CertificationIntelligenceView`, `CertificationDetailsModal` |
| 15 | **L&D Analytics** | `/analytics` | Authenticated Admin | Executive overall & individual performance analytics| `AnalyticsView`, `MetricCard`, `ProgressBar` |

---

### Detailed Page Specifications

#### 1. Login Page
- **Route / URL**: `/login`
- **Purpose**: Authenticate users into the platform and initialize user session state.
- **Access**: Public / Unauthenticated users.
- **Entry Points**: Initial page load when unauthenticated or manual redirect from `/`.
- **Main UI Sections**: Left 3D WebGL intelligence scene (`ThreeVisualizer`), Right glassmorphic login card with brand logo, input fields, demo hint box, and action buttons.
- **Components Used**: [`LoginPage.tsx`](file:///c:/Users/DeepikaMookanKrishna/OneDrive%20-%20Systech%20Solutions,%20Inc/Desktop/LD_APP/src/components/LoginPage.tsx), [`ThreeVisualizer.tsx`](file:///c:/Users/DeepikaMookanKrishna/OneDrive%20-%20Systech%20Solutions,%20Inc/Desktop/LD_APP/src/components/ThreeVisualizer.tsx).
- **User Actions**: Enter email & password, toggle "Remember Me", click "Sign In", click "Quick Fill Demo Credentials", click "Forgot Password".
- **Forms & Validation**: Email (required, format check), Password (required). Displays inline error banner on invalid credentials.
- **API Calls**: Invokes `authService.login({ email, password, rememberMe })`.
- **Data Displayed**: Demofast credentials tip (`admin@ldplatform.com` / `Admin@123`), login status messages.
- **Navigation**: Upon successful login, updates URL to `/command-center` and renders `AppShell`.

#### 2. L&D Command Center
- **Route / URL**: `/command-center` or `/`
- **Purpose**: Serve as the operational home base for L&D administrators.
- **Access**: Authenticated `LD_ADMIN` role.
- **Main UI Sections**: Top KPI Bar, Left Column (Learning Overview SVG Chart, Active Bootcamp Performance Cards, Executive Recent Activity), Right Column (Daily Briefing Card, Trainees Needing Attention Table, Upcoming Training List, Certification Snapshot).
- **Components Used**: [`CommandCenterView.tsx`](file:///c:/Users/DeepikaMookanKrishna/OneDrive%20-%20Systech%20Solutions,%20Inc/Desktop/LD_APP/src/components/CommandCenter/CommandCenterView.tsx), [`KpiCards.tsx`](file:///c:/Users/DeepikaMookanKrishna/OneDrive%20-%20Systech%20Solutions,%20Inc/Desktop/LD_APP/src/components/CommandCenter/KpiCards.tsx), [`LearningOverviewChart.tsx`](file:///c:/Users/DeepikaMookanKrishna/OneDrive%20-%20Systech%20Solutions,%20Inc/Desktop/LD_APP/src/components/CommandCenter/LearningOverviewChart.tsx), [`DailyBriefCard.tsx`](file:///c:/Users/DeepikaMookanKrishna/OneDrive%20-%20Systech%20Solutions,%20Inc/Desktop/LD_APP/src/components/CommandCenter/DailyBriefCard.tsx), [`TraineesAttentionTable.tsx`](file:///c:/Users/DeepikaMookanKrishna/OneDrive%20-%20Systech%20Solutions,%20Inc/Desktop/LD_APP/src/components/CommandCenter/TraineesAttentionTable.tsx).
- **User Actions**: Click KPI cards to navigate to filtered Trainee lists, click "View All" on bootcamps, click specific trainee rows to open profile, launch quick actions (Schedule Session, Create Assessment).
- **Data Displayed**: Active Bootcamps count (4), Total Trainees (48), Project-Ready percentage (68%), At-Risk Trainees (5), Average Progress (76.4%), chart telemetry.

#### 3. Bootcamp Management
- **Route / URL**: `/bootcamps`
- **Purpose**: Oversee all training cohorts, create new bootcamps, and monitor batch progress.
- **Access**: Authenticated `LD_ADMIN`.
- **Main UI Sections**: Header controls (Search input, Year filter, Technology filter, Status tabs, Grid/Table view toggle, "Create Bootcamp" button), Bootcamp Cards grid / directory table.
- **Components Used**: [`BootcampManagement.tsx`](file:///c:/Users/DeepikaMookanKrishna/OneDrive%20-%20Systech%20Solutions,%20Inc/Desktop/LD_APP/src/components/Bootcamps/BootcampManagement.tsx), [`CreateBootcampModal.tsx`](file:///c:/Users/DeepikaMookanKrishna/OneDrive%20-%20Systech%20Solutions,%20Inc/Desktop/LD_APP/src/components/Bootcamps/CreateBootcampModal.tsx).
- **User Actions**: Filter cohorts, switch display modes, open Create Modal, click cohort card to view details, duplicate cohort, archive cohort, delete cohort.
- **Forms**: Create/Edit Bootcamp Form (Name, Code, Tech Track, Start/End Dates, Lead Trainer, Coordinator, Capacity, Description). Validation ensures mandatory fields and end date > start date.

#### 4. Cohort Details (`bootcamp-details`)
- **Route / URL**: State view `currentNav = 'bootcamp-details'`
- **Purpose**: Deep inspection of a specific bootcamp cohort, including curriculum module builder, assigned trainees, and assessment progress.
- **Components Used**: [`BootcampDetails.tsx`](file:///c:/Users/DeepikaMookanKrishna/OneDrive%20-%20Systech%20Solutions,%20Inc/Desktop/LD_APP/src/components/Bootcamps/BootcampDetails.tsx), [`AddModuleModal.tsx`](file:///c:/Users/DeepikaMookanKrishna/OneDrive%20-%20Systech%20Solutions,%20Inc/Desktop/LD_APP/src/components/Bootcamps/AddModuleModal.tsx), [`TraineeSelectionModal.tsx`](file:///c:/Users/DeepikaMookanKrishna/OneDrive%20-%20Systech%20Solutions,%20Inc/Desktop/LD_APP/src/components/Bootcamps/TraineeSelectionModal.tsx).
- **Tabs**: Overview, Trainees Roster, Curriculum / Modules, Schedule, Assessment Performance.
- **User Actions**: Add module, edit module order, remove module, enroll trainees, remove trainees, jump to session attendance.

#### 5. Trainees Directory
- **Route / URL**: `/trainees`
- **Purpose**: Central roster of all employees undergoing training.
- **Components Used**: [`TraineeManagement.tsx`](file:///c:/Users/DeepikaMookanKrishna/OneDrive%20-%20Systech%20Solutions,%20Inc/Desktop/LD_APP/src/components/Trainees/TraineeManagement.tsx), [`AddTraineeModal.tsx`](file:///c:/Users/DeepikaMookanKrishna/OneDrive%20-%20Systech%20Solutions,%20Inc/Desktop/LD_APP/src/components/Trainees/AddTraineeModal.tsx), [`ImportTraineesModal.tsx`](file:///c:/Users/DeepikaMookanKrishna/OneDrive%20-%20Systech%20Solutions,%20Inc/Desktop/LD_APP/src/components/Trainees/ImportTraineesModal.tsx).
- **User Actions**: Search trainees, filter by Bootcamp/Readiness Status/Performance Level, toggle Card/Table view, Add Single Trainee, Import Spreadsheet, Download Excel Template, click trainee to view Skill Passport.
- **Spreadsheet Import Workflow**: Drag & drop XLSX file → SheetJS parses worksheets → Preview table shows valid/invalid rows → Click "Confirm Import" → Trainees appended to `TraineeContext` & persisted in `localStorage['ld_trainees']`.

#### 6. Trainee Profile (`trainee-profile`)
- **Route / URL**: State view `currentNav = 'trainee-profile'`
- **Purpose**: Consolidated Employee Skill Passport.
- **Components Used**: [`TraineeProfile.tsx`](file:///c:/Users/DeepikaMookanKrishna/OneDrive%20-%20Systech%20Solutions,%20Inc/Desktop/LD_APP/src/components/Trainees/TraineeProfile.tsx).
- **Tabs**: Overview (Bio, Key Stats, Skill Radar, Risk Level), Learning Journey, Progress Breakdown, Attendance History, Assessments & Scores, Skill Inventory.
- **Data Displayed**: Calculated overall score, attendance percentage, completed modules count, project fit score, certification status.

#### 7. Sessions & Calendar
- **Route / URL**: `/calendar` or `/sessions`
- **Purpose**: Manage the L&D master schedule, session timelines, and trainer assignments.
- **Components Used**: [`SessionManagement.tsx`](file:///c:/Users/DeepikaMookanKrishna/OneDrive%20-%20Systech%20Solutions,%20Inc/Desktop/LD_APP/src/components/Sessions/SessionManagement.tsx), [`CalendarView.tsx`](file:///c:/Users/DeepikaMookanKrishna/OneDrive%20-%20Systech%20Solutions,%20Inc/Desktop/LD_APP/src/components/Sessions/CalendarView.tsx), [`ScheduleSessionModal.tsx`](file:///c:/Users/DeepikaMookanKrishna/OneDrive%20-%20Systech%20Solutions,%20Inc/Desktop/LD_APP/src/components/Sessions/ScheduleSessionModal.tsx).
- **Views**: Calendar Grid View (Month/Week/Day), Schedule List View, Module Schedule View.
- **User Actions**: Schedule Session, Drag-and-drop reschedule calendar events, filter by Bootcamp/Trainer, mark session as Completed, open Attendance.
- **Trainer Conflict Logic**: Scheduling modal validates against existing sessions for the selected trainer to prevent double-booking.

#### 8. Attendance Record (`attendance-record`)
- **Route / URL**: State view `currentNav = 'attendance-record'`
- **Purpose**: Record daily attendance for trainees enrolled in a session.
- **Components Used**: [`AttendanceManagement.tsx`](file:///c:/Users/DeepikaMookanKrishna/OneDrive%20-%20Systech%20Solutions,%20Inc/Desktop/LD_APP/src/components/Sessions/AttendanceManagement.tsx).
- **User Actions**: Toggle attendance status per trainee (Present, Late, Absent), enter remarks, click "Mark All Present", Save Attendance.
- **Data Cascade**: Saving updates session attendance counts and recalculates the overall attendance percentage for each affected trainee.

#### 9. Assessments Management
- **Route / URL**: `/assessments`
- **Purpose**: Create and manage technical tests, quizzes, assignments, and simulation projects.
- **Components Used**: [`AssessmentManagement.tsx`](file:///c:/Users/DeepikaMookanKrishna/OneDrive%20-%20Systech%20Solutions,%20Inc/Desktop/LD_APP/src/components/Assessments/AssessmentManagement.tsx), [`CreateAssessmentModal.tsx`](file:///c:/Users/DeepikaMookanKrishna/OneDrive%20-%20Systech%20Solutions,%20Inc/Desktop/LD_APP/src/components/Assessments/CreateAssessmentModal.tsx), [`EnterScoresModal.tsx`](file:///c:/Users/DeepikaMookanKrishna/OneDrive%20-%20Systech%20Solutions,%20Inc/Desktop/LD_APP/src/components/Assessments/EnterScoresModal.tsx).
- **User Actions**: Create Assessment, Enter Trainee Marks, Publish Assessment Results, Filter by Type/Status.

#### 10. Feedback Management
- **Route / URL**: `/feedback`
- **Purpose**: Capture qualitative feedback from trainers regarding trainee performance.
- **Components Used**: [`FeedbackManagement.tsx`](file:///c:/Users/DeepikaMookanKrishna/OneDrive%20-%20Systech%20Solutions,%20Inc/Desktop/LD_APP/src/components/Feedback/FeedbackManagement.tsx), [`AddTrainerFeedbackModal.tsx`](file:///c:/Users/DeepikaMookanKrishna/OneDrive%20-%20Systech%20Solutions,%20Inc/Desktop/LD_APP/src/components/Feedback/AddTrainerFeedbackModal.tsx).
- **User Actions**: Submit qualitative feedback, run AI Feedback Analyzer, approve and publish feedback.

#### 11. Skill Intelligence Hub
- **Route / URL**: `/skill-intelligence`
- **Purpose**: AI-assisted decision-support engine for skill gap analysis and project allocation.
- **Sub-Views**: 
  1. `copilot`: Natural language question interface.
  2. `skill-matrix`: Heatmap comparing trainees across technical skills.
  3. `project-fit`: Match algorithm pairing trainees with client project requirements.
  4. `track-allocation`: Specialization track recommendations.
  5. `cohort-coverage`: Batch-wide competency analysis.
  6. `talent-snapshot`: Quick talent pool filter.
- **Components Used**: [`SkillIntelligenceView.tsx`](file:///c:/Users/DeepikaMookanKrishna/OneDrive%20-%20Systech%20Solutions,%20Inc/Desktop/LD_APP/src/components/SkillIntelligence/SkillIntelligenceView.tsx), [`skillIntelligenceService.ts`](file:///c:/Users/DeepikaMookanKrishna/OneDrive%20-%20Systech%20Solutions,%20Inc/Desktop/LD_APP/src/services/skillIntelligenceService.ts).

#### 12. Certifications Intelligence
- **Route / URL**: `/certifications`
- **Purpose**: Track employee certifications, readiness scores, and target credentials.
- **Components Used**: [`CertificationIntelligenceView.tsx`](file:///c:/Users/DeepikaMookanKrishna/OneDrive%20-%20Systech%20Solutions,%20Inc/Desktop/LD_APP/src/components/Certifications/CertificationIntelligenceView.tsx), [`CertificationDetailsModal.tsx`](file:///c:/Users/DeepikaMookanKrishna/OneDrive%20-%20Systech%20Solutions,%20Inc/Desktop/LD_APP/src/components/Certifications/CertificationDetailsModal.tsx).

#### 13. L&D Analytics
- **Route / URL**: `/analytics`
- **Purpose**: Executive analytics dashboards for organizational learning performance.
- **Components Used**: [`AnalyticsView.tsx`](file:///c:/Users/DeepikaMookanKrishna/OneDrive%20-%20Systech%20Solutions,%20Inc/Desktop/LD_APP/src/components/Analytics/AnalyticsView.tsx).
- **Tabs**: Overall Analytics (organization-wide KPIs, score distributions, attendance metrics), Individual Analytics (trainee selector and detailed timeline).

---

## 5. Component Documentation

Reusable components are organized logically under `src/components/`:

```text
src/components/
├── Analytics/             # Analytics views and metrics
├── Assessments/           # Evaluation modals and management tables
├── Bootcamps/             # Cohort creation, details, and module builders
├── Certifications/        # Certification portfolio and intelligence tools
├── CommandCenter/         # Shell header, sidebar, and dashboard cards
├── Common/                # UI utilities (3D cards, rings, counter animations)
├── Feedback/              # Qualitative feedback management & import modals
├── Sessions/              # Calendar, scheduling modals, attendance recorders
├── SkillIntelligence/     # Readiness simulators and profile comparers
├── Trainees/              # Trainee directory, profiles, spreadsheet importer
├── Training/              # High-level training plan builders
└── ui/                    # Base UI primitives (Button, Modal, Input, Badge, etc.)
```

### Core UI Primitives (`src/components/ui/`)

| Component Name | File Path | Inputs / Props | Internal State | Description & Usage |
|---|---|---|---|---|
| `Button` | [`src/components/ui/Button.tsx`](file:///c:/Users/DeepikaMookanKrishna/OneDrive%20-%20Systech%20Solutions,%20Inc/Desktop/LD_APP/src/components/ui/Button.tsx) | `variant`, `size`, `icon`, `isLoading`, `children` | None | Reusable styled button supporting primary, secondary, danger, and glass variants. |
| `Modal` | [`src/components/ui/Modal.tsx`](file:///c:/Users/DeepikaMookanKrishna/OneDrive%20-%20Systech%20Solutions,%20Inc/Desktop/LD_APP/src/components/ui/Modal.tsx) | `isOpen`, `onClose`, `title`, `size`, `children` | None | Accessible Radix Dialog wrapper providing backdrop blur, entrance animations, and esc handling. |
| `Input` | [`src/components/ui/Input.tsx`](file:///c:/Users/DeepikaMookanKrishna/OneDrive%20-%20Systech%20Solutions,%20Inc/Desktop/LD_APP/src/components/ui/Input.tsx) | `label`, `error`, `icon`, `HTMLInputProps` | Focus state | Styled form text input with label and validation error text. |
| `StatusBadge` | [`src/components/ui/StatusBadge.tsx`](file:///c:/Users/DeepikaMookanKrishna/OneDrive%20-%20Systech%20Solutions,%20Inc/Desktop/LD_APP/src/components/ui/StatusBadge.tsx) | `status`, `label`, `size` | None | Color-coded status badge for project-ready, active, at-risk, completed statuses. |
| `ProgressBar` | [`src/components/ui/ProgressBar.tsx`](file:///c:/Users/DeepikaMookanKrishna/OneDrive%20-%20Systech%20Solutions,%20Inc/Desktop/LD_APP/src/components/ui/ProgressBar.tsx) | `value`, `max`, `showLabel`, `color` | None | Animated linear progress bar with gradient fill. |
| `ProgressRing` | [`src/components/ui/ProgressRing.tsx`](file:///c:/Users/DeepikaMookanKrishna/OneDrive%20-%20Systech%20Solutions,%20Inc/Desktop/LD_APP/src/components/ui/ProgressRing.tsx) | `radius`, `stroke`, `progress`, `color` | None | Circular SVG progress ring indicator. |
| `GlassCard` | [`src/components/ui/GlassCard.tsx`](file:///c:/Users/DeepikaMookanKrishna/OneDrive%20-%20Systech%20Solutions,%20Inc/Desktop/LD_APP/src/components/ui/GlassCard.tsx) | `className`, `hoverEffect`, `children` | Hover state | Glassmorphic container panel with subtle border and backdrop filter. |

---

## 6. API Documentation

### Backend Endpoint Status
> [!NOTE]
> **No HTTP Backend Endpoints**: The application currently operates as a client-side prototype. There are no active HTTP REST, GraphQL, or WebSocket endpoints. 

### Internal Service Layer Architecture
All data operations are handled in-process via synchronous TypeScript service modules located in `src/services/`.

#### 1. Authentication Service (`src/services/authService.ts`)
- `login(credentials: LoginCredentials): Promise<AuthResult>`
  - **Input**: `{ email: string, password: string, rememberMe?: boolean }`
  - **Output**: `{ success: boolean, user?: AuthUser, token?: string, errorMessage?: string }`
  - **Implementation**: Validates credentials against `DEMO_CREDENTIALS` (`admin@ldplatform.com` / `Admin@123`). Returns mock JWT token `systech_jwt_demo_token_2026`.

#### 2. Skill Intelligence Service (`src/services/skillIntelligenceService.ts`)
- `askCopilot(query: string): CopilotQueryResult`
  - **Input**: Query string (e.g., *"Who are the top React developers ready for deployment?"*)
  - **Output**: Structured recommendation object containing answer text, matching trainee records, confidence score, and suggested filters.
- `calculateProjectFit(traineeId: string, requirements: ProjectRequirements): FitResult`
  - **Output**: Weighted score (0–100%) based on primary/secondary skills and experience level.

#### 3. Certification Service (`src/services/certificationIntelligenceService.ts`)
- `getRecommendations(traineeId: string): CertificationRecommendation[]`
  - **Output**: Array of recommended certifications based on tech track and assessment performance.

#### 4. Notification & Communication Services (`src/services/NotificationService.ts`, `AICommunicationService.ts`)
- `sendTrainerNotification(details: NotificationDetails): NotificationResult`
  - **Implementation**: Appends notification record to private in-memory array.
- `generateEmailPreview(templateType: string, params: Object): EmailPreview`
  - **Implementation**: Interpolates parameter strings into predefined HTML email templates.

---

## 7. Database Documentation

### Schema & Entity Model (Domain Entities)

Because the project uses client-side state, entities are defined as TypeScript interfaces in `src/types/`.

```text
+-----------------------+          +-----------------------+
|       BOOTCAMP        |          |        TRAINEE        |
+-----------------------+          +-----------------------+
| id (PK)               | 1      * | id (PK)               |
| name                  |----------| bootcampId (FK)       |
| code                  |          | name, email, role     |
| techTrack             |          | status, readiness     |
| startDate, endDate    |          | overallProgress       |
| leadTrainerId         |          | attendancePercent     |
+-----------------------+          +-----------------------+
            | 1                                | 1
            |                                  |
            | *                                | *
+-----------------------+          +-----------------------+
|    TRAINING_SESSION   |          |   ATTENDANCE_RECORD   |
+-----------------------+          +-----------------------+
| id (PK)               |          | id (PK)               |
| bootcampId (FK)       |          | sessionId (FK)        |
| title, date, duration |          | traineeId (FK)        |
| trainerId, meetingUrl |          | status (Present/Absent)|
+-----------------------+          +-----------------------+
            | 1
            |
            | *
+-----------------------+          +-----------------------+
|      ASSESSMENT       |          |   ASSESSMENT_RESULT   |
+-----------------------+          +-----------------------+
| id (PK)               | 1      * | id (PK)               |
| bootcampId (FK)       |----------| assessmentId (FK)     |
| title, type, maxScore |          | traineeId (FK)        |
| dueDate, status       |          | scoreObtained, status |
+-----------------------+          +-----------------------+
```

### Entity Specifications

1. **Bootcamp** ([`src/types/bootcamp.ts`](file:///c:/Users/DeepikaMookanKrishna/OneDrive%20-%20Systech%20Solutions,%20Inc/Desktop/LD_APP/src/types/bootcamp.ts))
   - `id`: String (Primary Key, e.g., `bootcamp-1`)
   - `name`: String (e.g., *"Full Stack React & Node Cohort 12"*)
   - `code`: String (e.g., *"FS-2026-C12"*)
   - `techTrack`: String (*"Full Stack"*, *"Data Engineering"*, *"Cloud DevOps"*)
   - `status`: String (*"Active"*, *"Upcoming"*, *"Completed"*, *"Archived"*)
   - `enrolledCount`: Number

2. **Trainee** ([`src/types/trainee.ts`](file:///c:/Users/DeepikaMookanKrishna/OneDrive%20-%20Systech%20Solutions,%20Inc/Desktop/LD_APP/src/types/trainee.ts))
   - `id`: String (Primary Key, e.g., `TRN-1001`)
   - `bootcampId`: String (Foreign Key -> `Bootcamp.id`)
   - `name`, `email`: Strings
   - `status`: Enum (*"Active"*, *"Project Ready"*, *"Needs Attention"*, *"Archived"*)
   - `readinessScore`: Number (0 - 100)
   - `attendancePercent`: Number (0 - 100)
   - **Storage**: Seeded from `traineeMockData.ts`, persisted in `localStorage['ld_trainees']`.

3. **TrainingSession** ([`src/types/session.ts`](file:///c:/Users/DeepikaMookanKrishna/OneDrive%20-%20Systech%20Solutions,%20Inc/Desktop/LD_APP/src/types/session.ts))
   - `id`: String (Primary Key)
   - `bootcampId`: String (Foreign Key)
   - `trainerId`: String
   - `date`, `startTime`, `endTime`: Strings
   - `status`: Enum (*"Scheduled"*, *"In Progress"*, *"Completed"*, *"Cancelled"*)

4. **Assessment & AssessmentResult** ([`src/types/assessment.ts`](file:///c:/Users/DeepikaMookanKrishna/OneDrive%20-%20Systech%20Solutions,%20Inc/Desktop/LD_APP/src/types/assessment.ts))
   - `id`: String (Primary Key)
   - `type`: Enum (*"Quiz"*, *"Coding Test"*, *"Assignment"*, *"Simulation Project"*)
   - `maxScore`: Number
   - `results`: Map of `traineeId -> { scoreObtained, remarks, status }`

---

## 8. Authentication & Authorization

### Client Authentication Flow
1. User opens application URL.
2. `App.tsx` initializes `AuthProvider`. `AuthContext` checks `localStorage.getItem('ld_platform_user')`.
3. If unauthenticated, `App.tsx` renders `LoginPage`.
4. User submits form -> Calls `authService.login({ email, password, rememberMe })`.
5. If credentials match `admin@ldplatform.com` / `Admin@123`:
   - Auth token `systech_jwt_demo_token_2026` generated.
   - User object stored in `localStorage['ld_platform_user']`.
   - `isAuthenticated` state set to `true`.
   - History API replaces URL with `/command-center`.

### Roles & Permissions
- Defined Role Types: `LD_ADMIN`, `TRAINER`, `COORDINATOR`, `TRAINEE`.
- Current Prototype State: All features run under the `LD_ADMIN` role context. Client-side route guards check `isAuthenticated`.

---

## 9. User Flows

### Major End-to-End User Journey: Trainee Spreadsheet Import

```text
[User clicks "Import Trainees"] 
             │
             ▼
[ImportTraineesModal Opens] ──► [Downloads Template XLSX (Optional)]
             │
             ▼
[User Drags & Drops XLSX File]
             │
             ▼
[FileReader reads ArrayBuffer]
             │
             ▼
[SheetJS parses workbook.Sheets]
             │
             ▼
[Rows Normalized & Validated] ──► (Displays Valid/Invalid Preview Rows)
             │
             ▼
[User Clicks "Confirm Import"]
             │
             ▼
[TraineeContext.importTrainees()]
             │
             ▼
[Appends Trainees & Writes to localStorage['ld_trainees']]
             │
             ▼
[Triggers Toast Banner + Refreshes Trainee Directory UI]
```

---

## 10. Folder / File Structure

```text
c:\Users\DeepikaMookanKrishna\OneDrive - Systech Solutions, Inc\Desktop\LD_APP\
├── .github/
│   └── workflows/
│       └── deploy.yml            # GitHub Actions CI/CD deployment to GitHub Pages
├── public/
│   ├── _redirects                # Netlify SPA rewrite configuration
│   └── favicon.ico
├── src/
│   ├── assets/                   # Static image assets & company logos
│   ├── components/               # Modular UI feature components
│   │   ├── Analytics/            # Overall and individual analytics dashboards
│   │   ├── Assessments/          # Test creation, scoring modals & tracking
│   │   ├── Bootcamps/            # Cohort management & curriculum builders
│   │   ├── Certifications/       # Certification portfolio & AI recommendations
│   │   ├── CommandCenter/        # Shell layout, header, sidebar & main dashboard
│   │   ├── Common/               # Animated counters, visual rings, 3D cards
│   │   ├── Feedback/             # Qualitative feedback management & AI analyzer
│   │   ├── Sessions/             # Calendar, schedule modals & attendance recorder
│   │   ├── SkillIntelligence/    # Readiness simulators, matrix & Copilot view
│   │   ├── Trainees/             # Trainee directory, profile passport & importer
│   │   ├── Training/             # High-level training planner
│   │   ├── ui/                   # Reusable primitive UI components
│   │   ├── ErrorBoundary.tsx     # Global React error boundary
│   │   ├── LeftVisualPanel.tsx   # Login page visual panel wrapper
│   │   ├── LoginForm.tsx         # Alternative standalone login form
│   │   ├── LoginPage.tsx         # Main login page component
│   │   └── ThreeVisualizer.tsx   # Three.js 3D WebGL particle scene
│   ├── context/                  # Centralized domain state stores (React Context)
│   │   ├── AssessmentContext.tsx # Assessment & test score state store
│   │   ├── AuthContext.tsx       # Authentication state store
│   │   ├── BootcampContext.tsx   # Cohort & curriculum state store
│   │   ├── FeedbackContext.tsx   # Trainer feedback state store
│   │   ├── SessionContext.tsx    # Sessions & attendance state store
│   │   ├── TraineeContext.tsx    # Trainee records state store (localStorage)
│   │   └── TrainingContext.tsx   # High-level training state store
│   ├── data/                     # Static seed datasets
│   │   ├── assessmentMockData.ts
│   │   ├── bootcampMockData.ts
│   │   ├── companyCalendarDataset.ts
│   │   ├── mockData.ts
│   │   ├── sessionMockData.ts
│   │   ├── traineeMockData.ts
│   │   └── trainingMockData.ts
│   ├── services/                 # Synchronous in-browser service engines
│   │   ├── AICommunicationService.ts
│   │   ├── NotificationService.ts
│   │   ├── analyticsService.ts
│   │   ├── authService.ts
│   │   ├── certificationIntelligenceService.ts
│   │   ├── skillIntelligenceService.ts
│   │   └── trainerService.ts
│   ├── types/                    # TypeScript interfaces & domain models
│   ├── App.css                   # Main monolithic application stylesheet
│   ├── App.tsx                   # Root component with provider hierarchy
│   ├── index.css                 # Global CSS design tokens & CSS reset
│   └── main.tsx                  # React DOM root entrypoint
├── index.html                    # Single Page Application HTML shell
├── package.json                  # Dependencies & npm scripts
├── tsconfig.json                 # TypeScript compiler configuration
├── vercel.json                   # Vercel SPA rewrite configuration
└── vite.config.ts                # Vite dev server & production build config
```

---

## 11. Dependencies

| Package | Version | Purpose | Usage Area |
|---|---|---|---|
| `react` | `^18.2.0` | UI component library | Core framework |
| `react-dom` | `^18.2.0` | React DOM renderer | `src/main.tsx` |
| `framer-motion` | `^13.1.1` | UI Animations & Transitions | Modals, cards, tabs, page load |
| `lucide-react` | `^0.344.0` | UI Icons | Application-wide vector icons |
| `three` | `^0.162.0` | 3D WebGL particle rendering | `ThreeVisualizer.tsx` |
| `xlsx` | `^0.18.5` | Spreadsheet parser & exporter | `ImportTraineesModal.tsx` |
| `clsx` | `^2.1.1` | Class composition | UI components |
| `@radix-ui/react-dialog` | `^1.1.23` | Accessible modal primitive | `ui/Modal.tsx` |
| `@radix-ui/react-tooltip` | `^1.2.16` | Accessible tooltip primitive | `ui/Tooltip.tsx` |
| `vite` | `^5.1.4` | Build tool & dev server | Build pipeline |
| `typescript` | `^5.3.3` | Type checking compiler | Build pipeline |

---

## 12. Environment Variables & Configuration

### Environment Variables
Currently, **no external `.env` variables are required** because the application runs as a self-contained frontend prototype.

### System Configuration Files
1. [`vite.config.ts`](file:///c:/Users/DeepikaMookanKrishna/OneDrive%20-%20Systech%20Solutions,%20Inc/Desktop/LD_APP/vite.config.ts): Server port set to `3000`, base path set to `'./'`, build output directory `dist`, chunk size warning limit `1500kb`.
2. [`vercel.json`](file:///c:/Users/DeepikaMookanKrishna/OneDrive%20-%20Systech%20Solutions,%20Inc/Desktop/LD_APP/vercel.json): SPA rewrite mapping all request paths `/(.*)` to `/index.html`.
3. [`public/_redirects`](file:///c:/Users/DeepikaMookanKrishna/OneDrive%20-%20Systech%20Solutions,%20Inc/Desktop/LD_APP/public/_redirects): Netlify SPA fallback rule `/* /index.html 200`.

---

## 13. Integrations

1. **Spreadsheets (SheetJS `xlsx`)**: Native client-side binary parsing of uploaded Excel (`.xlsx`, `.xls`) and CSV files for bulk trainee importing.
2. **Simulated Email Engine (`AICommunicationService`)**: Generates pre-formatted HTML email bodies for session invites, reminders, and performance feedback.
3. **Simulated AI Engine (`skillIntelligenceService`)**: Local rule-based keyword matching and score-weighting logic that simulates natural language Copilot queries and project fit calculations.

---

## 14. Business Logic

### Key Domain Rules Implemented
1. **Trainee Readiness Score Calculation**: Computed using a weighted formula:
   $$\text{Readiness} = (\text{Assessment Score} \times 0.4) + (\text{Attendance \%} \times 0.3) + (\text{Feedback Score} \times 0.3)$$
2. **Trainer Session Conflict Detection**: When scheduling a new session, [`SessionContext.tsx`](file:///c:/Users/DeepikaMookanKrishna/OneDrive%20-%20Systech%20Solutions,%20Inc/Desktop/LD_APP/src/context/SessionContext.tsx) scans existing sessions to ensure the assigned trainer is not double-booked on the same date and overlapping time slot.
3. **Attendance Percentage Cascade**: Marking a trainee as *Present*, *Late*, or *Absent* updates the session record and automatically recalculates the trainee's cumulative attendance percentage:
   $$\text{Attendance \%} = \frac{\text{Present Count} + (0.5 \times \text{Late Count})}{\text{Total Sessions}} \times 100$$

---

## 15. Error Handling

1. **Global React Error Boundary**: [`src/components/ErrorBoundary.tsx`](file:///c:/Users/DeepikaMookanKrishna/OneDrive%20-%20Systech%20Solutions,%20Inc/Desktop/LD_APP/src/components/ErrorBoundary.tsx) wraps the application root. Catches unhandled JS render errors, presents a fallback UI, logs stack traces, and provides a "Clear Local Storage & Reset" recovery button.
2. **Form Validation**: Inputs perform required-field and date-range validation prior to dispatching context state actions.
3. **File Import Safeguards**: SheetJS importer validates file extensions, header schemas, and empty rows before committing import rows to state.

---

## 16. Security

### Implemented Security Measures
- Sanitized input text fields in React components.
- Sensitive credentials obscured in documentation and UI tips.

### Identified Potential Security Weaknesses (Prototype Scope)
1. **Client-Side Auth Gate**: Authentication operates via `localStorage` flags (`ld_platform_authenticated`). Can be bypassed in browser developer tools.
2. **Hardcoded Credentials**: Demo credentials (`admin@ldplatform.com`) reside in client JS bundles.
3. **Unencrypted LocalStorage**: Trainee records stored in browser `localStorage` are unencrypted.

---

## 17. Performance

1. **Memoized Computations**: Heavy filter and sorting operations across trainee datasets use React `useMemo` hooks.
2. **Vite Code Splitting**: Custom chunk size configurations in `vite.config.ts`.
3. **Canvas Cleanup**: `ThreeVisualizer.tsx` cancels requestAnimationFrame loops and disposes WebGL geometries upon component unmount.

---

## 18. Testing

- **Current State**: Automated test suites (Jest / Vitest / Cypress) are **not currently implemented**.
- **Type Checking Verification**: Verified via TypeScript compiler check during build (`tsc && vite build`).

---

## 19. Build & Run Instructions

### Prerequisites
- Node.js version 18.x or 20.x
- npm version 9.x or 10.x

### Terminal Commands

```bash
# 1. Install Dependencies
npm install

# 2. Run Local Development Server (starts at http://localhost:3000)
npm run dev

# 3. Type-Check and Build for Production
npm run build

# 4. Preview Production Build Locally
npm run preview
```

---

## 20. Deployment

### Deployed Targets
1. **GitHub Pages**: Automated via GitHub Actions workflow ([`.github/workflows/deploy.yml`](file:///c:/Users/DeepikaMookanKrishna/OneDrive%20-%20Systech%20Solutions,%20Inc/Desktop/LD_APP/.github/workflows/deploy.yml)) triggered on push to `main`.
2. **Vercel / Netlify**: Supported via [`vercel.json`](file:///c:/Users/DeepikaMookanKrishna/OneDrive%20-%20Systech%20Solutions,%20Inc/Desktop/LD_APP/vercel.json) and [`public/_redirects`](file:///c:/Users/DeepikaMookanKrishna/OneDrive%20-%20Systech%20Solutions,%20Inc/Desktop/LD_APP/public/_redirects) SPA fallback rules.

---

## 21. Current Limitations / TODOs

1. **Backend & Persistence**: Most state changes (except trainees in `localStorage`) reset upon page refresh.
2. **Simulated AI Services**: AI Copilot uses local keyword rules rather than an LLM API connection.
3. **Single Active Role**: UI operates exclusively under the `LD_ADMIN` persona.

---

## 22. Technical Debt & Recommendations

| Priority | Recommendation | Justification |
|---|---|---|
| **Critical** | Integrate Backend API & Database | Persist bootcamps, sessions, assessments, and feedback in PostgreSQL/MongoDB. |
| **Critical** | Enterprise Identity Integration | Replace local auth with Azure AD / OAuth2 OIDC SSO. |
| **High** | React Router Integration | Replace `window.history` state with formal URL routing (`/bootcamps/:id`, `/trainees/:id`). |
| **High** | Real LLM Integration | Connect AI Copilot to Azure OpenAI or Gemini API via backend proxy. |
| **Medium** | Automated Testing | Implement Vitest unit tests and Playwright E2E tests. |

---

## 23. Complete Feature Matrix

| Feature Area | Primary Page(s) | Primary Components | API Dependency | Data Storage | Status |
|---|---|---|---|---|---|
| **Demo Login** | `/login` | `LoginPage`, `ThreeVisualizer` | `authService` | `localStorage` | Functional Prototype |
| **Command Center** | `/command-center` | `CommandCenterView`, `KpiCards` | Local State | Static Data | Functional Prototype |
| **Bootcamp CRUD** | `/bootcamps` | `BootcampManagement`, `CreateBootcampModal` | `BootcampContext` | React Memory | Functional Prototype |
| **Trainee Directory** | `/trainees` | `TraineeManagement`, `AddTraineeModal` | `TraineeContext` | `localStorage` | Fully Implemented (Client) |
| **Spreadsheet Import**| `/trainees` | `ImportTraineesModal` | SheetJS `xlsx` | `localStorage` | Fully Implemented (Client) |
| **Session Scheduling**| `/calendar` | `SessionManagement`, `CalendarView` | `SessionContext` | React Memory | Functional Prototype |
| **Attendance Marking**| State View | `AttendanceManagement` | `SessionContext` | React Memory | Functional Prototype |
| **Assessments** | `/assessments` | `AssessmentManagement`, `EnterScoresModal` | `AssessmentContext` | React Memory | Functional Prototype |
| **Trainer Feedback** | `/feedback` | `FeedbackManagement`, `AddTrainerFeedbackModal` | `FeedbackContext` | React Memory | Functional Prototype |
| **Skill Copilot** | `/skill-intelligence`| `SkillIntelligenceView` | `skillIntelligenceService` | Static Data | Functional Prototype |
| **Certifications** | `/certifications` | `CertificationIntelligenceView` | `certificationIntelligenceService`| Static Data | Functional Prototype |
| **L&D Analytics** | `/analytics` | `AnalyticsView` | Local State | React Memory | Functional Prototype |

---

## 24. Complete Route Matrix

| Route Path / State View | Target Component | Access Role | Purpose | Data Source |
|---|---|---|---|---|
| `/login` | `LoginPage` | Public | User Authentication | `authService` |
| `/command-center`, `/` | `CommandCenterView` | Admin | Executive L&D Dashboard | `mockData.ts` |
| `/bootcamps` | `BootcampManagement` | Admin | Bootcamp Cohort Directory | `BootcampContext` |
| State: `bootcamp-details` | `BootcampDetails` | Admin | Specific Cohort & Curriculum | `BootcampContext` |
| `/training` | `TrainingManagement` | Admin | High-Level Training Plans | `TrainingContext` |
| `/trainees` | `TraineeManagement` | Admin | Employee Roster & Importer | `TraineeContext` (`localStorage`)|
| State: `trainee-profile` | `TraineeProfile` | Admin | Employee Skill Passport | `TraineeContext` |
| `/calendar`, `/sessions` | `SessionManagement` | Admin | Training Timeline & Calendar | `SessionContext` |
| State: `session-details` | `SessionDetails` | Admin | Individual Session Inspector | `SessionContext` |
| State: `attendance-record` | `AttendanceManagement` | Admin | Session Attendance Marking | `SessionContext` |
| `/assessments` | `AssessmentManagement` | Admin | Test & Project Evaluations | `AssessmentContext` |
| `/feedback` | `FeedbackManagement` | Admin | Qualitative Feedback Tracking | `FeedbackContext` |
| `/skill-intelligence` | `SkillIntelligenceView` | Admin | AI Readiness & Skill Matrix | `skillIntelligenceService` |
| `/certifications` | `CertificationIntelligenceView` | Admin | Certification Portfolio | `certificationIntelligenceService` |
| `/analytics` | `AnalyticsView` | Admin | Organization Analytics | `TraineeContext` |

---

## 25. Final Project Summary

The **Systech Solutions L&D Learning & Skill Intelligence Platform** is a feature-complete, highly responsive frontend prototype engineered to streamline enterprise learning operations. Built with React 18, Vite, TypeScript, and Framer Motion, the application features an executive command center, bootcamp curriculum management, employee skill passports, interactive session calendars, assessment scoring, qualitative feedback tracking, AI decision support, and analytics.

While current operations execute client-side with mock data and `localStorage` persistence, the codebase is modularly architected with decoupled service layers, clean Context state stores, and typed interfaces. This enables seamless future integration with production backend APIs, relational databases, and enterprise identity providers.
