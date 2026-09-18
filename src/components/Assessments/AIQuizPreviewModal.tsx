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

  const [regeneratingQuestionId, setRegeneratingQuestionId] = useState<string | null>(null);
  const [activeRegenerateMenuId, setActiveRegenerateMenuId] = useState<string | null>(null);

  const [editingQuestion, setEditingQuestion] = useState<QuizQuestion | null>(null);
  const [editQuestionText, setEditQuestionText] = useState('');
  const [editOptions, setEditOptions] = useState<string[]>([]);
  const [editCorrectAnswer, setEditCorrectAnswer] = useState('');
  const [editExplanation, setEditExplanation] = useState('');
  const [editTimeLimit, setEditTimeLimit] = useState(30);
  const [editPoints, setEditPoints] = useState(10);

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
    setEditPoints(q.points || 10);
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

  const currentQuizData: GeneratedQuizResult = {
    ...quizResult,
    title: quizTitle,
    questionCount: questions.length,
    questions,
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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
                    borderColor: isRegenerating ? '#0d9488' : undefined,
                    background: isRegenerating ? 'rgba(13, 148, 136, 0.05)' : undefined
                  }}
                >
                  {/* QUESTION CARD HEADER */}
                  <div className="q-header">
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                      <div className="q-num-badge">
                        {String(idx + 1).padStart(2, '0')}
                      </div>
                      <div>
                        <div className="q-title">{q.question}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px', fontSize: '0.76rem', color: 'var(--text-2)' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Clock size={12} style={{ color: '#f59e0b' }} /> {q.timeLimit || 30}s
                          </span>
                          <span>•</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Award size={12} style={{ color: '#4f46e5' }} /> {q.points || 10} pts
                          </span>
                          <span>•</span>
                          <span style={{ textTransform: 'capitalize', fontWeight: 700 }}>
                            {q.type === 'multiple_choice' ? 'Multiple Choice' : 'Type Answer'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* QUESTION CARD ACTIONS */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', position: 'relative' }}>
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(q)}
                        className="ai-quiz-btn-secondary"
                        style={{ padding: '6px 12px', fontSize: '0.76rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <Edit size={12} /> Edit
                      </button>

                      <div style={{ position: 'relative' }}>
                        <button
                          type="button"
                          onClick={() => setActiveRegenerateMenuId(isMenuOpen ? null : q.id)}
                          disabled={isRegenerating}
                          className="ai-quiz-btn-secondary"
                          style={{ padding: '6px 12px', fontSize: '0.76rem', display: 'flex', alignItems: 'center', gap: '4px', color: '#0d9488', borderColor: 'rgba(13, 148, 136, 0.3)' }}
                        >
                          <RotateCcw size={12} /> Regenerate <ChevronDown size={10} />
                        </button>

                        {isMenuOpen && (
                          <div style={{ position: 'absolute', right: 0, marginTop: '4px', width: '180px', background: 'var(--surface-1)', border: '1px solid var(--border-1)', borderRadius: '12px', boxShadow: 'var(--card-shadow)', zIndex: 30, overflow: 'hidden', padding: '4px' }}>
                            <button
                              type="button"
                              onClick={() => handleRegenerateQuestion(q, 'easier')}
                              style={{ width: '100%', padding: '8px 12px', textAlign: 'left', background: 'none', border: 'none', color: 'var(--text-1)', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}
                            >
                              Make Easier
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRegenerateQuestion(q, 'harder')}
                              style={{ width: '100%', padding: '8px 12px', textAlign: 'left', background: 'none', border: 'none', color: 'var(--text-1)', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}
                            >
                              Make Harder
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRegenerateQuestion(q, 'different')}
                              style={{ width: '100%', padding: '8px 12px', textAlign: 'left', background: 'none', border: 'none', color: 'var(--text-1)', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}
                            >
                              Create Different Question
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRegenerateQuestion(q, 'change_type')}
                              style={{ width: '100%', padding: '8px 12px', textAlign: 'left', background: 'none', border: 'none', color: 'var(--text-1)', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}
                            >
                              Change Question Type
                            </button>
                          </div>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteQuestion(q.id)}
                        style={{ padding: '6px', background: 'transparent', border: 'none', color: 'var(--text-3)', cursor: 'pointer' }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  {/* OPTIONS LIST */}
                  {q.type === 'multiple_choice' && q.options && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '8px' }}>
                      {q.options.map((opt, optIdx) => {
                        const isCorrect = opt === q.correctAnswer;
                        const optionLabel = String.fromCharCode(65 + optIdx);

                        return (
                          <div
                            key={optIdx}
                            className={`ai-option-item ${isCorrect ? 'correct' : ''}`}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ width: '20px', height: '20px', borderRadius: '4px', background: 'var(--surface-1)', color: 'var(--text-2)', fontSize: '0.7rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {optionLabel}
                              </span>
                              <span>{opt}</span>
                            </div>
                            {isCorrect && (
                              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#10b981', fontWeight: 800 }}>
                                <CheckCircle2 size={14} /> Correct
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* EXPLANATION BOX */}
                  {q.explanation && (
                    <div style={{ padding: '12px 14px', borderRadius: '12px', background: 'rgba(13, 148, 136, 0.06)', border: '1px solid rgba(13, 148, 136, 0.2)', fontSize: '0.78rem', color: 'var(--text-1)' }}>
                      <span style={{ fontWeight: 800, color: '#0d9488', textTransform: 'uppercase', fontSize: '0.68rem', display: 'block', marginBottom: '2px' }}>
                        Explanation:
                      </span>
                      <p style={{ margin: 0, lineHeight: 1.4 }}>{q.explanation}</p>
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
              className="ai-quiz-btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#0d9488', borderColor: 'rgba(13, 148, 136, 0.4)' }}
            >
              <CheckCircle2 size={14} /> Save Assessment
            </button>

            <button
              type="button"
              onClick={() => onStartLiveQuiz(currentQuizData)}
              className="ai-quiz-btn-primary"
              style={{ background: 'linear-gradient(135deg, #0d9488, #4f46e5)', boxShadow: '0 4px 14px rgba(13, 148, 136, 0.4)' }}
            >
              <Zap size={14} /> Start Live Quiz
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
