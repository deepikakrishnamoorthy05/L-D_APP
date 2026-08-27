import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ChevronUp, ChevronDown, Check, GitBranch, ArrowRight } from 'lucide-react';

interface StageDetails {
  id: string;
  num: string;
  title: string;
  sub: string;
  dates: string;
  trainers: string;
  sessionsCount: number;
  traineesCount: number;
  status: 'completed' | 'active' | 'future';
}

const STAGES: StageDetails[] = [
  { id: 's1', num: '01', title: 'SQL / T-SQL', sub: 'Common Foundation', dates: '19 Jan – 06 Feb 2026', trainers: 'John Mathew, Sneha', sessionsCount: 15, traineesCount: 28, status: 'completed' },
  { id: 's2', num: '02', title: 'Python Data Eng', sub: 'Common Foundation', dates: '09 Feb – 27 Feb 2026', trainers: 'Sarah David, Alex', sessionsCount: 15, traineesCount: 28, status: 'active' },
  { id: 's3', num: '03', title: 'Track Split', sub: 'dbt & Snowflake / Databricks', dates: '02 Mar – 10 Apr 2026', trainers: 'Alex Thomas, Michael', sessionsCount: 30, traineesCount: 28, status: 'future' },
  { id: 's4', num: '04', title: 'Shared Learning', sub: 'Capstone Preparation', dates: '13 Apr – 24 Apr 2026', trainers: 'John Mathew, Sarah', sessionsCount: 10, traineesCount: 28, status: 'future' },
  { id: 's5', num: '05', title: 'Project', sub: 'Real Client Scenario', dates: '27 Apr – 08 May 2026', trainers: 'Michael Paul, Alex', sessionsCount: 10, traineesCount: 28, status: 'future' },
  { id: 's6', num: '06', title: 'Certification', sub: 'Evaluation & Sign Off', dates: '11 May – 18 May 2026', trainers: 'L&D Leadership Team', sessionsCount: 5, traineesCount: 28, status: 'future' },
];

export const LearningJourneyPipeline: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(true); // Default collapsed per requirement #22
  const [hoveredStage, setHoveredStage] = useState<StageDetails | null>(null);

  const compactSteps = [
    { title: 'SQL', status: 'completed' },
    { title: 'Python', status: 'active' },
    { title: 'Track Split', status: 'future' },
    { title: 'Shared', status: 'future' },
    { title: 'Project', status: 'future' },
    { title: 'Certification', status: 'future' },
  ];

  return (
    <div className={`learning-journey-pipeline-card glass-panel-3d ${isCollapsed ? 'compact-strip' : ''}`}>
      <div className="pipeline-header-flex flex items-center justify-between py-1">
        <div className="flex items-center gap-3 min-w-0">
          <h4 className="pipeline-title flex items-center gap-2 text-xs font-bold text-teal-900 shrink-0">
            <Sparkles size={14} className="text-teal-600" />
            <span>Bootcamp Roadmap</span>
          </h4>

          {/* Thin 1-line strip when collapsed */}
          {isCollapsed && (
            <div className="compact-journey-inline-strip flex items-center gap-2 overflow-x-auto text-xs py-1 px-2 rounded-lg bg-teal-900/5 border border-teal-900/10">
              {compactSteps.map((step, idx) => (
                <React.Fragment key={step.title}>
                  <span className={`inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded-full text-[11px] ${
                    step.status === 'completed' ? 'bg-teal-100 text-teal-800 border border-teal-300' :
                    step.status === 'active' ? 'bg-teal-600 text-white shadow-sm' :
                    'bg-gray-100 text-gray-600 border border-gray-200'
                  }`}>
                    {step.status === 'completed' && <Check size={10} />}
                    {step.title}
                  </span>
                  {idx < compactSteps.length - 1 && (
                    <ArrowRight size={10} className="text-gray-400 shrink-0" />
                  )}
                </React.Fragment>
              ))}
            </div>
          )}
        </div>

        <button
          type="button"
          className="collapse-toggle-btn text-xs font-semibold text-teal-700 hover:text-teal-900 flex items-center gap-1 shrink-0 ml-2"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? (
            <>Expand Journey <ChevronDown size={14} /></>
          ) : (
            <>Collapse Journey <ChevronUp size={14} /></>
          )}
        </button>
      </div>

      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="pipeline-stages-container mt-3 pt-2 border-t border-teal-900/10"
          >
            <div className="stages-flow-grid">
              {/* NODE 1: SQL */}
              <motion.div
                whileHover={{ y: -3, scale: 1.01 }}
                className="journey-node-box completed"
                onMouseEnter={() => setHoveredStage(STAGES[0])}
                onMouseLeave={() => setHoveredStage(null)}
              >
                <div className="node-num-badge">01</div>
                <div className="node-info font-bold">
                  <span className="node-title">SQL / T-SQL</span>
                  <span className="node-sub">Completed ✓</span>
                </div>
              </motion.div>

              <div className="connector-arrow-line completed" />

              {/* NODE 2: PYTHON DATA ENG (ACTIVE) */}
              <motion.div
                whileHover={{ y: -3, scale: 1.01 }}
                className="journey-node-box active"
                onMouseEnter={() => setHoveredStage(STAGES[1])}
                onMouseLeave={() => setHoveredStage(null)}
              >
                <div className="node-num-badge active">02</div>
                <div className="node-info font-bold">
                  <span className="node-title text-teal-700">Python Data Eng</span>
                  <span className="node-sub text-teal-600">In Progress (76%)</span>
                </div>
              </motion.div>

              <div className="connector-arrow-line active-animated" />

              {/* NODE 3: TRACK ALLOCATION */}
              <div className="journey-branching-group">
                <motion.div
                  whileHover={{ y: -3, scale: 1.01 }}
                  className="journey-node-box branch-parent"
                  onMouseEnter={() => setHoveredStage(STAGES[2])}
                  onMouseLeave={() => setHoveredStage(null)}
                >
                  <div className="node-num-badge">03</div>
                  <div className="node-info font-bold">
                    <span className="node-title">Track Split</span>
                    <span className="node-sub">Branching Stage</span>
                  </div>
                </motion.div>

                <div className="branch-paths-wrapper">
                  <div className="branch-chip dbt">DBT + Snowflake</div>
                  <div className="branch-chip dbx">Databricks Eng</div>
                </div>
              </div>

              <div className="connector-arrow-line" />

              {/* NODE 4: SHARED LEARNING */}
              <motion.div
                whileHover={{ y: -3, scale: 1.01 }}
                className="journey-node-box future"
                onMouseEnter={() => setHoveredStage(STAGES[3])}
                onMouseLeave={() => setHoveredStage(null)}
              >
                <div className="node-num-badge">04</div>
                <div className="node-info font-bold">
                  <span className="node-title">Shared Learning</span>
                  <span className="node-sub">Capstone Prep</span>
                </div>
              </motion.div>

              <div className="connector-arrow-line" />

              {/* NODE 5: SIMULATION PROJECT */}
              <motion.div
                whileHover={{ y: -3, scale: 1.01 }}
                className="journey-node-box future"
                onMouseEnter={() => setHoveredStage(STAGES[4])}
                onMouseLeave={() => setHoveredStage(null)}
              >
                <div className="node-num-badge">05</div>
                <div className="node-info font-bold">
                  <span className="node-title">Simulation Project</span>
                  <span className="node-sub">Client Scenario</span>
                </div>
              </motion.div>

              <div className="connector-arrow-line" />

              {/* NODE 6: DI CERTIFICATION */}
              <motion.div
                whileHover={{ y: -3, scale: 1.01 }}
                className="journey-node-box future"
                onMouseEnter={() => setHoveredStage(STAGES[5])}
                onMouseLeave={() => setHoveredStage(null)}
              >
                <div className="node-num-badge">06</div>
                <div className="node-info font-bold">
                  <span className="node-title">DI Certification</span>
                  <span className="node-sub">Final Sign-Off</span>
                </div>
              </motion.div>
            </div>

            {/* HOVER TOOLTIP POPOVER */}
            <AnimatePresence>
              {hoveredStage && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  className="stage-hover-popover mt-3 p-3 rounded-xl bg-teal-900/5 border border-teal-900/15 text-xs flex items-center justify-between"
                >
                  <div>
                    <strong className="text-teal-900">{hoveredStage.num}. {hoveredStage.title}</strong> ({hoveredStage.sub})
                    <span className="ml-3 text-muted">Dates: {hoveredStage.dates}</span>
                  </div>
                  <div className="flex items-center gap-3 font-semibold text-teal-800">
                    <span>Trainers: {hoveredStage.trainers}</span>
                    <span>{hoveredStage.sessionsCount} Sessions</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

