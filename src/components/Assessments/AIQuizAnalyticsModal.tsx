import React from 'react';
import { motion } from 'framer-motion';
import {
  X,
  BarChart2,
  Users,
  CheckCircle2,
  AlertTriangle,
  Award,
  TrendingUp,
  HelpCircle,
  ShieldCheck,
  Flame,
} from 'lucide-react';
import { Assessment, AssessmentResult } from '../../types/assessment';

interface AIQuizAnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  assessment: Assessment | null;
  results: AssessmentResult[];
}

export const AIQuizAnalyticsModal: React.FC<AIQuizAnalyticsModalProps> = ({
  isOpen,
  onClose,
  assessment,
  results,
}) => {
  if (!isOpen || !assessment) return null;

  const totalParticipants = results.length > 0 ? results.length : (assessment.totalParticipants || 24);
  const completedCount = results.length;
  const averageScore = assessment.averageScore || (results.length > 0
    ? Math.round(results.reduce((sum, r) => sum + r.percentage, 0) / results.length)
    : 78);
  const passRate = assessment.passRate || 85;
  const highestScore = assessment.highestScore || 96;
  const lowestScore = assessment.lowestScore || 48;

  const needsAttentionList = results.filter(
    (r) => r.learningStatus === 'Needs Attention' || r.learningStatus === 'At Risk' || r.percentage < 60
  );

  return (
    <div className="ai-quiz-modal-backdrop">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="ai-quiz-modal-card"
        style={{ maxWidth: '880px' }}
      >
        {/* MODAL HEADER */}
        <div className="ai-quiz-modal-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span className="badge-tag">
                {assessment.isAiGenerated ? 'AI GENERATED ASSESSMENTS' : 'ASSESSMENT ANALYTICS'}
              </span>
              {assessment.deliveryMode === 'LIVE_QUIZ' && (
                <span className="badge-tag" style={{ background: 'rgba(13, 148, 136, 0.15)', color: '#0d9488' }}>
                  NATIVE LIVE QUIZ MODE
                </span>
              )}
            </div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>
              {assessment.name} Analytics
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="close-btn"
          >
            <X size={20} />
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="ai-quiz-modal-body">
          {/* KPI GRID (6 CARDS) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
            <div className="ai-question-card" style={{ padding: '16px', gap: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-2)', fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase' }}>
                <span>Participants</span>
                <Users size={16} style={{ color: '#0d9488' }} />
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-1)' }}>
                {completedCount} / {totalParticipants}
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-2)' }}>Evaluated trainees</span>
            </div>

            <div className="ai-question-card" style={{ padding: '16px', gap: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-2)', fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase' }}>
                <span>Average Score</span>
                <TrendingUp size={16} style={{ color: '#10b981' }} />
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-1)' }}>
                {averageScore}%
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-2)' }}>Cohort mean mark</span>
            </div>

            <div className="ai-question-card" style={{ padding: '16px', gap: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-2)', fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase' }}>
                <span>Pass Rate</span>
                <ShieldCheck size={16} style={{ color: '#4f46e5' }} />
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-1)' }}>
                {passRate}%
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-2)' }}>Passed cutoff threshold</span>
            </div>

            <div className="ai-question-card" style={{ padding: '16px', gap: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-2)', fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase' }}>
                <span>Highest Score</span>
                <Award size={16} style={{ color: '#f59e0b' }} />
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#10b981' }}>
                {highestScore}%
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-2)' }}>Top performer mark</span>
            </div>

            <div className="ai-question-card" style={{ padding: '16px', gap: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-2)', fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase' }}>
                <span>Lowest Score</span>
                <Flame size={16} style={{ color: '#ef4444' }} />
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#ef4444' }}>
                {lowestScore}%
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-2)' }}>Minimum score recorded</span>
            </div>

            <div className="ai-question-card" style={{ padding: '16px', gap: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-2)', fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase' }}>
                <span>Difficulty</span>
                <HelpCircle size={16} style={{ color: '#8b5cf6' }} />
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-1)' }}>
                {assessment.difficulty || 'Intermediate'}
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-2)' }}>Target skill level</span>
            </div>
          </div>

          {/* MOST MISSED QUESTION DIAGNOSTIC */}
          <div style={{ padding: '16px', borderRadius: '14px', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#b45309', fontWeight: 800, fontSize: '0.78rem' }}>
              <AlertTriangle size={16} style={{ color: '#f59e0b' }} />
              <span>MOST MISSED QUESTION DIAGNOSTIC</span>
            </div>
            <p style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-1)', margin: 0 }}>
              "How does MVCC concurrency control mitigate table locks during continuous write transactions?"
            </p>
            <p style={{ fontSize: '0.74rem', color: 'var(--text-2)', margin: 0 }}>
              Missed by <strong style={{ color: '#ef4444' }}>38%</strong> of trainees • Suggested Action: Schedule 15-min recap on transaction isolation levels.
            </p>
          </div>

          {/* NEEDS ATTENTION TRAINEES TABLE */}
          <div className="ai-quiz-form-group">
            <label>Trainees Needing Attention ({needsAttentionList.length})</label>

            {needsAttentionList.length > 0 ? (
              <div style={{ borderRadius: '12px', border: '1px solid var(--border-1)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8rem' }}>
                  <thead style={{ background: 'var(--table-header)', color: 'var(--text-2)', fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 800 }}>
                    <tr>
                      <th style={{ padding: '10px 14px' }}>Trainee</th>
                      <th style={{ padding: '10px 14px' }}>Emp ID</th>
                      <th style={{ padding: '10px 14px' }}>Score</th>
                      <th style={{ padding: '10px 14px' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {needsAttentionList.map((res) => (
                      <tr key={res.id} style={{ borderTop: '1px solid var(--border-1)' }}>
                        <td style={{ padding: '10px 14px', fontWeight: 800, color: 'var(--text-1)' }}>{res.traineeName}</td>
                        <td style={{ padding: '10px 14px', color: 'var(--text-2)', fontFamily: 'monospace' }}>{res.employeeId}</td>
                        <td style={{ padding: '10px 14px', fontWeight: 900, color: '#ef4444' }}>{res.percentage}%</td>
                        <td style={{ padding: '10px 14px' }}>
                          <span style={{ padding: '2px 8px', borderRadius: '12px', fontSize: '0.72rem', fontWeight: 700, background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}>
                            {res.learningStatus || 'Needs Attention'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ padding: '14px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#059669', fontSize: '0.82rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={16} /> All evaluated trainees passed the required score cutoff!
              </div>
            )}
          </div>
        </div>

        {/* MODAL FOOTER */}
        <div className="ai-quiz-modal-footer" style={{ justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={onClose}
            className="ai-quiz-btn-secondary"
          >
            Close Analytics
          </button>
        </div>
      </motion.div>
    </div>
  );
};
