import React, { useState } from 'react';
import { AiInsight } from '../../data/mockData';
import { Cpu, ArrowRight, ShieldAlert, AlertTriangle, CheckCircle, Sparkles, X, Info } from 'lucide-react';

const REDESIGNED_AI_INSIGHTS: AiInsight[] = [
  {
    id: 'ai-redesign-1',
    title: '12 trainees require attention.',
    explanation: '12 trainees show a 15%+ score drop in recent Python OOP and algorithm assessments over the past 14 days.',
    category: 'Intervention',
    priority: 'HIGH',
    affectedCount: 12,
    metricLabel: '12 Trainees Affected',
    recommendedAction: 'Schedule 1-on-1 mentor revision lab'
  },
  {
    id: 'ai-redesign-2',
    title: '3 emerging skill gaps detected.',
    explanation: 'Analysis detected recurring errors in DAX Time Intelligence, Python DataFrames, and SQL Indexing across Cohorts B01 & B02.',
    category: 'Skill Gap',
    priority: 'HIGH',
    affectedCount: 3,
    metricLabel: '3 Key Skill Clusters',
    recommendedAction: 'Deploy targeted workshop modules'
  },
  {
    id: 'ai-redesign-3',
    title: '8 certification opportunities identified.',
    explanation: '8 trainees have achieved >85% milestone benchmarks and are fully qualified for Microsoft PL-300 & DP-203 exam registration.',
    category: 'Upskilling',
    priority: 'LOW',
    affectedCount: 8,
    metricLabel: '8 Candidates Ready',
    recommendedAction: 'Initiate exam voucher assignment'
  },
  {
    id: 'ai-redesign-4',
    title: 'Power BI and DAX are the most common current skill gaps.',
    explanation: 'DAX measure syntax represents the highest single error cluster (38% miss rate) in the current learning cycle.',
    category: 'Analytics',
    priority: 'MEDIUM',
    affectedCount: 15,
    metricLabel: '38% Error Rate',
    recommendedAction: 'Assign DAX Masterclass practice set'
  }
];

export const AiIntelligencePanel: React.FC = () => {
  const [selectedInsight, setSelectedInsight] = useState<AiInsight | null>(null);

  const getPriorityBadge = (priority: AiInsight['priority']) => {
    switch (priority) {
      case 'HIGH':
        return (
          <span className="priority-tag priority-high">
            <ShieldAlert size={12} />
            <span>High Priority</span>
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="priority-tag priority-medium">
            <AlertTriangle size={12} />
            <span>Medium Priority</span>
          </span>
        );
      case 'LOW':
        return (
          <span className="priority-tag priority-low">
            <CheckCircle size={12} />
            <span>Opportunity</span>
          </span>
        );
    }
  };

  return (
    <div className="ai-intelligence-panel">
      {/* Background Ambient Glow & Particle Texture */}
      <div className="ai-panel-bg-glow" />

      {/* Header */}
      <div className="ai-panel-header">
        <div className="ai-title-block">
          <div className="ai-icon-chip">
            <Cpu size={22} className="ai-cpu-icon" />
          </div>
          <div>
            <h2 className="ai-panel-title">LEARNING INTELLIGENCE</h2>
            <p className="ai-panel-subtitle">
              Automated anomaly detection, skill gap analytics &amp; learning intervention triggers.
            </p>
          </div>
        </div>

        <div className="ai-status-badge-panel">
          <span className="cyan-pulse-dot" />
          <span>Learning Intelligence Online</span>
        </div>
      </div>

      {/* Insights Cards Grid */}
      <div className="ai-insights-grid">
        {REDESIGNED_AI_INSIGHTS.map((insight) => (
          <div key={insight.id} className={`ai-insight-card priority-${insight.priority.toLowerCase()}`}>
            <div className="insight-card-top">
              <span className="insight-category-chip">{insight.category}</span>
              {getPriorityBadge(insight.priority)}
            </div>

            <h3 className="insight-title">{insight.title}</h3>

            <p className="insight-explanation">{insight.explanation}</p>

            <div className="insight-card-footer">
              <span className="insight-metric-label">{insight.metricLabel}</span>
              <button
                type="button"
                className="view-details-action-btn"
                onClick={() => setSelectedInsight(insight)}
              >
                <span>VIEW INSIGHTS</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Detail Modal / Drawer for AI Insight */}
      {selectedInsight && (
        <div className="ai-detail-modal-backdrop" onClick={() => setSelectedInsight(null)}>
          <div className="ai-detail-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-row">
                <Sparkles size={18} className="modal-sparkle" />
                <h3>AI Intelligence Analysis</h3>
              </div>
              <button
                type="button"
                className="close-modal-btn"
                onClick={() => setSelectedInsight(null)}
              >
                <X size={16} />
              </button>
            </div>

            <div className="modal-body">
              <div className="modal-section">
                <span className="modal-label">Insight Target:</span>
                <p className="modal-val-bold">{selectedInsight.title}</p>
              </div>

              <div className="modal-section">
                <span className="modal-label">Detailed Diagnostics:</span>
                <p className="modal-val-text">{selectedInsight.explanation}</p>
              </div>

              <div className="modal-section">
                <span className="modal-label">Recommended Action:</span>
                <div className="recommended-action-box">
                  <Info size={16} />
                  <span>{selectedInsight.recommendedAction}</span>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="modal-action-btn"
                onClick={() => {
                  alert(`Executing Action: ${selectedInsight.recommendedAction}`);
                  setSelectedInsight(null);
                }}
              >
                Execute Recommended Intervention
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
