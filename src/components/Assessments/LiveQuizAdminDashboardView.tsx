import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart2,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  Award,
  RefreshCw,
  X,
  PieChart,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import {
  quizAttemptService,
  QuizLiveDashboardSummary,
  QuestionAccuracyMetric,
} from '../../services/quizAttemptService';

interface LiveQuizAdminDashboardViewProps {
  isOpen: boolean;
  onClose: () => void;
  quizId: string;
  quizTitle?: string;
}

export const LiveQuizAdminDashboardView: React.FC<LiveQuizAdminDashboardViewProps> = ({
  isOpen,
  onClose,
  quizId,
  quizTitle,
}) => {
  const [summary, setSummary] = useState<QuizLiveDashboardSummary | null>(null);
  const [activeTab, setActiveTab] = useState<'candidates' | 'analytics'>('candidates');
  const [isLoading, setIsLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchDashboardData = () => {
    quizAttemptService
      .getLiveDashboardSummary(quizId)
      .then((data) => setSummary(data))
      .catch((err) => console.warn('Error fetching live dashboard summary:', err))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    if (!isOpen) return;
    setIsLoading(true);
    fetchDashboardData();

    let interval: any;
    if (autoRefresh) {
      interval = setInterval(() => {
        fetchDashboardData();
      }, 3000); // 3-second live polling loop for real-time dashboard updates
    }
    return () => clearInterval(interval);
  }, [isOpen, quizId, autoRefresh]);

  if (!isOpen) return null;

  return (
    <div className="assessment-modal-backdrop" onMouseDown={onClose}>
      <motion.div
        className="assessment-generator-modal"
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97 }}
        onMouseDown={(e) => e.stopPropagation()}
        style={{ maxWidth: '960px', width: '95%', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
      >
        {/* HEADER */}
        <div
          style={{
            padding: '20px 28px',
            borderBottom: '1px solid var(--border-1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            background: 'linear-gradient(135deg, rgba(13, 148, 136, 0.05) 0%, rgba(79, 70, 229, 0.05) 100%)',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className="badge-tag" style={{ background: 'rgba(13, 148, 136, 0.15)', color: '#0d9488', fontSize: '0.75rem', fontWeight: 800 }}>
                LIVE L&D ASSESSMENT DASHBOARD
              </span>
              <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', display: 'inline-block', boxShadow: '0 0 8px #10b981' }} /> Live Updates Active
              </span>
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 900, margin: '6px 0 0 0', color: 'var(--text-1)', letterSpacing: '-0.2px' }}>
              {summary?.quizTitle || quizTitle || 'Live Assessment Monitor'}
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              type="button"
              onClick={() => fetchDashboardData()}
              style={{
                padding: '8px 16px',
                borderRadius: '12px',
                fontSize: '0.82rem',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'var(--surface-1)',
                border: '1.5px solid var(--border-1)',
                color: 'var(--text-1)',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                transition: 'all 0.2s ease',
              }}
            >
              <RefreshCw size={14} className={isLoading ? 'spin-icon' : ''} style={{ color: '#0d9488' }} />
              <span>Refresh</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={onClose}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '12px',
                border: '1.5px solid var(--border-1)',
                background: 'var(--surface-1)',
                color: 'var(--text-2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                transition: 'all 0.2s ease',
              }}
            >
              <X size={18} />
            </motion.button>
          </div>
        </div>

        {/* MAIN BODY */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* STATS CARDS GRID */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
            <div style={{ padding: '16px', borderRadius: '16px', background: 'var(--surface-2)', border: '1px solid var(--border-1)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-3)', fontWeight: 700, textTransform: 'uppercase' }}>Total Invited</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-1)', marginTop: '4px' }}>{summary?.totalInvited || 0}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-2)', marginTop: '2px' }}>Candidates</div>
            </div>

            <div style={{ padding: '16px', borderRadius: '16px', background: 'rgba(13, 148, 136, 0.1)', border: '1px solid rgba(13, 148, 136, 0.25)' }}>
              <div style={{ fontSize: '0.75rem', color: '#0d9488', fontWeight: 700, textTransform: 'uppercase' }}>Completed</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0d9488', marginTop: '4px' }}>
                {summary?.completedCount || 0} <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>({summary?.completionPercentage || 0}%)</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-2)', marginTop: '2px' }}>
                In Progress: {summary?.inProgressCount || 0} • Not Started: {summary?.notStartedCount || 0}
              </div>
            </div>

            <div style={{ padding: '16px', borderRadius: '16px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
              <div style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 700, textTransform: 'uppercase' }}>Passed</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#10b981', marginTop: '4px' }}>{summary?.passedCount || 0}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-2)', marginTop: '2px' }}>Failed: {summary?.failedCount || 0}</div>
            </div>

            <div style={{ padding: '16px', borderRadius: '16px', background: 'rgba(79, 70, 229, 0.1)', border: '1px solid rgba(79, 70, 229, 0.25)' }}>
              <div style={{ fontSize: '0.75rem', color: '#4f46e5', fontWeight: 700, textTransform: 'uppercase' }}>Average Score</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#4f46e5', marginTop: '4px' }}>{summary?.averageScore || 0}%</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-2)', marginTop: '2px' }}>Highest: {summary?.highestScore || 0}%</div>
            </div>

            <div style={{ padding: '16px', borderRadius: '16px', background: 'var(--surface-2)', border: '1px solid var(--border-1)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-3)', fontWeight: 700, textTransform: 'uppercase' }}>Avg Completion Time</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-1)', marginTop: '4px' }}>{summary?.averageCompletionTimeFormatted || '00:00'}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-2)', marginTop: '2px' }}>Target: 15:00</div>
            </div>
          </div>

          {/* TABS HEADER */}
          <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid var(--border-1)', paddingBottom: '8px' }}>
            <button
              type="button"
              onClick={() => setActiveTab('candidates')}
              style={{
                padding: '8px 16px',
                borderRadius: '10px',
                background: activeTab === 'candidates' ? 'rgba(13, 148, 136, 0.15)' : 'transparent',
                color: activeTab === 'candidates' ? '#0d9488' : 'var(--text-2)',
                border: 'none',
                fontWeight: 800,
                fontSize: '0.85rem',
                cursor: 'pointer',
              }}
            >
              👥 Candidate Statuses ({summary?.candidates.length || 0})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('analytics')}
              style={{
                padding: '8px 16px',
                borderRadius: '10px',
                background: activeTab === 'analytics' ? 'rgba(79, 70, 229, 0.15)' : 'transparent',
                color: activeTab === 'analytics' ? '#4f46e5' : 'var(--text-2)',
                border: 'none',
                fontWeight: 800,
                fontSize: '0.85rem',
                cursor: 'pointer',
              }}
            >
              📊 Question-Wise Accuracy Analytics
            </button>
          </div>

          {/* TAB 1: CANDIDATES LIVE TABLE */}
          {activeTab === 'candidates' && (
            <div style={{ borderRadius: '16px', border: '1px solid var(--border-1)', overflow: 'hidden' }}>
              <table className="recent-quiz-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--surface-2)', fontSize: '0.78rem', textAlign: 'left' }}>
                    <th style={{ padding: '12px 16px' }}>Candidate Name</th>
                    <th style={{ padding: '12px 16px' }}>Invitation Status</th>
                    <th style={{ padding: '12px 16px' }}>Attempt Status</th>
                    <th style={{ padding: '12px 16px' }}>Score</th>
                    <th style={{ padding: '12px 16px' }}>Percentage</th>
                    <th style={{ padding: '12px 16px' }}>Result</th>
                    <th style={{ padding: '12px 16px' }}>Time Taken</th>
                  </tr>
                </thead>
                <tbody>
                  {summary?.candidates.map((c) => {
                    const isCompleted = c.attemptStatus === 'Completed';
                    const isInProgress = c.attemptStatus === 'In Progress';
                    const isPassed = c.result === 'PASSED';

                    return (
                      <tr key={c.invitationId} style={{ borderBottom: '1px solid var(--border-1)' }}>
                        <td style={{ padding: '12px 16px', fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-1)' }}>
                          {c.candidateName}
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-3)', fontWeight: 400 }}>{c.candidateEmail}</div>
                        </td>

                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ padding: '2px 8px', borderRadius: '10px', background: 'var(--surface-2)', color: 'var(--text-2)', fontSize: '0.74rem', fontWeight: 700 }}>
                            {c.invitationStatus}
                          </span>
                        </td>

                        <td style={{ padding: '12px 16px' }}>
                          <span
                            style={{
                              padding: '3px 10px',
                              borderRadius: '12px',
                              fontSize: '0.75rem',
                              fontWeight: 800,
                              background: isCompleted
                                ? 'rgba(16, 185, 129, 0.12)'
                                : isInProgress
                                ? 'rgba(245, 158, 11, 0.12)'
                                : 'var(--surface-2)',
                              color: isCompleted ? '#10b981' : isInProgress ? '#f59e0b' : 'var(--text-3)',
                            }}
                          >
                            {c.attemptStatus}
                          </span>
                        </td>

                        <td style={{ padding: '12px 16px', fontWeight: 800, fontSize: '0.85rem', color: 'var(--text-1)' }}>
                          {c.score !== undefined ? `${c.score}` : '—'}
                        </td>

                        <td style={{ padding: '12px 16px', fontWeight: 800, fontSize: '0.85rem', color: 'var(--text-1)' }}>
                          {c.percentage !== undefined ? `${c.percentage}%` : '—'}
                        </td>

                        <td style={{ padding: '12px 16px' }}>
                          {c.result ? (
                            <span
                              style={{
                                padding: '3px 10px',
                                borderRadius: '12px',
                                fontSize: '0.74rem',
                                fontWeight: 900,
                                background: isPassed ? '#10b981' : '#ef4444',
                                color: '#fff',
                              }}
                            >
                              {c.result}
                            </span>
                          ) : (
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-3)' }}>—</span>
                          )}
                        </td>

                        <td style={{ padding: '12px 16px', fontSize: '0.8rem', color: 'var(--text-2)' }}>
                          {c.timeTakenFormatted || '—'}
                        </td>
                      </tr>
                    );
                  })}
                  {(!summary?.candidates || summary.candidates.length === 0) && (
                    <tr>
                      <td colSpan={7} style={{ padding: '24px', textAlign: 'center', color: 'var(--text-3)', fontSize: '0.85rem' }}>
                        No candidates invited yet. Use <strong>Assign Candidates</strong> to invite learners.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 2: QUESTION-WISE ACCURACY ANALYTICS */}
          {activeTab === 'analytics' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ fontSize: '0.86rem', color: 'var(--text-2)' }}>
                Question accuracy breakdown across completed assessment submissions:
              </div>
              {summary?.questionAnalytics.map((q, idx) => (
                <div
                  key={q.questionId}
                  style={{
                    padding: '16px 20px',
                    borderRadius: '16px',
                    background: 'var(--surface-2)',
                    border: '1px solid var(--border-1)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-1)' }}>
                      Q{idx + 1}: {q.questionText}
                    </span>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#10b981' }}>
                      {q.correctPercent}% Correct Accuracy
                    </span>
                  </div>

                  {/* STACKED ACCURACY BAR */}
                  <div style={{ height: '12px', width: '100%', background: 'var(--surface-1)', borderRadius: '8px', overflow: 'hidden', display: 'flex' }}>
                    <div style={{ width: `${q.correctPercent}%`, background: '#10b981' }} title={`Correct: ${q.correctPercent}%`} />
                    <div style={{ width: `${q.incorrectPercent}%`, background: '#ef4444' }} title={`Incorrect: ${q.incorrectPercent}%`} />
                    <div style={{ width: `${q.unansweredPercent}%`, background: 'var(--border-1)' }} title={`Unanswered: ${q.unansweredPercent}%`} />
                  </div>

                  <div style={{ display: 'flex', gap: '20px', fontSize: '0.75rem', fontWeight: 700 }}>
                    <span style={{ color: '#10b981' }}>🟢 Correct: {q.correctPercent}%</span>
                    <span style={{ color: '#ef4444' }}>🔴 Incorrect: {q.incorrectPercent}%</span>
                    <span style={{ color: 'var(--text-3)' }}>⚪ Unanswered: {q.unansweredPercent}%</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <style>{`.spin-icon { animation: spin 1s linear infinite; } @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </motion.div>
    </div>
  );
};
