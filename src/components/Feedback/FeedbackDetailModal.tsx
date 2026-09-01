import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  X,
  Star,
  Sparkles,
  CheckSquare,
  Send,
  Archive,
  Edit,
  Eye,
  Brain,
  MessageSquare,
  AlertTriangle,
  Award,
  CheckCircle2,
  Save,
  Clock,
  UserCheck,
} from 'lucide-react';
import { useFeedback } from '../../context/FeedbackContext';
import { FeedbackRecord, FeedbackStatus } from '../../types/feedback';
import { StatusBadge } from '../ui';

interface FeedbackDetailModalProps {
  record: FeedbackRecord;
  onClose: () => void;
  initialMode?: 'view' | 'edit';
}

export const FeedbackDetailModal: React.FC<FeedbackDetailModalProps> = ({
  record,
  onClose,
  initialMode = 'view',
}) => {
  const { updateFeedback, approveFeedback, publishFeedback, runAiAnalysis, archiveFeedback } =
    useFeedback();

  const [mode, setMode] = useState<'view' | 'edit'>(initialMode);
  const [activeTab, setActiveTab] = useState<'overview' | 'ai' | 'comments'>('overview');

  // Edit Form States
  const [technicalRating, setTechnicalRating] = useState(record.technicalRating || 4);
  const [participationRating, setParticipationRating] = useState(record.participationRating || 4);
  const [communicationRating, setCommunicationRating] = useState(record.communicationRating || 4);
  const [problemSolvingRating, setProblemSolvingRating] = useState(record.problemSolvingRating || 4);
  const [overallRating, setOverallRating] = useState(record.overallRating || 4);

  const [strengthComments, setStrengthComments] = useState(record.strengthComments || '');
  const [improvementComments, setImprovementComments] = useState(record.improvementComments || '');
  const [generalComments, setGeneralComments] = useState(record.generalComments || '');
  const [status, setStatus] = useState<FeedbackStatus>(record.status || 'Needs Review');

  const [isSaved, setIsSaved] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  React.useEffect(() => {
    setMode(initialMode);
    setTechnicalRating(record.technicalRating || 4);
    setParticipationRating(record.participationRating || 4);
    setCommunicationRating(record.communicationRating || 4);
    setProblemSolvingRating(record.problemSolvingRating || 4);
    setOverallRating(record.overallRating || 4);
    setStrengthComments(record.strengthComments || '');
    setImprovementComments(record.improvementComments || '');
    setGeneralComments(record.generalComments || '');
    setStatus(record.status || 'Needs Review');
  }, [record, initialMode]);

  const handleSave = () => {
    updateFeedback(record.id, {
      technicalRating,
      participationRating,
      communicationRating,
      problemSolvingRating,
      overallRating,
      strengthComments,
      improvementComments,
      generalComments,
      status,
      updatedAt: new Date().toISOString(),
    });
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      setMode('view');
    }, 1200);
  };

  const handleRegenerateAi = () => {
    setIsAnalyzing(true);
    runAiAnalysis(record.id);
    setTimeout(() => {
      setIsAnalyzing(false);
    }, 1000);
  };

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    return (
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', color: '#f59e0b' }}>
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={14}
            fill={i < fullStars ? '#f59e0b' : 'none'}
            stroke="#f59e0b"
            strokeWidth={1.5}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="fbm-modal-backdrop" onClick={onClose} style={{ zIndex: 1100 }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ duration: 0.2 }}
        className="fbm-add-modal-shell"
        style={{ maxWidth: '840px', width: '92vw', maxHeight: '90vh', overflowY: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="fbm-modal-header" style={{ padding: '20px 24px' }}>
          <div className="fbm-header-left-group" style={{ gap: '16px' }}>
            <div className="fbm-header-icon-tile" style={{ background: '#0284c7', color: '#fff' }}>
              <MessageSquare size={22} />
            </div>
            <div className="fbm-header-title-block">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <span className="fbm-header-tag">{record.bootcampName}</span>
                <StatusBadge status={record.status} />
              </div>
              <h2 className="fbm-header-main-title" style={{ fontSize: '1.25rem', marginTop: '4px' }}>
                Feedback: {record.traineeName}
              </h2>
              <p className="fbm-header-subtitle">
                Trainee ID: <strong>{record.employeeId}</strong> • Trainer: <strong>{record.trainerName}</strong> • Module: <strong>{record.moduleName}</strong>
              </p>
            </div>
          </div>

          <div className="fbm-header-right-group" style={{ gap: '10px' }}>
            <div className="segmented-view-toggle">
              <button
                type="button"
                className={`segmented-btn ${mode === 'view' ? 'active' : ''}`}
                onClick={() => setMode('view')}
              >
                <Eye size={14} /> View
              </button>
              <button
                type="button"
                className={`segmented-btn ${mode === 'edit' ? 'active' : ''}`}
                onClick={() => setMode('edit')}
              >
                <Edit size={14} /> Edit
              </button>
            </div>

            <button
              type="button"
              className="fbm-modal-close-btn"
              onClick={onClose}
              title="Close modal"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* TOP QUICK ACTION STRIP */}
        <div
          style={{
            padding: '10px 24px',
            background: 'var(--color-bg-secondary, #f8fafc)',
            borderBottom: '1px solid var(--color-border, #e2e8f0)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Date:</span>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b' }}>{record.feedbackDate}</span>
            <span style={{ color: '#cbd5e1' }}>•</span>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Overall Score:</span>
            <span style={{ fontSize: '13px', fontWeight: 800, color: '#0d9488' }}>
              {record.overallRating.toFixed(1)} / 5.0
            </span>
            {renderStars(record.overallRating)}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {record.status !== 'Approved' && record.status !== 'Published' && (
              <button
                type="button"
                className="ui-button-secondary"
                style={{ height: '32px', fontSize: '12px', padding: '0 12px' }}
                onClick={() => approveFeedback(record.id)}
              >
                <CheckSquare size={14} /> Approve
              </button>
            )}

            {record.status !== 'Published' && (
              <button
                type="button"
                className="ui-button-primary"
                style={{ height: '32px', fontSize: '12px', padding: '0 12px' }}
                onClick={() => publishFeedback(record.id)}
              >
                <Send size={14} /> Publish
              </button>
            )}

            <button
              type="button"
              className="ui-button-secondary"
              style={{ height: '32px', fontSize: '12px', padding: '0 12px' }}
              onClick={handleRegenerateAi}
              disabled={isAnalyzing}
            >
              <Brain size={14} className={isAnalyzing ? 'animate-spin' : ''} />
              {isAnalyzing ? 'Analyzing...' : 'AI Insight'}
            </button>

            <button
              type="button"
              className="ui-button-danger"
              style={{ height: '32px', fontSize: '12px', padding: '0 12px' }}
              onClick={() => {
                archiveFeedback(record.id);
                onClose();
              }}
            >
              <Archive size={14} /> Archive
            </button>
          </div>
        </div>

        {/* MODAL CONTENT BODY */}
        <div style={{ padding: '24px' }}>
          {mode === 'view' ? (
            <div>
              {/* TAB NAVIGATION */}
              <div
                style={{
                  display: 'flex',
                  gap: '8px',
                  borderBottom: '1px solid #e2e8f0',
                  paddingBottom: '12px',
                  marginBottom: '20px',
                }}
              >
                <button
                  type="button"
                  onClick={() => setActiveTab('overview')}
                  style={{
                    padding: '6px 16px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: 600,
                    border: 'none',
                    background: activeTab === 'overview' ? '#0f766e' : 'transparent',
                    color: activeTab === 'overview' ? '#fff' : '#64748b',
                    cursor: 'pointer',
                  }}
                >
                  Ratings &amp; Overview
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('ai')}
                  style={{
                    padding: '6px 16px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: 600,
                    border: 'none',
                    background: activeTab === 'ai' ? '#0f766e' : 'transparent',
                    color: activeTab === 'ai' ? '#fff' : '#64748b',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Brain size={14} /> AI Analysis
                </button>
              </div>

              {activeTab === 'overview' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {/* RATINGS GRID */}
                  <div>
                    <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '12px' }}>
                      Performance Criteria Breakdown
                    </h4>
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                        gap: '12px',
                      }}
                    >
                      {[
                        { label: 'Technical Ability', val: record.technicalRating },
                        { label: 'Class Participation', val: record.participationRating },
                        { label: 'Communication', val: record.communicationRating },
                        { label: 'Problem Solving', val: record.problemSolvingRating },
                        { label: 'Practical Application', val: record.practicalApplicationRating || 4 },
                        { label: 'Learning Attitude', val: record.learningAttitudeRating || 5 },
                      ].map((item, idx) => (
                        <div
                          key={idx}
                          style={{
                            padding: '12px 14px',
                            background: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                          }}
                        >
                          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, display: 'block' }}>
                            {item.label}
                          </span>
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              marginTop: '4px',
                            }}
                          >
                            <span style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                              {item.val.toFixed(1)} / 5.0
                            </span>
                            {renderStars(item.val)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* COMMENTS SECTION */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div
                      style={{
                        padding: '16px',
                        background: '#f0fdf4',
                        border: '1px solid #bbf7d0',
                        borderRadius: '10px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <Award size={16} color="#16a34a" />
                        <strong style={{ fontSize: '13px', color: '#15803d' }}>Strengths &amp; Highlights</strong>
                      </div>
                      <p style={{ fontSize: '13px', color: '#166534', margin: 0, lineHeight: 1.5 }}>
                        {record.strengthComments || 'No specific strengths logged.'}
                      </p>
                    </div>

                    <div
                      style={{
                        padding: '16px',
                        background: '#fffbeb',
                        border: '1px solid #fde68a',
                        borderRadius: '10px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <AlertTriangle size={16} color="#d97706" />
                        <strong style={{ fontSize: '13px', color: '#b45309' }}>Areas for Growth &amp; Focus</strong>
                      </div>
                      <p style={{ fontSize: '13px', color: '#92400e', margin: 0, lineHeight: 1.5 }}>
                        {record.improvementComments || 'No specific improvement areas logged.'}
                      </p>
                    </div>
                  </div>

                  {record.generalComments && (
                    <div style={{ padding: '16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
                      <strong style={{ fontSize: '12px', color: '#475569', display: 'block', marginBottom: '4px' }}>
                        General Trainer Observations
                      </strong>
                      <p style={{ fontSize: '13px', color: '#334155', margin: 0, lineHeight: 1.5 }}>
                        {record.generalComments}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'ai' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {/* AI SUMMARY CARD */}
                  <div
                    style={{
                      padding: '18px',
                      background: 'linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%)',
                      border: '1px solid #99f6e4',
                      borderRadius: '12px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <Brain size={18} color="#0d9488" />
                      <strong style={{ fontSize: '14px', color: '#0f766e' }}>AI Synthesized Performance Summary</strong>
                    </div>
                    <p style={{ fontSize: '13.5px', color: '#115e59', margin: 0, lineHeight: 1.6 }}>
                      {record.aiSummary || 'AI analysis synthesizes technical proficiency and participation score.'}
                    </p>
                  </div>

                  {/* AI STRENGTHS & IMPROVEMENTS */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div style={{ padding: '16px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#0f766e', display: 'block', marginBottom: '10px' }}>
                        IDENTIFIED STRENGTHS
                      </span>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {(record.aiStrengths && record.aiStrengths.length > 0
                          ? record.aiStrengths
                          : ['Technical Aptitude', 'Communication', 'Problem Solving']
                        ).map((s, i) => (
                          <span
                            key={i}
                            style={{
                              padding: '4px 10px',
                              background: '#f0fdf4',
                              color: '#15803d',
                              border: '1px solid #bbf7d0',
                              borderRadius: '20px',
                              fontSize: '12px',
                              fontWeight: 600,
                            }}
                          >
                            ✓ {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div style={{ padding: '16px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#d97706', display: 'block', marginBottom: '10px' }}>
                        RECOMMENDED FOCUS AREAS
                      </span>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {(record.aiImprovementAreas && record.aiImprovementAreas.length > 0
                          ? record.aiImprovementAreas
                          : ['Timed Exercises', 'Complex Scenarios']
                        ).map((area, i) => (
                          <span
                            key={i}
                            style={{
                              padding: '4px 10px',
                              background: '#fffbeb',
                              color: '#b45309',
                              border: '1px solid #fde68a',
                              borderRadius: '20px',
                              fontSize: '12px',
                              fontWeight: 600,
                            }}
                          >
                            • {area}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {record.aiRecommendedFocus && (
                    <div style={{ padding: '16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
                      <strong style={{ fontSize: '12px', color: '#475569', display: 'block', marginBottom: '4px' }}>
                        AI Recommended Next Step
                      </strong>
                      <p style={{ fontSize: '13px', color: '#334155', margin: 0, lineHeight: 1.5 }}>
                        {record.aiRecommendedFocus}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            /* EDIT MODE FORM */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  Edit Feedback Ratings &amp; Comments
                </h4>
                {isSaved && (
                  <span style={{ color: '#16a34a', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <CheckCircle2 size={16} /> Saved successfully!
                  </span>
                )}
              </div>

              {/* RATINGS SLIDERS / INPUTS */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>
                    Technical Rating (1 to 5): {technicalRating}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    step="0.5"
                    value={technicalRating}
                    onChange={(e) => setTechnicalRating(parseFloat(e.target.value))}
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>
                    Participation Rating (1 to 5): {participationRating}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    step="0.5"
                    value={participationRating}
                    onChange={(e) => setParticipationRating(parseFloat(e.target.value))}
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>
                    Communication Rating (1 to 5): {communicationRating}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    step="0.5"
                    value={communicationRating}
                    onChange={(e) => setCommunicationRating(parseFloat(e.target.value))}
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>
                    Problem Solving Rating (1 to 5): {problemSolvingRating}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    step="0.5"
                    value={problemSolvingRating}
                    onChange={(e) => setProblemSolvingRating(parseFloat(e.target.value))}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>
                  Overall Rating (1 to 5)
                </label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  step="0.1"
                  value={overallRating}
                  onChange={(e) => setOverallRating(parseFloat(e.target.value) || 4)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    fontSize: '13px',
                  }}
                />
              </div>

              {/* COMMENTS TEXTAREAS */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>
                  Strengths &amp; Highlights
                </label>
                <textarea
                  rows={3}
                  value={strengthComments}
                  onChange={(e) => setStrengthComments(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    fontSize: '13px',
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>
                  Improvement Areas &amp; Focus
                </label>
                <textarea
                  rows={3}
                  value={improvementComments}
                  onChange={(e) => setImprovementComments(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    fontSize: '13px',
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>
                  General Observations
                </label>
                <textarea
                  rows={2}
                  value={generalComments}
                  onChange={(e) => setGeneralComments(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    fontSize: '13px',
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>
                  Feedback Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as FeedbackStatus)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    fontSize: '13px',
                  }}
                >
                  <option value="Needs Review">Needs Review</option>
                  <option value="Approved">Approved</option>
                  <option value="Published">Published</option>
                </select>
              </div>

              {/* SAVE BUTTON */}
              <div style={{ display: 'flex', justifySelf: 'flex-end', gap: '12px', marginTop: '12px' }}>
                <button
                  type="button"
                  className="ui-button-secondary"
                  onClick={() => setMode('view')}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="ui-button-primary"
                  onClick={handleSave}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Save size={16} /> Save Changes
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
