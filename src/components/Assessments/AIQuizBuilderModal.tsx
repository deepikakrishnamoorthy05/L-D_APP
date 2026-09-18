import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  X,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  ArrowRight,
  Cpu,
} from 'lucide-react';
import { AIQuizGenerationPayload } from '../../types/assessment';
import { aiQuizService, GeneratedQuizResult } from '../../services/aiQuizService';

interface AIQuizBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onQuizGenerated: (quiz: GeneratedQuizResult, payload: AIQuizGenerationPayload) => void;
}

const LOADING_STAGES = [
  { step: 1, label: 'Understanding Topic', desc: 'Analyzing topic scope and domain context...' },
  { step: 2, label: 'Designing Technical Questions', desc: 'Generating multiple-choice questions & options...' },
  { step: 3, label: 'Validating Answers & Explanations', desc: 'Verifying answer accuracy & rationale...' },
  { step: 4, label: 'Preparing Quiz Preview', desc: 'Structuring quiz payload...' },
];

const PRESET_SESSIONS = [
  { id: 'sess-1', title: 'Knowledge Sharing Series', topic: 'Databricks Performance Optimization', date: '18 Sep 2026', track: 'DE', trainer: 'Dinesh Kumar', participants: 22 },
  { id: 'sess-2', title: 'SQL Advanced Training', topic: 'SQL Window Functions & CTEs', date: '15 Aug 2026', track: 'DE', trainer: 'Sarah David', participants: 18 },
  { id: 'sess-3', title: 'Snowflake Training', topic: 'Snowflake Data Warehousing & Virtual Warehouses', date: '02 Sep 2026', track: 'DE', trainer: 'John Mathew', participants: 16 },
  { id: 'sess-4', title: 'BA Training', topic: 'Business Requirements & BRD Drafting', date: '10 Oct 2026', track: 'BA', trainer: 'Priya Sharma', participants: 14 },
  { id: 'sess-5', title: 'Informatica Training', topic: 'IICS Data Integration & Cloud Taskflows', date: '12 Sep 2026', track: 'Tools', trainer: 'Michael Paul', participants: 20 },
];

export const AIQuizBuilderModal: React.FC<AIQuizBuilderModalProps> = ({
  isOpen,
  onClose,
  onQuizGenerated,
}) => {
  const [creationMode, setCreationMode] = useState<'MANUAL' | 'SESSION'>('MANUAL');
  const [selectedSessionId, setSelectedSessionId] = useState<string>('');
  const [topic, setTopic] = useState('');
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [difficulty, setDifficulty] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Intermediate');

  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setErrorMessage(null);
      setIsGenerating(false);
      setCurrentStageIndex(0);
      setCreationMode('MANUAL');
      setTopic('');
      setSelectedSessionId('');
    }
  }, [isOpen]);

  const handleSelectSession = (sessId: string) => {
    setSelectedSessionId(sessId);
    const found = PRESET_SESSIONS.find((s) => s.id === sessId);
    if (found) {
      setTopic(`${found.title} — ${found.topic}`);
    }
  };

  useEffect(() => {
    let stageInterval: any;
    if (isGenerating) {
      stageInterval = setInterval(() => {
        setCurrentStageIndex((prev) => {
          if (prev < LOADING_STAGES.length - 1) {
            return prev + 1;
          }
          return prev;
        });
      }, 1000);
    }
    return () => clearInterval(stageInterval);
  }, [isGenerating]);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setErrorMessage('Please enter a topic or select an L&D session for the quiz.');
      return;
    }

    setErrorMessage(null);
    setIsGenerating(true);
    setCurrentStageIndex(0);

    const payload: AIQuizGenerationPayload = {
      topic: topic.trim(),
      questionCount,
      difficulty,
    };

    try {
      const result = await aiQuizService.generateQuiz(payload);
      setTimeout(() => {
        setIsGenerating(false);
        onQuizGenerated(result, payload);
      }, 600);
    } catch (err: any) {
      setIsGenerating(false);
      setErrorMessage(err.message || 'Quiz generation failed. Please try again.');
    }
  };

  return (
    <div className="ai-quiz-modal-backdrop">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
        className="ai-quiz-modal-card"
        style={{ maxWidth: '600px' }}
      >
        {/* MODAL HEADER */}
        <div className="ai-quiz-modal-header">
          <div className="header-left">
            <div className="header-icon-box">
              <Sparkles size={22} />
            </div>
            <div>
              <h2>AI Quiz Builder</h2>
              <p className="subtitle">
                Generate an instant evaluation quiz for any company L&amp;D training session.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isGenerating}
            className="close-btn"
          >
            <X size={20} />
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="ai-quiz-modal-body" style={{ gap: '20px' }}>
          {/* ERROR BANNER */}
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                padding: '12px 16px',
                borderRadius: '12px',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                color: '#ef4444',
                fontSize: '0.85rem',
                fontWeight: 600,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={18} />
                <span>{errorMessage}</span>
              </div>
              <button
                type="button"
                onClick={handleGenerate}
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  background: '#ef4444',
                  color: '#fff',
                  border: 'none',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <RotateCcw size={12} /> Retry
              </button>
            </motion.div>
          )}

          {/* GENERATING ANIMATION OVERLAY */}
          {isGenerating ? (
            <div style={{ padding: '30px 10px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '20px' }}>
              <div style={{ position: 'relative', width: '70px', height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'linear-gradient(135deg, #0d9488, #4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 0 25px rgba(13, 148, 136, 0.4)' }}>
                  <Cpu size={32} />
                </div>
              </div>

              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-1)', margin: 0 }}>Generating Quiz...</h3>
                <p style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0d9488', margin: '4px 0 0 0' }}>"{topic}"</p>
              </div>

              <div style={{ width: '100%', maxWidth: '420px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {LOADING_STAGES.map((stg, idx) => {
                  const isCurrent = idx === currentStageIndex;
                  const isDone = idx < currentStageIndex;
                  return (
                    <motion.div
                      key={stg.step}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      style={{
                        padding: '10px 14px',
                        borderRadius: '10px',
                        border: '1px solid',
                        borderColor: isCurrent ? '#0d9488' : isDone ? 'rgba(16, 185, 129, 0.3)' : 'var(--border-1)',
                        background: isCurrent ? 'rgba(13, 148, 136, 0.08)' : isDone ? 'rgba(16, 185, 129, 0.05)' : 'var(--surface-2)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        textAlign: 'left',
                      }}
                    >
                      <div>
                        {isDone ? (
                          <CheckCircle2 size={16} style={{ color: '#10b981' }} />
                        ) : isCurrent ? (
                          <Sparkles size={16} style={{ color: '#0d9488' }} />
                        ) : (
                          <div style={{ width: '14px', height: '14px', borderRadius: '50%', border: '1px solid var(--border-1)' }} />
                        )}
                      </div>
                      <div>
                        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-1)' }}>{stg.label}</div>
                        <div style={{ fontSize: '0.73rem', color: 'var(--text-2)' }}>{stg.desc}</div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* FORM CONTROLS WITH OPTION A & OPTION B SWITCHER */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* MODE SELECTOR TABS */}
              <div style={{ display: 'flex', gap: '10px', padding: '4px', background: 'var(--surface-2)', borderRadius: '12px', border: '1px solid var(--border-1)' }}>
                <button
                  type="button"
                  onClick={() => setCreationMode('MANUAL')}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    border: 'none',
                    background: creationMode === 'MANUAL' ? '#0d9488' : 'transparent',
                    color: creationMode === 'MANUAL' ? '#fff' : 'var(--text-2)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  Option A: Custom Topic
                </button>
                <button
                  type="button"
                  onClick={() => setCreationMode('SESSION')}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    border: 'none',
                    background: creationMode === 'SESSION' ? '#0d9488' : 'transparent',
                    color: creationMode === 'SESSION' ? '#fff' : 'var(--text-2)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  Option B: Select L&amp;D Session
                </button>
              </div>

              {/* OPTION A: MANUAL TOPIC INPUT */}
              {creationMode === 'MANUAL' ? (
                <div className="ai-quiz-form-group">
                  <label style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-1)', marginBottom: '8px', display: 'block' }}>
                    Enter Topic / Training Subject
                  </label>
                  <input
                    type="text"
                    autoFocus
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleGenerate();
                    }}
                    placeholder="Example: SQL Window Functions, Python OOP, Snowflake, Databricks..."
                    className="ai-quiz-input-lg"
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      fontSize: '1rem',
                      fontWeight: 600,
                      borderRadius: '12px',
                      border: '1.5px solid var(--border-1)',
                      background: 'var(--surface-2)',
                      color: 'var(--text-1)',
                      boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)',
                    }}
                  />
                </div>
              ) : (
                /* OPTION B: SELECT L&D SESSION */
                <div className="ai-quiz-form-group">
                  <label style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-1)', marginBottom: '8px', display: 'block' }}>
                    Select Existing L&amp;D Training Session
                  </label>
                  <select
                    value={selectedSessionId}
                    onChange={(e) => handleSelectSession(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      fontSize: '0.95rem',
                      fontWeight: 600,
                      borderRadius: '12px',
                      border: '1.5px solid var(--border-1)',
                      background: 'var(--surface-2)',
                      color: 'var(--text-1)',
                    }}
                  >
                    <option value="">-- Choose Completed / Planned Session --</option>
                    {PRESET_SESSIONS.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.title} • {s.topic} ({s.date})
                      </option>
                    ))}
                  </select>

                  {selectedSessionId && (
                    <div style={{ marginTop: '12px', padding: '12px', borderRadius: '10px', background: 'rgba(13, 148, 136, 0.08)', border: '1px solid rgba(13, 148, 136, 0.2)', fontSize: '0.82rem', color: 'var(--text-1)' }}>
                      {(() => {
                        const s = PRESET_SESSIONS.find((x) => x.id === selectedSessionId);
                        if (!s) return null;
                        return (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <div><strong>Auto-filled Topic:</strong> {s.topic}</div>
                            <div><strong>Trainer:</strong> {s.trainer} | <strong>Track:</strong> {s.track} | <strong>Participants:</strong> {s.participants} Employees</div>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              )}

              {/* 2. NUMBER OF QUESTIONS */}
              <div className="ai-quiz-form-group">
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-1)', marginBottom: '8px' }}>
                  Questions
                </label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {[5, 10, 15, 20].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setQuestionCount(num)}
                      className={`ai-quiz-pill-btn ${questionCount === num ? 'active' : ''}`}
                      style={{
                        flex: 1,
                        padding: '10px 16px',
                        fontSize: '0.95rem',
                        fontWeight: 700,
                        justifyContent: 'center',
                        borderRadius: '10px',
                      }}
                    >
                      {num} {questionCount === num && '✓'}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. DIFFICULTY */}
              <div className="ai-quiz-form-group">
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-1)', marginBottom: '8px' }}>
                  Difficulty
                </label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {(['Beginner', 'Intermediate', 'Advanced'] as const).map((diff) => (
                    <button
                      key={diff}
                      type="button"
                      onClick={() => setDifficulty(diff)}
                      className={`ai-quiz-pill-btn ${difficulty === diff ? 'active' : ''}`}
                      style={{
                        flex: 1,
                        padding: '10px 16px',
                        fontSize: '0.9rem',
                        fontWeight: 700,
                        justifyContent: 'center',
                        borderRadius: '10px',
                      }}
                    >
                      {diff} {difficulty === diff && '✓'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* MODAL FOOTER */}
        {!isGenerating && (
          <div className="ai-quiz-modal-footer" style={{ marginTop: '8px' }}>
            <button
              type="button"
              onClick={onClose}
              className="ai-quiz-btn-secondary"
            >
              Cancel
            </button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={handleGenerate}
              className="ai-quiz-btn-primary"
              style={{
                padding: '12px 24px',
                fontSize: '0.95rem',
                fontWeight: 800,
                background: 'linear-gradient(135deg, #0d9488, #4f46e5)',
                boxShadow: '0 4px 14px rgba(13, 148, 136, 0.3)',
              }}
            >
              <Sparkles size={16} />
              <span>Generate Quiz →</span>
            </motion.button>
          </div>
        )}
      </motion.div>
    </div>
  );
};
