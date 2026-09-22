import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Send,
  Award,
  Trophy,
  HelpCircle,
  ShieldCheck,
  Check,
  RotateCcw,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import {
  quizAttemptService,
  QuizCandidateLandingInfo,
  QuizActiveAttemptState,
  QuizEvaluationResult,
} from '../../services/quizAttemptService';

interface CandidateQuizAttemptViewProps {
  token: string;
  onExit?: () => void;
}

export const CandidateQuizAttemptView: React.FC<CandidateQuizAttemptViewProps> = ({ token, onExit }) => {
  // Screen views: 'landing' | 'quiz' | 'submitting' | 'result'
  const [screenState, setScreenState] = useState<'landing' | 'quiz' | 'submitting' | 'result'>('landing');
  const [landingInfo, setLandingInfo] = useState<QuizCandidateLandingInfo | null>(null);
  const [attemptState, setAttemptState] = useState<QuizActiveAttemptState | null>(null);
  const [evaluationResult, setEvaluationResult] = useState<QuizEvaluationResult | null>(null);

  // Active quiz state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [savingStatus, setSavingStatus] = useState<Record<string, boolean>>({});
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load landing details on mount
  useEffect(() => {
    setIsLoading(true);
    quizAttemptService
      .getCandidateLanding(token)
      .then((info) => {
        setLandingInfo(info);
        if (info.attemptStatus === 'Completed') {
          // If already completed, load results immediately
          quizAttemptService.getAttemptResult(token).then((res) => {
            setEvaluationResult(res);
            setScreenState('result');
          });
        }
      })
      .catch((err) => {
        setErrorMessage(err.message || 'Failed to load assessment details.');
      })
      .finally(() => setIsLoading(false));
  }, [token]);

  // Server-authoritative timer loop
  useEffect(() => {
    let interval: any;
    if (screenState === 'quiz' && remainingSeconds > 0) {
      interval = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            handleFinalSubmit(true); // Auto-submit on timer expiry
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [screenState, remainingSeconds]);

  // Handle clicking "Start Quiz"
  const handleStartQuiz = async () => {
    setIsLoading(true);
    try {
      const activeState = await quizAttemptService.startAttempt(token);
      setAttemptState(activeState);
      setAnswers(activeState.savedAnswers || {});
      setRemainingSeconds(activeState.remainingTimeSeconds || activeState.durationMinutes * 60);
      setScreenState('quiz');
    } catch (err: any) {
      setErrorMessage(err.message || 'Unable to start assessment.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle option selection with auto-save
  const handleSelectOption = (questionId: string, option: string) => {
    const updatedAnswers = { ...answers, [questionId]: option };
    setAnswers(updatedAnswers);
    setSavingStatus((prev) => ({ ...prev, [questionId]: true }));

    // Auto-save to backend
    quizAttemptService
      .autoSaveAnswer(token, questionId, option)
      .then((res) => {
        if (res.remainingTimeSeconds) {
          setRemainingSeconds(res.remainingTimeSeconds);
        }
      })
      .finally(() => {
        setTimeout(() => {
          setSavingStatus((prev) => ({ ...prev, [questionId]: false }));
        }, 600);
      });
  };

  // Handle final submission
  const handleFinalSubmit = async (isAutoSubmit: boolean = false) => {
    setShowSubmitConfirm(false);
    setScreenState('submitting');
    try {
      const result = await quizAttemptService.submitAttempt(token);
      setEvaluationResult(result);
      setScreenState('result');
    } catch (err: any) {
      setErrorMessage(err.message || 'Error submitting assessment.');
      setScreenState('quiz');
    }
  };

  const formatTimer = (totalSeconds: number): string => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--surface-0)', color: 'var(--text-1)', gap: '16px' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid rgba(13, 148, 136, 0.2)', borderTopColor: '#0d9488', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-2)' }}>Loading Assessment Environment...</p>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface-0)', padding: '24px' }}>
        <div style={{ maxWidth: '440px', padding: '32px', borderRadius: '20px', background: 'var(--surface-2)', border: '1px solid var(--border-1)', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <AlertCircle size={48} style={{ color: '#ef4444' }} />
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-1)', margin: 0 }}>Unable to Access Quiz</h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-2)', margin: 0 }}>{errorMessage}</p>
          {onExit && (
            <button type="button" onClick={onExit} className="ai-quiz-btn-secondary" style={{ marginTop: '12px' }}>
              Return to Platform
            </button>
          )}
        </div>
      </div>
    );
  }

  // SCREEN 1: CANDIDATE LANDING PAGE (Instructions before timer starts)
  if (screenState === 'landing' && landingInfo) {
    return (
      <div style={{ minHeight: '100vh', width: '100%', background: 'var(--surface-0)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ width: '100%', maxWidth: '640px', borderRadius: '24px', background: 'var(--surface-1)', border: '1.5px solid var(--border-1)', boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)', overflow: 'hidden' }}
        >
          {/* LANDING HEADER */}
          <div style={{ padding: '32px 32px 24px 32px', background: 'linear-gradient(135deg, rgba(13, 148, 136, 0.15), rgba(79, 70, 229, 0.15))', borderBottom: '1px solid var(--border-1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <ShieldCheck size={18} style={{ color: '#0d9488' }} />
              <span style={{ fontSize: '0.78rem', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase', color: '#0d9488' }}>
                Systech L&D Official Assessment
              </span>
            </div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--text-1)', margin: '0 0 8px 0', lineHeight: 1.3 }}>
              {landingInfo.quizTitle}
            </h1>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-2)', margin: 0 }}>
              {landingInfo.description}
            </p>
          </div>

          {/* CANDIDATE INFO & METRICS GRID */}
          <div style={{ padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ padding: '14px 18px', borderRadius: '14px', background: 'var(--surface-2)', border: '1px solid var(--border-1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase' }}>Assigned Candidate</span>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-1)' }}>{landingInfo.candidateName}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-2)' }}>{landingInfo.candidateEmail}</div>
              </div>
              <span style={{ padding: '6px 12px', borderRadius: '20px', background: 'rgba(13, 148, 136, 0.15)', color: '#0d9488', fontSize: '0.78rem', fontWeight: 800 }}>
                Verified Link
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              <div style={{ padding: '14px', borderRadius: '14px', background: 'var(--surface-2)', border: '1px solid var(--border-1)', textAlign: 'center' }}>
                <BookOpen size={20} style={{ color: '#0d9488', marginBottom: '4px' }} />
                <div style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--text-1)' }}>{landingInfo.questionCount}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-3)', fontWeight: 700 }}>Questions</div>
              </div>
              <div style={{ padding: '14px', borderRadius: '14px', background: 'var(--surface-2)', border: '1px solid var(--border-1)', textAlign: 'center' }}>
                <Clock size={20} style={{ color: '#4f46e5', marginBottom: '4px' }} />
                <div style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--text-1)' }}>{landingInfo.durationMinutes}m</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-3)', fontWeight: 700 }}>Time Limit</div>
              </div>
              <div style={{ padding: '14px', borderRadius: '14px', background: 'var(--surface-2)', border: '1px solid var(--border-1)', textAlign: 'center' }}>
                <Award size={20} style={{ color: '#10b981', marginBottom: '4px' }} />
                <div style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--text-1)' }}>{landingInfo.passPercentage}%</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-3)', fontWeight: 700 }}>Pass Mark</div>
              </div>
            </div>

            {/* INSTRUCTIONS */}
            <div style={{ padding: '16px', borderRadius: '14px', background: 'rgba(79, 70, 229, 0.08)', border: '1px solid rgba(79, 70, 229, 0.2)', fontSize: '0.84rem', color: 'var(--text-2)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <strong style={{ color: 'var(--text-1)', fontSize: '0.88rem' }}>📌 Assessment Instructions:</strong>
              <ul style={{ margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <li>The countdown timer starts immediately once you click <strong>Start Quiz</strong>.</li>
                <li>Your answers are saved automatically on selection.</li>
                <li>When the timer reaches 00:00, your answers will be automatically submitted.</li>
                <li>Ensure a stable network connection before starting.</li>
              </ul>
            </div>

            {/* START BUTTON */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={handleStartQuiz}
              style={{
                padding: '16px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #0d9488, #4f46e5)',
                color: '#fff',
                fontSize: '1.05rem',
                fontWeight: 900,
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 8px 24px rgba(13, 148, 136, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              Start Quiz <ArrowRight size={20} />
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  // SCREEN 2: MENTIMETER-STYLE INTERACTIVE QUIZ UI
  if (screenState === 'quiz' && attemptState) {
    const currentQ = attemptState.questions[currentQuestionIndex];
    const totalQuestions = attemptState.questions.length;
    const answeredCount = Object.keys(answers).length;
    const isTimerWarning = remainingSeconds <= 60;

    return (
      <div style={{ minHeight: '100vh', width: '100%', background: 'var(--surface-0)', display: 'flex', flexDirection: 'column' }}>
        {/* MENTIMETER HEADER */}
        <header style={{ padding: '16px 24px', background: 'var(--surface-1)', borderBottom: '1px solid var(--border-1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0d9488', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {attemptState.quizTitle}
            </span>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-1)' }}>
              Candidate: {attemptState.candidateName}
            </div>
          </div>

          {/* TIMER & PROGRESS COUNTER */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ padding: '6px 14px', borderRadius: '20px', background: 'var(--surface-2)', border: '1px solid var(--border-1)', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-2)' }}>
              Answered: <strong style={{ color: '#0d9488' }}>{answeredCount}</strong> / {totalQuestions}
            </div>

            {/* SERVER TIMER */}
            <div
              style={{
                padding: '8px 16px',
                borderRadius: '24px',
                background: isTimerWarning ? 'rgba(239, 68, 68, 0.15)' : 'rgba(13, 148, 136, 0.15)',
                border: `1.5px solid ${isTimerWarning ? '#ef4444' : '#0d9488'}`,
                color: isTimerWarning ? '#ef4444' : '#0d9488',
                fontSize: '1.1rem',
                fontWeight: 900,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <Clock size={18} />
              {formatTimer(remainingSeconds)}
            </div>
          </div>
        </header>

        {/* PROGRESS BAR */}
        <div style={{ height: '4px', width: '100%', background: 'var(--surface-2)', overflow: 'hidden' }}>
          <motion.div
            animate={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
            transition={{ duration: 0.3 }}
            style={{ height: '100%', background: 'linear-gradient(90deg, #0d9488, #4f46e5)' }}
          />
        </div>

        {/* MAIN QUESTION DISPLAY */}
        <main style={{ flex: 1, padding: '24px', maxWidth: '840px', width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '24px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <span className="badge-tag" style={{ background: 'rgba(79, 70, 229, 0.15)', color: '#4f46e5', fontWeight: 800 }}>
                Question {currentQuestionIndex + 1} of {totalQuestions}
              </span>
              {savingStatus[currentQ.id] && (
                <span style={{ fontSize: '0.78rem', color: '#10b981', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Check size={14} /> Auto-saved
                </span>
              )}
            </div>

            {/* QUESTION TEXT HEADER */}
            <div style={{ padding: '16px 0', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-1)', margin: 0, lineHeight: 1.4, letterSpacing: '-0.2px' }}>
                {currentQ.question}
              </h2>
            </div>

            {/* 2x2 OPTIONS GRID */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
              {currentQ.options?.map((opt, idx) => {
                const isSelected = answers[currentQ.id] === opt;
                const numberBadge = idx + 1;

                return (
                  <motion.div
                    key={idx}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.985 }}
                    onClick={() => handleSelectOption(currentQ.id, opt)}
                    style={{
                      padding: '16px 20px',
                      borderRadius: '14px',
                      background: isSelected ? 'rgba(16, 185, 129, 0.08)' : 'var(--surface-1)',
                      border: `1.5px solid ${isSelected ? '#10b981' : 'var(--border-1)'}`,
                      boxShadow: isSelected ? '0 0 14px rgba(16, 185, 129, 0.25)' : '0 2px 8px rgba(0,0,0,0.04)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div
                      style={{
                        width: '34px',
                        height: '34px',
                        borderRadius: '8px',
                        background: isSelected ? 'rgba(16, 185, 129, 0.15)' : 'rgba(59, 130, 246, 0.1)',
                        border: `1px solid ${isSelected ? '#10b981' : 'rgba(59, 130, 246, 0.25)'}`,
                        color: isSelected ? '#10b981' : '#3b82f6',
                        fontSize: '0.9rem',
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {isSelected ? <Check size={18} style={{ color: '#10b981' }} /> : numberBadge}
                    </div>
                    <div style={{ fontSize: '0.95rem', fontWeight: isSelected ? 800 : 600, color: 'var(--text-1)', flex: 1, lineHeight: 1.35 }}>
                      {opt}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* FOOTER NAVIGATION */}
          <footer style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '20px', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ fontSize: '0.84rem', color: 'var(--text-3)', fontWeight: 500 }}>
              Press or click any option to select • Auto-saves instantly
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                type="button"
                disabled={currentQuestionIndex === 0}
                onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                className="ai-quiz-btn-secondary"
                style={{ opacity: currentQuestionIndex === 0 ? 0.4 : 1, padding: '10px 18px', borderRadius: '24px' }}
              >
                <ArrowLeft size={16} /> Previous
              </button>

              {currentQuestionIndex + 1 < totalQuestions ? (
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  type="button"
                  onClick={() => setCurrentQuestionIndex((prev) => Math.min(totalQuestions - 1, prev + 1))}
                  style={{
                    padding: '12px 28px',
                    borderRadius: '24px',
                    background: '#1d4ed8',
                    color: '#fff',
                    fontSize: '0.92rem',
                    fontWeight: 800,
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(29, 78, 216, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  Next <ArrowRight size={16} />
                </motion.button>
              ) : null}

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                type="button"
                onClick={() => setShowSubmitConfirm(true)}
                style={{
                  padding: '12px 28px',
                  borderRadius: '24px',
                  background: 'linear-gradient(135deg, #10b981, #0d9488)',
                  color: '#fff',
                  fontSize: '0.92rem',
                  fontWeight: 900,
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                Submit Assessment <Send size={16} />
              </motion.button>
            </div>
          </footer>
        </main>

        {/* SUBMIT CONFIRMATION MODAL */}
        <AnimatePresence>
          {showSubmitConfirm && (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '24px' }}>
              <motion.div
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.92 }}
                style={{ width: '100%', maxWidth: '420px', padding: '28px', borderRadius: '20px', background: 'var(--surface-1)', border: '1px solid var(--border-1)', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px' }}
              >
                <HelpCircle size={44} style={{ color: '#0d9488', margin: '0 auto' }} />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-1)', margin: 0 }}>Confirm Submission</h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-2)', margin: 0 }}>
                  You have answered <strong>{answeredCount}</strong> of <strong>{totalQuestions}</strong> questions. Are you sure you want to submit your assessment now?
                </p>
                <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                  <button type="button" onClick={() => setShowSubmitConfirm(false)} className="ai-quiz-btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>
                    Cancel
                  </button>
                  <button type="button" onClick={() => handleFinalSubmit(false)} className="ai-quiz-btn-primary" style={{ flex: 1, justifyContent: 'center', background: '#10b981' }}>
                    Confirm Submit
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // SCREEN 3: SUBMITTING SPINNER
  if (screenState === 'submitting') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--surface-0)', color: 'var(--text-1)', gap: '16px' }}>
        <div style={{ width: '48px', height: '48px', border: '3.5px solid rgba(16, 185, 129, 0.2)', borderTopColor: '#10b981', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-1)' }}>Evaluating Assessment Results...</h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-2)' }}>Calculating score, percentage, and candidate report.</p>
      </div>
    );
  }

  // SCREEN 4: CANDIDATE RESULT PAGE (Instant Score Card)
  if (screenState === 'result' && evaluationResult) {
    const isPassed = evaluationResult.status === 'PASSED';

    return (
      <div style={{ minHeight: '100vh', width: '100%', background: 'var(--surface-0)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{ width: '100%', maxWidth: '680px', borderRadius: '24px', background: 'var(--surface-1)', border: '1.5px solid var(--border-1)', boxShadow: '0 20px 50px rgba(0, 0, 0, 0.3)', overflow: 'hidden' }}
        >
          {/* RESULT HEADER */}
          <div style={{ padding: '36px 32px 28px 32px', textAlign: 'center', background: isPassed ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.18), rgba(13, 148, 136, 0.18))' : 'linear-gradient(135deg, rgba(239, 68, 68, 0.18), rgba(245, 158, 11, 0.18))', borderBottom: '1px solid var(--border-1)' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: isPassed ? '#10b981' : '#ef4444', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto', boxShadow: `0 0 24px ${isPassed ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'}` }}>
              {isPassed ? <Trophy size={32} /> : <XCircle size={32} />}
            </div>

            <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--text-1)', margin: '0 0 4px 0' }}>
              Assessment Completed
            </h1>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-2)', margin: 0 }}>
              Candidate: <strong>{evaluationResult.candidateName}</strong> • {evaluationResult.quizTitle}
            </p>

            <div style={{ marginTop: '16px', display: 'inline-flex', padding: '6px 18px', borderRadius: '20px', background: isPassed ? '#10b981' : '#ef4444', color: '#fff', fontSize: '0.92rem', fontWeight: 900, letterSpacing: '0.5px' }}>
              STATUS: {evaluationResult.status}
            </div>
          </div>

          {/* MAIN STATS GRID */}
          <div style={{ padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
              <div style={{ padding: '16px', borderRadius: '16px', background: 'var(--surface-2)', border: '1px solid var(--border-1)', textAlign: 'center' }}>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--text-1)' }}>{evaluationResult.score} / {evaluationResult.totalMarks}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-3)', fontWeight: 700 }}>Score</div>
              </div>
              <div style={{ padding: '16px', borderRadius: '16px', background: 'var(--surface-2)', border: '1px solid var(--border-1)', textAlign: 'center' }}>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: isPassed ? '#10b981' : '#ef4444' }}>{evaluationResult.percentage}%</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-3)', fontWeight: 700 }}>Percentage</div>
              </div>
              <div style={{ padding: '16px', borderRadius: '16px', background: 'var(--surface-2)', border: '1px solid var(--border-1)', textAlign: 'center' }}>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#10b981' }}>{evaluationResult.correctAnswersCount}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-3)', fontWeight: 700 }}>Correct</div>
              </div>
              <div style={{ padding: '16px', borderRadius: '16px', background: 'var(--surface-2)', border: '1px solid var(--border-1)', textAlign: 'center' }}>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#4f46e5' }}>{evaluationResult.timeTakenFormatted}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-3)', fontWeight: 700 }}>Time Taken</div>
              </div>
            </div>

            {/* CONDITIONAL QUESTION REVIEW SECTION */}
            {evaluationResult.allowAnswerReview && evaluationResult.questionReviews && (
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-1)', marginBottom: '14px' }}>
                  Question Review
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '280px', overflowY: 'auto' }}>
                  {evaluationResult.questionReviews.map((rev, idx) => (
                    <div key={idx} style={{ padding: '14px 16px', borderRadius: '14px', background: 'var(--surface-2)', border: `1px solid ${rev.isCorrect ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}` }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                        {rev.isCorrect ? <CheckCircle2 size={16} style={{ color: '#10b981' }} /> : <XCircle size={16} style={{ color: '#ef4444' }} />}
                        <span style={{ fontSize: '0.84rem', fontWeight: 800, color: 'var(--text-1)' }}>
                          Q{idx + 1}: {rev.question}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-2)', display: 'flex', gap: '16px' }}>
                        <span>Your Answer: <strong style={{ color: rev.isCorrect ? '#10b981' : '#ef4444' }}>{rev.userAnswer}</strong></span>
                        {!rev.isCorrect && <span>Correct: <strong style={{ color: '#10b981' }}>{rev.correctAnswer}</strong></span>}
                      </div>
                      {rev.explanation && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-3)', marginTop: '4px', fontStyle: 'italic' }}>
                          💡 {rev.explanation}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {onExit && (
              <button type="button" onClick={onExit} className="ai-quiz-btn-primary" style={{ padding: '14px', justifyContent: 'center', width: '100%', fontSize: '0.95rem', fontWeight: 800 }}>
                Return to Dashboard
              </button>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  return null;
};
