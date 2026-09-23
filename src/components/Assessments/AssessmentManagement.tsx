import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight, BarChart3, BookOpenCheck, CalendarDays,
  Sparkles, X, Users, Activity,
} from 'lucide-react';
import { useSessions } from '../../context/SessionContext';
import { useAssessments } from '../../context/AssessmentContext';
import { Session } from '../../types/session';
import { AIQuizGenerationPayload } from '../../types/assessment';
import { aiQuizService, GeneratedQuizResult } from '../../services/aiQuizService';
import { quizAttemptService, QuizAssessment } from '../../services/quizAttemptService';
import { AIQuizPreviewModal } from './AIQuizPreviewModal';
import { LiveQuizHostView } from './LiveQuizHostView';
import { LiveQuizParticipantView } from './LiveQuizParticipantView';
import { QuizPublishAssignModal } from './QuizPublishAssignModal';
import { LiveQuizAdminDashboardView } from './LiveQuizAdminDashboardView';
import { AssessmentOrbit } from './AssessmentOrbit';

type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';

export const AssessmentManagement: React.FC = () => {
  const { sessions } = useSessions();
  const { assessments, createAIGeneratedAssessment } = useAssessments();
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [topic, setTopic] = useState('');
  const [questionCount, setQuestionCount] = useState(10);
  const [difficulty, setDifficulty] = useState<Difficulty>('Intermediate');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuiz, setGeneratedQuiz] = useState<GeneratedQuizResult | null>(null);
  const [generatedPayload, setGeneratedPayload] = useState<AIQuizGenerationPayload | null>(null);

  // Modal display states
  const [showPreview, setShowPreview] = useState(false);
  const [showLiveHost, setShowLiveHost] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showDashboardModal, setShowDashboardModal] = useState(false);
  const [activeAssessmentForAssign, setActiveAssessmentForAssign] = useState<QuizAssessment | null>(null);
  const [activeQuizIdForDashboard, setActiveQuizIdForDashboard] = useState<string>('quiz-de-sample');

  const completedSessions = useMemo(() => sessions
    .filter((session) => session.status === 'Completed'
      && session.attendanceApplicable !== false
      && !['Holiday', 'Sign Off', 'Project', 'Feedback', 'Evaluation'].includes(session.eventType))
    .sort((a, b) => b.sessionDate.localeCompare(a.sessionDate)), [sessions]);

  const recentQuizzes = assessments
    .filter((assessment) => assessment.isAiGenerated)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 5);

  const scored = assessments.filter((assessment) => assessment.averageScore !== undefined);
  const averageScore = scored.length
    ? Math.round(scored.reduce((sum, assessment) => sum + (assessment.averageScore || 0), 0) / scored.length)
    : 0;

  const openGenerator = (session?: Session) => {
    const target = session || completedSessions[0] || null;
    setSelectedSession(target);
    setTopic(target?.moduleName || target?.title || '');
  };

  const closeGenerator = () => {
    if (!isGenerating) setSelectedSession(null);
  };

  const generateQuiz = async () => {
    if (!selectedSession || !topic.trim()) return;
    setIsGenerating(true);
    const payload: AIQuizGenerationPayload & { sessionId: string } = {
      sessionId: selectedSession.id,
      topic: topic.trim(), questionCount, difficulty,
    };
    try {
      const result = await aiQuizService.generateQuiz(payload);
      setGeneratedQuiz({ ...result, sessionId: selectedSession.id, sessionName: selectedSession.title } as GeneratedQuizResult);
      setGeneratedPayload(payload);
      setSelectedSession(null);
      setShowPreview(true);
    } catch {
      // fallback handling
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveAsAssessment = async (quiz: GeneratedQuizResult & { durationMinutes?: number; passPercentage?: number }, status: 'Draft' | 'Scheduled') => {
    createAIGeneratedAssessment(quiz, status, 'LD_ASSESSMENT');
    setShowPreview(false);

    // Save assessment to backend service
    const assessmentPayload: Partial<QuizAssessment> = {
      id: quiz.sessionId || `quiz-${Date.now()}`,
      title: quiz.title,
      topic: quiz.topic,
      difficulty: quiz.difficulty === 'Beginner' ? 'Easy' : quiz.difficulty === 'Advanced' ? 'Advanced' : 'Intermediate',
      durationMinutes: quiz.durationMinutes || 15,
      passPercentage: quiz.passPercentage || 70,
      status: status === 'Scheduled' ? 'Published' : 'Draft',
      questions: (quiz.questions || []).map((q, idx) => ({
        id: q.id,
        quizId: quiz.sessionId || `quiz-${Date.now()}`,
        question: q.question,
        optionA: q.options?.[0] || 'A',
        optionB: q.options?.[1] || 'B',
        optionC: q.options?.[2] || 'C',
        optionD: q.options?.[3] || 'D',
        options: q.options || [],
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        marks: 1,
        sequenceNumber: idx + 1,
      })),
    };

    try {
      const created = await quizAttemptService.publishQuiz(assessmentPayload.id || 'quiz-de-sample');
      if (status === 'Scheduled') {
        setActiveAssessmentForAssign({
          ...created,
          title: quiz.title,
          topic: quiz.topic,
          durationMinutes: quiz.durationMinutes || 15,
          passPercentage: quiz.passPercentage || 70,
          status: 'Published',
          questions: assessmentPayload.questions || [],
        });
        setShowAssignModal(true);
      }
    } catch {
      if (status === 'Scheduled') {
        setActiveAssessmentForAssign({
          id: assessmentPayload.id || `quiz-${Date.now()}`,
          title: quiz.title,
          topic: quiz.topic,
          description: `Assessment for ${quiz.topic}`,
          difficulty: 'Intermediate',
          durationMinutes: quiz.durationMinutes || 15,
          passPercentage: quiz.passPercentage || 70,
          status: 'Published',
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          allowAnswerReview: true,
          allowRetake: false,
          questions: assessmentPayload.questions || [],
        });
        setShowAssignModal(true);
      }
    }
  };

  const handleStartQuizAndSendInvite = (quiz: any) => {
    const targetAssessment: QuizAssessment = {
      id: quiz.id || `quiz-${Date.now()}`,
      title: quiz.name || quiz.title || 'Technical Assessment',
      topic: quiz.moduleName || quiz.topic || 'Data & Analytics',
      description: quiz.description || `Assessment for ${quiz.name || quiz.title}`,
      difficulty: 'Intermediate',
      durationMinutes: quiz.durationMinutes || 15,
      passPercentage: quiz.passPercentage || 70,
      status: 'Published',
      createdAt: quiz.createdAt || new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      allowAnswerReview: true,
      allowRetake: false,
      questions: quiz.questions || [],
    };
    setActiveAssessmentForAssign(targetAssessment);
    setShowAssignModal(true);
  };

  const handleOpenLiveDashboard = (quizId: string) => {
    setActiveQuizIdForDashboard(quizId || 'quiz-de-sample');
    setShowDashboardModal(true);
  };

  return (
    <motion.main className="assessment-workspace page-container space-y-6" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
      {/* 1. UNIFIED PREMIUM HERO CARD WITH 3D ANIMATED ORBIT */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="unified-bootcamp-hero-card"
      >
        {/* LEFT SECTION: ANIMATED ORBIT */}
        <div className="hero-section-left">
          <AssessmentOrbit />
        </div>

        {/* CENTER SECTION: EYEBROW, TITLE & SUBTITLE */}
        <div className="hero-section-center">
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="hero-eyebrow-badge"
          >
            <span>L&amp;D LEARNING OPERATIONS / ASSESSMENTS</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="hero-merged-title"
          >
            Assessments &amp; Live Quiz
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="hero-merged-subtitle"
          >
            Generate AI-powered quizzes, invite candidates securely, and monitor real-time assessment results.
          </motion.p>
        </div>

        {/* RIGHT SECTION: ACTION BUTTONS */}
        <div className="hero-section-right" style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', flexShrink: 0 }}>
          <motion.div
            initial={{ opacity: 0, x: 14 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}
          >
            <motion.button
              whileHover={{ scale: 1.03, y: -1 }}
              whileTap={{ scale: 0.97 }}
              type="button"
              onClick={() => openGenerator()}
              disabled={!completedSessions.length}
              style={{
                padding: '12px 22px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #0d9488 0%, #4f46e5 100%)',
                color: '#ffffff',
                fontSize: '0.9rem',
                fontWeight: 800,
                border: 'none',
                cursor: !completedSessions.length ? 'not-allowed' : 'pointer',
                opacity: !completedSessions.length ? 0.6 : 1,
                boxShadow: '0 6px 20px rgba(13, 148, 136, 0.35)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease',
              }}
            >
              <Sparkles size={17} style={{ color: '#5eead4' }} />
              <span>Generate Quiz</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03, y: -1 }}
              whileTap={{ scale: 0.97 }}
              type="button"
              onClick={() => handleOpenLiveDashboard('quiz-de-sample')}
              style={{
                padding: '12px 22px',
                borderRadius: '14px',
                background: 'var(--surface-1, #ffffff)',
                color: 'var(--text-1, #0f172a)',
                fontSize: '0.9rem',
                fontWeight: 800,
                border: '1.5px solid var(--border-1, #cbd5e1)',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(0, 0, 0, 0.05)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease',
              }}
            >
              <Activity size={17} style={{ color: '#0d9488' }} />
              <span>Live Monitor Dashboard</span>
            </motion.button>
          </motion.div>
        </div>
      </motion.div>

      <section className="assessment-mini-summary" aria-label="Assessment summary">
        <div><CalendarDays size={16} /><strong>{completedSessions.length}</strong><span>Completed Sessions</span></div>
        <div><BookOpenCheck size={16} /><strong>{assessments.filter((a) => a.isAiGenerated).length}</strong><span>Quizzes Generated</span></div>
        <div><BarChart3 size={16} /><strong>{averageScore}%</strong><span>Average Quiz Score</span></div>
      </section>

      <section className="assessment-section-card recent-quizzes-section">
        <div className="assessment-section-heading">
          <div><h2>Recent Quizzes &amp; Live Assessments</h2><p>The latest generated quizzes, assigned candidate invitations, and live results.</p></div>
          {assessments.length > 5 && <button type="button" className="assessment-text-link">View All Assessments <ArrowRight size={14} /></button>}
        </div>
        <div className="recent-quiz-table-wrap">
          <table className="recent-quiz-table">
            <thead>
              <tr>
                <th>Quiz</th>
                <th>Session</th>
                <th>Participants</th>
                <th>Avg Score</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {recentQuizzes.map((quiz) => (
                <tr key={quiz.id}>
                  <td><strong>{quiz.name}</strong></td>
                  <td>{quiz.moduleName}</td>
                  <td>{quiz.totalParticipants}</td>
                  <td>{quiz.averageScore !== undefined ? `${quiz.averageScore}%` : '—'}</td>
                  <td><span className={`quiz-status ${quiz.status.toLowerCase().replace(' ', '-')}`}>{quiz.status}</span></td>
                  <td style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    <button
                      className="assessment-text-link"
                      type="button"
                      onClick={() => handleStartQuizAndSendInvite(quiz)}
                      title="Start quiz and send candidate invite link"
                      style={{ color: '#0d9488', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                    >
                      Start <ArrowRight size={13} />
                    </button>
                    <button
                      className="assessment-text-link"
                      type="button"
                      onClick={() => handleOpenLiveDashboard(quiz.id)}
                      title="Open live assessment dashboard"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                    >
                      Live Dashboard <ArrowRight size={13} />
                    </button>
                  </td>
                </tr>
              ))}
              {!recentQuizzes.length && (
                <tr>
                  <td colSpan={6} className="assessment-table-empty">
                    Generated quizzes will appear here.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* GENERATOR MODAL */}
      <AnimatePresence>
        {selectedSession && (
          <div className="assessment-modal-backdrop" onMouseDown={closeGenerator}>
            <motion.div
              className="assessment-generator-modal"
              initial={{ opacity: 0, scale: 0.97, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              onMouseDown={(event) => event.stopPropagation()}
            >
              <div className="generator-modal-header"><div><span>AI QUIZ GENERATOR</span><h2>Generate Quiz</h2></div><button type="button" onClick={closeGenerator} aria-label="Close"><X size={18} /></button></div>
              <div className="generator-session-summary"><strong>{selectedSession.title}</strong><span>{selectedSession.eventType} · {selectedSession.trainerName || 'Assigned Trainer'} · {selectedSession.learningTrack || 'Shared'} · {selectedSession.attendedCount || selectedSession.totalEnrolled} participants</span></div>
              <div className="generator-form"><label><span>Topic</span><small>What should the quiz cover?</small><input value={topic} onChange={(event) => setTopic(event.target.value)} placeholder="Enter any training topic" autoFocus /></label>
                <fieldset><legend>Number of Questions</legend><div className="generator-choice-row">{[5, 10, 15, 20].map((count) => <button type="button" key={count} className={questionCount === count ? 'active' : ''} onClick={() => setQuestionCount(count)}>{count}</button>)}</div></fieldset>
                <fieldset><legend>Difficulty</legend><div className="generator-choice-row difficulty">{(['Beginner', 'Intermediate', 'Advanced'] as Difficulty[]).map((level) => <button type="button" key={level} className={difficulty === level ? 'active' : ''} onClick={() => setDifficulty(level)}>{level}</button>)}</div></fieldset>
              </div>
              <div className="generator-modal-footer"><button type="button" className="assessment-btn secondary" onClick={closeGenerator}>Cancel</button><button type="button" className="assessment-btn primary" onClick={generateQuiz} disabled={!topic.trim() || isGenerating}>{isGenerating ? <><span className="ai-loading-dot" /> Generating Quiz…</> : <><Sparkles size={16} /> Generate Quiz</>}</button></div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AIQuizPreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        quizResult={generatedQuiz}
        payload={generatedPayload}
        onSaveAsAssessment={handleSaveAsAssessment}
        onStartLiveQuiz={(quiz) => {
          setGeneratedQuiz(quiz);
          setShowPreview(false);
          setShowLiveHost(true);
        }}
      />

      <LiveQuizHostView
        isOpen={showLiveHost}
        onClose={() => setShowLiveHost(false)}
        quizResult={generatedQuiz}
        onSaveAssessmentResults={(summary) => {
          if (generatedQuiz) {
            createAIGeneratedAssessment(generatedQuiz, 'Completed', 'LIVE_QUIZ', {
              id: summary.sessionId,
              joinCode: '482913',
              startedAt: summary.endedAt,
              endedAt: summary.endedAt,
              participantCount: summary.totalParticipants,
              averageScore: summary.averageScore,
              passRate: summary.passRate,
            });
          }
          setShowLiveHost(false);
        }}
        onOpenParticipantJoinModal={() => setShowJoin(true)}
      />

      <LiveQuizParticipantView isOpen={showJoin} onClose={() => setShowJoin(false)} initialJoinCode="482913" />

      {/* CANDIDATE SELECTION & INVITATION MODAL */}
      <QuizPublishAssignModal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        assessment={activeAssessmentForAssign}
        onInvitationsSent={() => {
          // Trigger toast / update UI
        }}
      />

      {/* LIVE L&D ADMIN DASHBOARD MODAL */}
      <LiveQuizAdminDashboardView
        isOpen={showDashboardModal}
        onClose={() => setShowDashboardModal(false)}
        quizId={activeQuizIdForDashboard}
      />
    </motion.main>
  );
};
