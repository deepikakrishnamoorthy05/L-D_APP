import React from 'react';
import { motion } from 'framer-motion';
import { Database, Code, Cpu, Award, Sparkles, CheckCircle2 } from 'lucide-react';
import clsx from 'clsx';

export interface LearningPathNode {
  id: string;
  name: string;
  stage: 'Common Foundation' | 'DBT & Snowflake' | 'Databricks' | 'Shared';
  status?: 'Completed' | 'In Progress' | 'Planned';
  icon?: React.ReactNode;
}

export interface LearningPathDesignerProps {
  activeStage?: string;
  onSelectNode?: (nodeId: string) => void;
  className?: string;
}

export const LearningPathDesigner: React.FC<LearningPathDesignerProps> = ({
  activeStage,
  onSelectNode,
  className,
}) => {
  return (
    <div className={clsx('ui-learning-path-designer', className)}>
      {/* 1. COMMON FOUNDATION STAGE */}
      <div className="path-stage-container foundation-stage">
        <div className="stage-header-chip">
          <span>COMMON FOUNDATION</span>
        </div>

        <div className="nodes-horizontal-row">
          <motion.div
            whileHover={{ y: -3, scale: 1.03 }}
            className="path-node-card active"
            onClick={() => onSelectNode && onSelectNode('sql')}
          >
            <div className="node-icon-box cyan">
              <Database size={16} />
            </div>
            <div className="node-text">
              <span className="node-title">SQL / T-SQL</span>
              <span className="node-sub">Core Architecture</span>
            </div>
          </motion.div>

          <div className="path-connector-line horizontal">
            <svg viewBox="0 0 60 12" className="connector-svg">
              <line x1="0" y1="6" x2="52" y2="6" stroke="var(--color-primary, #1E8282)" strokeWidth="2" strokeDasharray="4 4" />
              <polygon points="52,2 60,6 52,10" fill="var(--color-primary, #1E8282)" />
            </svg>
          </div>

          <motion.div
            whileHover={{ y: -3, scale: 1.03 }}
            className="path-node-card active"
            onClick={() => onSelectNode && onSelectNode('python')}
          >
            <div className="node-icon-box indigo">
              <Code size={16} />
            </div>
            <div className="node-text">
              <span className="node-title">Python Core</span>
              <span className="node-sub">OOP &amp; Data Pipeline</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* STAGE DOWN CONNECTOR */}
      <div className="stage-down-connector">
        <svg viewBox="0 0 24 36" className="down-connector-svg">
          <line x1="12" y1="0" x2="12" y2="28" stroke="var(--color-primary, #1E8282)" strokeWidth="2" strokeDasharray="4 4" />
          <polygon points="7,28 12,36 17,28" fill="var(--color-primary, #1E8282)" />
        </svg>
      </div>

      {/* 2. TRACK ALLOCATION STAGE */}
      <div className="path-stage-container allocation-stage">
        <div className="stage-header-chip allocation">
          <span>TRACK ALLOCATION</span>
        </div>

        <div className="tracks-split-grid">
          {/* LEFT BRANCH: DBT & SNOWFLAKE */}
          <div className="track-branch-box dbt-branch">
            <div className="branch-label">DBT &amp; Snowflake Track</div>
            <div className="branch-nodes-flex">
              <motion.div whileHover={{ y: -2 }} className="path-node-chip">
                <span className="chip-badge">dbt</span>
                <span>dbt Core Transformation</span>
              </motion.div>
              <div className="connector-arrow-right">→</div>
              <motion.div whileHover={{ y: -2 }} className="path-node-chip">
                <span className="chip-badge snowflake">SF</span>
                <span>Snowflake DW</span>
              </motion.div>
            </div>
          </div>

          {/* RIGHT BRANCH: DATABRICKS */}
          <div className="track-branch-box databricks-branch">
            <div className="branch-label">Databricks Track</div>
            <div className="branch-nodes-flex">
              <motion.div whileHover={{ y: -2 }} className="path-node-chip db-chip">
                <Cpu size={14} />
                <span>Databricks Lakehouse &amp; Delta</span>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* STAGE JOIN CONNECTOR */}
      <div className="stage-down-connector">
        <svg viewBox="0 0 24 36" className="down-connector-svg">
          <line x1="12" y1="0" x2="12" y2="28" stroke="var(--color-primary, #1E8282)" strokeWidth="2" strokeDasharray="4 4" />
          <polygon points="7,28 12,36 17,28" fill="var(--color-primary, #1E8282)" />
        </svg>
      </div>

      {/* 3. SHARED CAPSTONE STAGE */}
      <div className="path-stage-container shared-stage">
        <div className="stage-header-chip shared">
          <Award size={14} />
          <span>SHARED CAPSTONE &amp; CERTIFICATION</span>
        </div>

        <div className="shared-nodes-row">
          <motion.div whileHover={{ y: -2 }} className="path-node-card shared">
            <div className="node-icon-box amber">
              <Award size={16} />
            </div>
            <div className="node-text">
              <span className="node-title">Simulation Project</span>
              <span className="node-sub">Enterprise Capstone</span>
            </div>
          </motion.div>

          <div className="path-connector-line horizontal">
            <svg viewBox="0 0 40 12" className="connector-svg">
              <line x1="0" y1="6" x2="32" y2="6" stroke="var(--color-primary, #1E8282)" strokeWidth="2" />
              <polygon points="32,2 40,6 32,10" fill="var(--color-primary, #1E8282)" />
            </svg>
          </div>

          <motion.div whileHover={{ y: -2 }} className="path-node-card shared">
            <div className="node-icon-box green">
              <CheckCircle2 size={16} />
            </div>
            <div className="node-text">
              <span className="node-title">DI Certification</span>
              <span className="node-sub">Leadership Evaluation</span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
