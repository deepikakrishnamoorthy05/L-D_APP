import React from 'react';
import { BookOpen, User, Calendar, CheckCircle2, ChevronRight, Sparkles, Layers, ArrowLeft } from 'lucide-react';
import { Session, LearningTrack } from '../../types/session';

interface ModuleViewProps {
  sessions: Session[];
  onSelectSession: (sessionId: string) => void;
  onBackToCalendar?: () => void;
  viewMode?: 'calendar' | 'schedule' | 'modules';
  setViewMode?: (mode: 'calendar' | 'schedule' | 'modules') => void;
}

export const ModuleView: React.FC<ModuleViewProps> = ({
  sessions,
  onSelectSession,
  onBackToCalendar,
  viewMode,
  setViewMode,
}) => {
  // Group sessions by Module Name
  const modulesGrouped = sessions.reduce<Record<string, Session[]>>((acc, s) => {
    const modName = s.moduleName || 'Other';
    if (!acc[modName]) acc[modName] = [];
    acc[modName].push(s);
    return acc;
  }, {});

  const moduleNames = Object.keys(modulesGrouped);

  // Group modules by Track
  const trackGroups: Record<LearningTrack, string[]> = {
    'Common Foundation': ['Orientation', 'SQL', 'T-SQL', 'Python'],
    'DBT & Snowflake': ['dbt & Snowflake', 'dbt', 'Snowflake'],
    'Databricks': ['Databricks'],
    'BA': ['BA', 'BA Training', 'Requirements Engineering'],
    'DE': ['DE', 'DE Training', 'Data Pipelines', 'Knowledge Sharing Series'],
    'Tools': ['Tools', 'Tools Training', 'Informatica Training'],
    'Shared': [
      'BA',
      'DW/ETL',
      'Azure Services',
      'ADF',
      'Power BI',
      'QA',
      'DevOps',
      'Simulation Project',
      'DI Certification',
      'DI Certification Evaluation',
      'Sign Off',
      'Holiday',
    ],
  };

  const getTrackBadgeClass = (track: LearningTrack) => {
    switch (track) {
      case 'Common Foundation':
        return 'track-badge foundation';
      case 'DBT & Snowflake':
        return 'track-badge dbt-snowflake';
      case 'Databricks':
        return 'track-badge databricks';
      default:
        return 'track-badge shared';
    }
  };

  return (
    <div className="module-view-container space-y-4">
      {/* 0. TOP SUBVIEW HEADER WITH BACK TO CALENDAR BUTTON */}
      <div className="subview-header-bar">
        <div className="subview-title-group">
          <button
            type="button"
            className="back-to-calendar-btn"
            onClick={onBackToCalendar}
          >
            <ArrowLeft size={16} /> Back to Calendar
          </button>
          
          <div className="h-5 w-px bg-slate-200 dark:bg-slate-700" />
          
          <div className="flex items-center gap-2">
            <Layers size={18} className="text-teal-600 dark:text-teal-400" />
            <h2 className="subview-title-text">
              MODULES &amp; CURRICULUM BOARD
            </h2>
            <span className="rem-count-chip">
              {moduleNames.length} Modules Active
            </span>
          </div>
        </div>

        {setViewMode && (
          <div className="board-segmented-switch compact">
            {(['calendar', 'schedule', 'modules'] as const).map((m) => (
              <button
                key={m}
                type="button"
                className={`board-segmented-btn ${viewMode === m ? 'active' : ''}`}
                onClick={() => setViewMode(m)}
              >
                <span className="relative z-10 capitalize font-bold text-xs">
                  {m === 'schedule' ? 'Timeline' : m}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
      {/* 1. TRACK OVERVIEW SECTION */}
      <section className="track-overview-card">
        <div className="track-overview-header">
          <Layers size={18} className="icon-layers" />
          <h3>Bootcamp Learning Tracks Overview</h3>
        </div>

        <div className="tracks-overview-grid">
          {(Object.keys(trackGroups) as LearningTrack[]).map((trackKey) => {
            const trackMods = trackGroups[trackKey];
            const trackSessions = sessions.filter(
              (s) => trackMods.some((m) => m.toLowerCase() === (s.moduleName || '').toLowerCase())
            );

            return (
              <div key={trackKey} className="track-overview-col">
                <div className="track-col-header">
                  <span className={getTrackBadgeClass(trackKey)}>{trackKey}</span>
                  <span className="track-count-tag">{trackSessions.length} Event(s)</span>
                </div>

                <div className="track-modules-list">
                  {trackMods.map((modName) => {
                    const count = sessions.filter(
                      (s) => (s.moduleName || '').toLowerCase() === modName.toLowerCase()
                    ).length;
                    return (
                      <div key={modName} className="track-mod-item">
                        <span className="mod-item-name">{modName}</span>
                        <span className="mod-item-count">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 2. CURRICULUM MODULE CARDS */}
      <div className="modules-grid-list mt-3">
        {moduleNames.map((modName) => {
          const modSessions = modulesGrouped[modName];
          const dates = modSessions.map((s) => s.sessionDate).sort();
          const startDate = dates[0] || '';
          const endDate = dates[dates.length - 1] || '';
          const owner = modSessions.find((s) => s.moduleOwner)?.moduleOwner || 'L&D Team';
          const track = modSessions.find((s) => s.learningTrack)?.learningTrack || 'Shared';

          const trainersList = Array.from(
            new Set(modSessions.map((s) => s.trainerName).filter(Boolean))
          ).join(', ');

          const completedCount = modSessions.filter((s) => s.status === 'Completed').length;
          const progressPercent =
            modSessions.length > 0 ? Math.round((completedCount / modSessions.length) * 100) : 0;

          return (
            <div key={modName} className="module-group-card">
              <div className="module-card-header">
                <div className="title-block">
                  <BookOpen size={18} className="mod-icon" />
                  <h3 className="mod-title">{modName}</h3>
                  <span className={getTrackBadgeClass(track)}>{track}</span>
                </div>

                <div className="mod-meta-badges">
                  <span className="meta-badge">
                    <Calendar size={12} /> {startDate} – {endDate}
                  </span>
                  <span className="meta-badge highlight">
                    <User size={12} /> Owner: {owner}
                  </span>
                </div>
              </div>

              <div className="module-card-stats-bar">
                <span>Total Sessions: <strong>{modSessions.length}</strong></span>
                <span>Trainers: <strong>{trainersList || 'Assigned Staff'}</strong></span>
                <span>Progress: <strong>{progressPercent}%</strong></span>

                <button
                  type="button"
                  className="bootcamp-btn-secondary btn-sm ml-auto"
                  onClick={() => onSelectSession(modSessions[0]?.id || '')}
                >
                  View Schedule
                </button>
              </div>

              <div className="mini-progress-track full-width mt-2">
                <div
                  className="mini-progress-fill fill-cyan"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
