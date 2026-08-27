import React from 'react';
import { Header } from './Header';
import { KpiCards } from './KpiCards';
import { LearningOverviewChart } from './LearningOverviewChart';
import { BootcampPerformance } from './BootcampPerformance';
import { AiIntelligencePanel } from './AiIntelligencePanel';
import { TraineesAttentionTable } from './TraineesAttentionTable';
import { UpcomingActivity } from './UpcomingActivity';
import { CertificationSnapshot } from './CertificationSnapshot';
import { RecentActivityFeed } from './RecentActivityFeed';

interface CommandCenterViewProps {}

export const CommandCenterView: React.FC<CommandCenterViewProps> = () => {
  return (
    <div className="command-center-content-wrapper">
      {/* Top Header */}
      <Header />

      {/* Section 1 — 6 KPI Cards */}
      <section className="dashboard-section" aria-label="Key Performance Indicators">
        <KpiCards />
      </section>

      {/* Section 2 & 3 — Learning Overview Chart & Bootcamp Performance Matrix */}
      <section className="dashboard-grid-row two-cols-grid" aria-label="Learning Performance Analytics">
        <div className="grid-col-flex-2">
          <LearningOverviewChart />
        </div>
        <div className="grid-col-flex-1">
          <BootcampPerformance />
        </div>
      </section>

      {/* Section 4 — Primary AI Learning Intelligence Engine Panel */}
      <section className="dashboard-section" aria-label="AI Intelligence Engine">
        <AiIntelligencePanel />
      </section>

      {/* Section 5, 6, 7 & 8 — Trainees Attention Table & Side Activity Widgets */}
      <section className="dashboard-grid-row main-side-split" aria-label="Trainee Interventions & Activities">
        <div className="main-table-col">
          <TraineesAttentionTable />
        </div>

        <div className="side-widgets-col">
          <UpcomingActivity />
          <CertificationSnapshot />
          <RecentActivityFeed />
        </div>
      </section>
    </div>
  );
};
