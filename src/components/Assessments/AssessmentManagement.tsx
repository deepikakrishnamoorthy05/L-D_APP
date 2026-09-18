import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight, BarChart3, BookOpenCheck, CalendarDays,
  Sparkles, X,
} from 'lucide-react';
import { useSessions } from '../../context/SessionContext';
import { useAssessments } from '../../context/AssessmentContext';
import { Session } from '../../types/session';
import { AIQuizGenerationPayload } from '../../types/assessment';
import { aiQuizService, GeneratedQuizResult } from '../../services/aiQuizService';
import { AIQuizPreviewModal } from './AIQuizPreviewModal';
import { LiveQuizHostView } from './LiveQuizHostView';
import { LiveQuizParticipantView } from './LiveQuizParticipantView';
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
  const [showPreview, setShowPreview] = useState(false);
  const [showLiveHost, setShowLiveHost] = useState(false);
  const [showJoin, setShowJoin] = useState(false);

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
            Generate AI-powered quizzes for completed L&amp;D sessions and track participant results.
          </motion.p>
        </div>

        {/* RIGHT SECTION: ACTION BUTTONS */}
        <div className="hero-section-right">
          <motion.div
            initial={{ opacity: 0, x: 14 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="flex flex-col gap-2 w-full"
          >
            <button
              type="button"
              className="assessment-btn primary hero-action-btn justify-center"
              onClick={() => openGenerator()}
              disabled={!completedSessions.length}
            >
              <Sparkles size={16} /> Generate Quiz
            </button>
          </motion.div>
        </div>
      </motion.div>

      <section className="assessment-mini-summary" aria-label="Assessment summary">
        <div><CalendarDays size={16} /><strong>{completedSessions.length}</strong><span>Completed Sessions</span></div>
        <div><BookOpenCheck size={16} /><strong>{assessments.filter((a) => a.isAiGenerated).length}</strong><span>Quizzes Generated</span></div>
        <div><BarChart3 size={16} /><strong>{averageScore}%</strong><span>Average Quiz Score</span></div>
      </section>

      <section className="assessment-section-card recent-quizzes-section">
        <div className="assessment-section-heading"><div><h2>Recent Quizzes</h2><p>The latest generated quizzes and results.</p></div>{assessments.length > 5 && <button type="button" className="assessment-text-link">View All Assessments <ArrowRight size={14} /></button>}</div>
        <div className="recent-quiz-table-wrap"><table className="recent-quiz-table"><thead><tr><th>Quiz</th><th>Session</th><th>Participants</th><th>Avg Score</th><th>Status</th><th>Action</th></tr></thead><tbody>
          {recentQuizzes.map((quiz) => <tr key={quiz.id}><td><strong>{quiz.name}</strong></td><td>{quiz.moduleName}</td><td>{quiz.totalParticipants}</td><td>{quiz.averageScore !== undefined ? `${quiz.averageScore}%` : '—'}</td><td><span className={`quiz-status ${quiz.status.toLowerCase().replace(' ', '-')}`}>{quiz.status}</span></td><td><button className="assessment-text-link" type="button">{quiz.status === 'Completed' || quiz.status === 'Published' ? 'Results' : 'Start'} <ArrowRight size={13} /></button></td></tr>)}
          {!recentQuizzes.length && <tr><td colSpan={6} className="assessment-table-empty">Generated quizzes will appear here.</td></tr>}
        </tbody></table></div>
      </section>

      <AnimatePresence>{selectedSession && <div className="assessment-modal-backdrop" onMouseDown={closeGenerator}><motion.div className="assessment-generator-modal" initial={{ opacity: 0, scale: 0.97, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98 }} onMouseDown={(event) => event.stopPropagation()}>
        <div className="generator-modal-header"><div><span>AI QUIZ GENERATOR</span><h2>Generate Quiz</h2></div><button type="button" onClick={closeGenerator} aria-label="Close"><X size={18} /></button></div>
        <div className="generator-session-summary"><strong>{selectedSession.title}</strong><span>{selectedSession.eventType} · {selectedSession.trainerName || 'Assigned Trainer'} · {selectedSession.learningTrack || 'Shared'} · {selectedSession.attendedCount || selectedSession.totalEnrolled} participants</span></div>
        <div className="generator-form"><label><span>Topic</span><small>What should the quiz cover?</small><input value={topic} onChange={(event) => setTopic(event.target.value)} placeholder="Enter any training topic" autoFocus /></label>
          <fieldset><legend>Number of Questions</legend><div className="generator-choice-row">{[5, 10, 15, 20].map((count) => <button type="button" key={count} className={questionCount === count ? 'active' : ''} onClick={() => setQuestionCount(count)}>{count}</button>)}</div></fieldset>
          <fieldset><legend>Difficulty</legend><div className="generator-choice-row difficulty">{(['Beginner', 'Intermediate', 'Advanced'] as Difficulty[]).map((level) => <button type="button" key={level} className={difficulty === level ? 'active' : ''} onClick={() => setDifficulty(level)}>{level}</button>)}</div></fieldset>
        </div>
        <div className="generator-modal-footer"><button type="button" className="assessment-btn secondary" onClick={closeGenerator}>Cancel</button><button type="button" className="assessment-btn primary" onClick={generateQuiz} disabled={!topic.trim() || isGenerating}>{isGenerating ? <><span className="ai-loading-dot" /> Generating Quiz…</> : <><Sparkles size={16} /> Generate Quiz</>}</button></div>
      </motion.div></div>}</AnimatePresence>

      <AIQuizPreviewModal isOpen={showPreview} onClose={() => setShowPreview(false)} quizResult={generatedQuiz} payload={generatedPayload} onSaveAsAssessment={(quiz, status) => { createAIGeneratedAssessment(quiz, status, 'LD_ASSESSMENT'); setShowPreview(false); }} onStartLiveQuiz={(quiz) => { setGeneratedQuiz(quiz); setShowPreview(false); setShowLiveHost(true); }} />
      <LiveQuizHostView isOpen={showLiveHost} onClose={() => setShowLiveHost(false)} quizResult={generatedQuiz} onSaveAssessmentResults={(summary) => { if (generatedQuiz) createAIGeneratedAssessment(generatedQuiz, 'Completed', 'LIVE_QUIZ', { id: summary.sessionId, joinCode: '482913', startedAt: summary.endedAt, endedAt: summary.endedAt, participantCount: summary.totalParticipants, averageScore: summary.averageScore, passRate: summary.passRate }); setShowLiveHost(false); }} onOpenParticipantJoinModal={() => setShowJoin(true)} />
      <LiveQuizParticipantView isOpen={showJoin} onClose={() => setShowJoin(false)} initialJoinCode="482913" />
    </motion.main>
  );
};
