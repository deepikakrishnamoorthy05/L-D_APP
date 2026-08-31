import React from 'react';
import { Header } from './Header';
import { KpiCards } from './KpiCards';
import { QuickActionsBar } from './QuickActionsBar';
import { TodaysPriorities } from './TodaysPriorities';
import { DailyBriefCard } from './DailyBriefCard';
import { UpcomingMilestonesCard } from './UpcomingMilestonesCard';
import { ExecutiveRecentActivity } from './ExecutiveRecentActivity';

interface CommandCenterViewProps {
  onNavigate?: (navId: string, filter?: 'active' | 'project-ready' | 'needs-attention' | null) => void;
  onSelectTrainee?: (traineeId: string, initialTab?: string) => void;
  onSelectBootcamp?: (bootcampId: string, initialTab?: string) => void;
}

export const CommandCenterView: React.FC<CommandCenterViewProps> = ({
  onNavigate,
}) => {
  return (
    <div className="command-center-content-wrapper executive-dashboard-view">
      {/* 1. Compact Page Header */}
      <Header />

      {/* 2. Top 4 Summary KPI Cards */}
      <section className="dashboard-section compact-section" aria-label="Key Action Metrics">
        <KpiCards onNavigate={onNavigate} pendingActionsCount={10} />
      </section>

      {/* 3. Quick Administrative Actions */}
      <section className="dashboard-section compact-section" aria-label="Quick Actions">
        <QuickActionsBar onNavigate={onNavigate} />
      </section>

      {/* 4. Action Center Core Sections */}
      <section className="dashboard-section compact-section" aria-label="Action Center Operations">
        <div className="exec-dashboard-ops-grid">
          {/* Section A: Today's Priorities */}
          <div className="ops-grid-row-1col">
            <TodaysPriorities onNavigate={onNavigate} />
          </div>

          {/* Section B & C: L&D Daily Brief & Upcoming Milestones */}
          <div className="ops-grid-row-2cols">
            <DailyBriefCard onNavigate={onNavigate} />
            <UpcomingMilestonesCard onNavigate={onNavigate} />
          </div>

          {/* Section D: Recent Activity Timeline */}
          <div className="ops-grid-row-1col">
            <ExecutiveRecentActivity onNavigate={onNavigate} />
          </div>
        </div>
      </section>

      {/* STOP THE MAIN PAGE HERE. Clean Action Center with zero duplicate dashboards */}
    </div>
  );
};

export default CommandCenterView;
