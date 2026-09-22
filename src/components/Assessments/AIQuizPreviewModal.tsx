import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  X,
  Edit,
  RotateCcw,
  Trash2,
  CheckCircle2,
  Clock,
  Award,
  ChevronDown,
  Save,
  Send,
  Check,
  Zap,
} from 'lucide-react';
import { AIQuizGenerationPayload, QuizQuestion } from '../../types/assessment';
import { aiQuizService, GeneratedQuizResult } from '../../services/aiQuizService';

interface AIQuizPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  quizResult: GeneratedQuizResult | null;
  payload: AIQuizGenerationPayload | null;
  onSaveAsAssessment: (quiz: GeneratedQuizResult, status: 'Draft' | 'Scheduled') => void;
  onStartLiveQuiz: (quiz: GeneratedQuizResult) => void;
  onRegenerateQuiz?: () => void;
}

export const AIQuizPreviewModal: React.FC<AIQuizPreviewModalProps> = ({
  isOpen,
  onClose,
  quizResult,
  payload,
  onSaveAsAssessment,
  onStartLiveQuiz,
  onRegenerateQuiz,
}) => {
  if (!isOpen || !quizResult) return null;

  const [questions, setQuestions] = useState<QuizQuestion[]>(quizResult.questions || []);
  const [quizTitle, setQuizTitle] = useState<string>(quizResult.title || `${quizResult.topic} Quiz`);
  const [durationMinutes, setDurationMinutes] = useState<number>(15);
  const [passPercentage, setPassPercentage] = useState<number>(70);

  const [regeneratingQuestionId, setRegeneratingQuestionId] = useState<string | null>(null);
  const [activeRegenerateMenuId, setActiveRegenerateMenuId] = useState<string | null>(null);

  const [editingQuestion, setEditingQuestion] = useState<QuizQuestion | null>(null);
  const [editQuestionText, setEditQuestionText] = useState('');
  const [editOptions, setEditOptions] = useState<string[]>([]);
  const [editCorrectAnswer, setEditCorrectAnswer] = useState('');
  const [editExplanation, setEditExplanation] = useState('');
  const [editTimeLimit, setEditTimeLimit] = useState(30);
  const [editPoints, setEditPoints] = useState(1);

  const handleAddManualQuestion = () => {
    const newQ: QuizQuestion = {
      id: `q-manual-${Date.now()}`,
      question: 'Enter custom technical question text here',
      type: 'multiple_choice',
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      correctAnswer: 'Option A',
      explanation: 'Provide justification for the correct answer.',
      timeLimit: 30,
      points: 1,
    };
    setQuestions((prev) => [...prev, newQ]);
    handleOpenEditModal(newQ);
  };

  const handleRegenerateQuestion = async (
    q: QuizQuestion,
    action: 'easier' | 'harder' | 'different' | 'change_type'
  ) => {
    setActiveRegenerateMenuId(null);
    setRegeneratingQuestionId(q.id);

    try {
      const regenerated = await aiQuizService.regenerateSingleQuestion(
        quizResult.topic,
        q.id,
        q,
        action
      );

      setQuestions((prev) =>
        prev.map((item) => (item.id === q.id ? regenerated : item))
      );
    } catch (err) {
      console.error('Failed to regenerate single question:', err);
    } finally {
      setRegeneratingQuestionId(null);
    }
  };

  const handleDeleteQuestion = (qId: string) => {
    setQuestions((prev) => prev.filter((item) => item.id !== qId));
  };

  const handleOpenEditModal = (q: QuizQuestion) => {
    setEditingQuestion(q);
    setEditQuestionText(q.question);
    setEditOptions(q.options && q.options.length > 0 ? [...q.options] : ['', '', '', '']);
    setEditCorrectAnswer(q.correctAnswer);
    setEditExplanation(q.explanation);
    setEditTimeLimit(q.timeLimit || 30);
    setEditPoints(q.points || 1);
  };

  const handleSaveQuestionEdit = () => {
    if (!editingQuestion) return;

    setQuestions((prev) =>
      prev.map((item) =>
        item.id === editingQuestion.id
          ? {
              ...item,
              question: editQuestionText,
              options: editOptions,
              correctAnswer: editCorrectAnswer,
              explanation: editExplanation,
              timeLimit: editTimeLimit,
              points: editPoints,
            }
          : item
      )
    );
    setEditingQuestion(null);
  };

  const currentQuizData: GeneratedQuizResult & { durationMinutes?: number; passPercentage?: number } = {
    ...quizResult,
    title: quizTitle,
    questionCount: questions.length,
    questions,
    durationMinutes,
    passPercentage,
  };

  return (
    <div className="ai-quiz-modal-backdrop">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="ai-quiz-modal-card"
        style={{ maxWidth: '1000px' }}
      >
        {/* MODAL HEADER */}
        <div className="ai-quiz-modal-header">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="badge-tag" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <Sparkles size={12} /> AI Generated Quiz Preview
              </span>
              <span className="badge-tag" style={{ background: 'var(--surface-2)', color: 'var(--text-1)' }}>
                {quizResult.difficulty}
              </span>
              <span className="badge-tag" style={{ background: 'rgba(79, 70, 229, 0.15)', color: '#4f46e5' }}>
                {questions.length} Questions
              </span>
            </div>
            <input
              type="text"
              value={quizTitle}
              onChange={(e) => setQuizTitle(e.target.value)}
              className="ai-quiz-input-lg"
              style={{ fontSize: '1.3rem', fontWeight: 900, background: 'transparent', border: 'none', borderBottom: '1px dashed var(--border-1)', padding: '4px 0' }}
            />
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
          {/* QUIZ DURATION & PASS % SETTINGS STRIP */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', padding: '14px 18px', background: 'var(--surface-2)', borderRadius: '14px', border: '1px solid var(--border-1)', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={16} style={{ color: '#0d9488' }} />
              <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-1)' }}>Duration (Minutes):</label>
              <input
                type="number"
                min={1}
                max={180}
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Math.max(1, Number(e.target.value)))}
                style={{ width: '60px', padding: '4px 8px', borderRadius: '8px', background: 'var(--surface-1)', border: '1px solid var(--border-1)', color: 'var(--text-1)', fontWeight: 700, fontSize: '0.85rem' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Award size={16} style={{ color: '#10b981' }} />
              <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-1)' }}>Pass Percentage (%):</label>
              <input
                type="number"
                min={1}
                max={100}
                value={passPercentage}
                onChange={(e) => setPassPercentage(Math.max(1, Math.min(100, Number(e.target.value))))}
                style={{ width: '60px', padding: '4px 8px', borderRadius: '8px', background: 'var(--surface-1)', border: '1px solid var(--border-1)', color: 'var(--text-1)', fontWeight: 700, fontSize: '0.85rem' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-2)' }}>
              Review &amp; Edit Questions ({questions.length})
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {questions.map((q, idx) => {
              const isRegenerating = regeneratingQuestionId === q.id;
              const isMenuOpen = activeRegenerateMenuId === q.id;

              return (
                <motion.div
                  key={q.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="ai-question-card"
                  style={{
                    padding: '22px',
                    borderRadius: '20px',
                    background: isRegenerating ? 'rgba(13, 148, 136, 0.05)' : 'var(--surface-1)',
                    border: `1.5px solid ${isRegenerating ? '#0d9488' : 'var(--border-1)'}`,
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                  }}
                >
                  {/* QUESTION CARD HEADER */}
                  <div className="q-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', flex: 1 }}>
                      <div
                        className="q-num-badge"
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '10px',
                          background: 'rgba(13, 148, 136, 0.12)',
                          color: '#0d9488',
                          fontWeight: 900,
                          fontSize: '0.9rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          border: '1px solid rgba(13, 148, 136, 0.25)',
                        }}
                      >
                        {String(idx + 1).padStart(2, '0')}
                      </div>
                      <div style={{ flex: 1 }}>
                        <h3 className="q-title" style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-1)', margin: '0 0 6px 0', lineHeight: 1.45 }}>
                          {q.question}
                        </h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', fontSize: '0.78rem', color: 'var(--text-2)' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 8px', borderRadius: '6px', background: 'rgba(245, 158, 11, 0.1)', color: '#d97706', fontWeight: 700 }}>
                            <Clock size={12} /> {q.timeLimit || 30}s
                          </span>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 8px', borderRadius: '6px', background: 'rgba(79, 70, 229, 0.1)', color: '#4f46e5', fontWeight: 700 }}>
                            <Award size={12} /> {q.points || 10} pts
                          </span>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 8px', borderRadius: '6px', background: 'var(--surface-2)', color: 'var(--text-2)', fontWeight: 700 }}>
                            {q.type === 'multiple_choice' ? 'Multiple Choice' : 'Type Answer'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* QUESTION CARD ACTIONS */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0, position: 'relative' }}>
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(q)}
                        className="ai-quiz-btn-secondary"
                        style={{ padding: '7px 14px', borderRadius: '10px', fontSize: '0.78rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                      >
                        <Edit size={13} /> Edit
                      </button>

                      <div style={{ position: 'relative' }}>
                        <button
                          type="button"
                          onClick={() => setActiveRegenerateMenuId(isMenuOpen ? null : q.id)}
                          disabled={isRegenerating}
                          className="ai-quiz-btn-secondary"
                          style={{ padding: '7px 14px', borderRadius: '10px', fontSize: '0.78rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#0d9488', borderColor: 'rgba(13, 148, 136, 0.3)' }}
                        >
                          <RotateCcw size={13} /> Regenerate <ChevronDown size={11} />
                        </button>

                        {isMenuOpen && (
                          <div style={{ position: 'absolute', right: 0, marginTop: '6px', width: '190px', background: 'var(--surface-1)', border: '1px solid var(--border-1)', borderRadius: '14px', boxShadow: '0 10px 30px rgba(0,0,0,0.15)', zIndex: 30, overflow: 'hidden', padding: '6px' }}>
                            <button
                              type="button"
                              onClick={() => handleRegenerateQuestion(q, 'easier')}
                              style={{ width: '100%', padding: '8px 12px', textAlign: 'left', background: 'none', border: 'none', borderRadius: '8px', color: 'var(--text-1)', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}
                            >
                              Make Easier
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRegenerateQuestion(q, 'harder')}
                              style={{ width: '100%', padding: '8px 12px', textAlign: 'left', background: 'none', border: 'none', borderRadius: '8px', color: 'var(--text-1)', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}
                            >
                              Make Harder
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRegenerateQuestion(q, 'different')}
                              style={{ width: '100%', padding: '8px 12px', textAlign: 'left', background: 'none', border: 'none', borderRadius: '8px', color: 'var(--text-1)', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}
                            >
                              Create Different Question
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRegenerateQuestion(q, 'change_type')}
                              style={{ width: '100%', padding: '8px 12px', textAlign: 'left', background: 'none', border: 'none', borderRadius: '8px', color: 'var(--text-1)', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}
                            >
                              Change Question Type
                            </button>
                          </div>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteQuestion(q.id)}
                        style={{ padding: '8px', background: 'transparent', border: 'none', borderRadius: '8px', color: 'var(--text-3)', cursor: 'pointer', transition: 'color 0.2s' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {/* 2x2 OPTIONS GRID WITH NEAT ALIGNMENT */}
                  {q.type === 'multiple_choice' && q.options && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginTop: '4px' }}>
                      {q.options.map((opt, optIdx) => {
                        const isCorrect = opt === q.correctAnswer;
                        const optionLabel = String.fromCharCode(65 + optIdx);

                        return (
                          <div
                            key={optIdx}
                            style={{
                              padding: '12px 16px',
                              borderRadius: '12px',
                              background: isCorrect ? 'rgba(16, 185, 129, 0.08)' : 'var(--surface-2)',
                              border: `1.5px solid ${isCorrect ? '#10b981' : 'var(--border-1)'}`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: '12px',
                              boxShadow: isCorrect ? '0 0 12px rgba(16, 185, 129, 0.15)' : 'none',
                              transition: 'all 0.2s ease',
                              minHeight: '48px',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
                              <span
                                style={{
                                  width: '28px',
                                  height: '28px',
                                  borderRadius: '8px',
                                  background: isCorrect ? 'rgba(16, 185, 129, 0.18)' : 'var(--surface-1)',
                                  color: isCorrect ? '#10b981' : 'var(--text-2)',
                                  border: `1px solid ${isCorrect ? '#10b981' : 'var(--border-1)'}`,
                                  fontSize: '0.78rem',
                                  fontWeight: 800,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  flexShrink: 0,
                                }}
                              >
                                {optionLabel}
                              </span>
                              <span style={{ fontSize: '0.88rem', fontWeight: isCorrect ? 800 : 600, color: 'var(--text-1)', lineHeight: 1.35, wordBreak: 'break-word' }}>
                                {opt}
                              </span>
                            </div>
                            {isCorrect && (
                              <span
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  color: '#10b981',
                                  fontWeight: 800,
                                  fontSize: '0.76rem',
                                  padding: '4px 10px',
                                  borderRadius: '20px',
                                  background: 'rgba(16, 185, 129, 0.15)',
                                  flexShrink: 0,
                                }}
                              >
                                <CheckCircle2 size={13} /> Correct
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* EXPLANATION BOX */}
                  {q.explanation && (
                    <div
                      style={{
                        padding: '14px 18px',
                        borderRadius: '14px',
                        background: 'rgba(13, 148, 136, 0.06)',
                        border: '1px solid rgba(13, 148, 136, 0.22)',
                        fontSize: '0.82rem',
                        color: 'var(--text-1)',
                        marginTop: '2px',
                      }}
                    >
                      <span style={{ fontWeight: 900, color: '#0d9488', textTransform: 'uppercase', fontSize: '0.72rem', letterSpacing: '0.5px', display: 'block', marginBottom: '4px' }}>
                        EXPLANATION:
                      </span>
                      <p style={{ margin: 0, lineHeight: 1.5, color: 'var(--text-1)', fontWeight: 500 }}>{q.explanation}</p>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* MODAL FOOTER */}
        <div className="ai-quiz-modal-footer">
          {onRegenerateQuiz && (
            <button
              type="button"
              onClick={onRegenerateQuiz}
              className="ai-quiz-btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#0d9488', borderColor: 'rgba(13, 148, 136, 0.3)' }}
            >
              <RotateCcw size={14} /> Regenerate Quiz
            </button>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: 'auto' }}>
            <button
              type="button"
              onClick={() => onSaveAsAssessment(currentQuizData, 'Draft')}
              className="ai-quiz-btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Save size={14} /> Save Draft
            </button>

            <button
              type="button"
              onClick={() => onSaveAsAssessment(currentQuizData, 'Scheduled')}
              className="ai-quiz-btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#10b981', color: '#fff' }}
            >
              <CheckCircle2 size={14} /> Publish &amp; Assign Candidates
            </button>

            <button
              type="button"
              onClick={() => onStartLiveQuiz(currentQuizData)}
              className="ai-quiz-btn-primary"
              style={{ background: 'linear-gradient(135deg, #0d9488, #4f46e5)', boxShadow: '0 4px 14px rgba(13, 148, 136, 0.4)' }}
            >
              <Zap size={14} /> Start Live Host Session
            </button>
          </div>
        </div>

        {/* MANUAL QUESTION EDIT MODAL */}
        {editingQuestion && (
          <div className="ai-quiz-modal-backdrop" style={{ zIndex: 1100 }}>
            <div className="ai-quiz-modal-card" style={{ maxWidth: '600px' }}>
              <div className="ai-quiz-modal-header">
                <h2><Edit size={16} style={{ color: '#0d9488' }} /> Manual Question Edit</h2>
                <button type="button" onClick={() => setEditingQuestion(null)} className="close-btn"><X size={18} /></button>
              </div>
              <div className="ai-quiz-modal-body">
                <div className="ai-quiz-form-group">
                  <label>Question Text</label>
                  <input type="text" value={editQuestionText} onChange={(e) => setEditQuestionText(e.target.value)} className="ai-quiz-input-lg" />
                </div>
                <div className="ai-quiz-form-group">
                  <label>Options &amp; Correct Answer Selection</label>
                  {editOptions.map((optText, optIdx) => (
                    <div key={optIdx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={() => setEditCorrectAnswer(optText)}
                        className={`ai-quiz-pill-btn ${editCorrectAnswer === optText ? 'active' : ''}`}
                        style={{ width: '32px', height: '32px', padding: 0 }}
                      >
                        {editCorrectAnswer === optText ? <Check size={14} /> : String.fromCharCode(65 + optIdx)}
                      </button>
                      <input
                        type="text"
                        value={optText}
                        onChange={(e) => {
                          const updated = [...editOptions];
                          updated[optIdx] = e.target.value;
                          setEditOptions(updated);
                          if (editCorrectAnswer === optText) setEditCorrectAnswer(e.target.value);
                        }}
                        className="ai-quiz-input-lg"
                        style={{ padding: '8px 12px' }}
                      />
                    </div>
                  ))}
                </div>
                <div className="ai-quiz-form-group">
                  <label>Explanation</label>
                  <textarea rows={2} value={editExplanation} onChange={(e) => setEditExplanation(e.target.value)} className="ai-quiz-textarea" />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="ai-quiz-form-group">
                    <label>Time Limit (Sec)</label>
                    <input type="number" value={editTimeLimit} onChange={(e) => setEditTimeLimit(Number(e.target.value))} className="ai-quiz-input-lg" style={{ padding: '8px 12px' }} />
                  </div>
                  <div className="ai-quiz-form-group">
                    <label>Points</label>
                    <input type="number" value={editPoints} onChange={(e) => setEditPoints(Number(e.target.value))} className="ai-quiz-input-lg" style={{ padding: '8px 12px' }} />
                  </div>
                </div>
              </div>
              <div className="ai-quiz-modal-footer">
                <button type="button" onClick={() => setEditingQuestion(null)} className="ai-quiz-btn-secondary">Cancel</button>
                <button type="button" onClick={handleSaveQuestionEdit} className="ai-quiz-btn-primary">Save Changes</button>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
