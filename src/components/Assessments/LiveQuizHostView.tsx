import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Play,
  Pause,
  SkipForward,
  CheckCircle2,
  Trophy,
  Award,
  Clock,
  Zap,
  BarChart2,
  X,
  Copy,
  Check,
  ArrowRight,
  ShieldCheck,
  Save,
  RotateCcw,
  UserPlus,
  ChevronDown,
  Search,
  CheckSquare,
  Square,
  Trash2,
} from 'lucide-react';
import { QuizQuestion } from '../../types/assessment';
import { GeneratedQuizResult } from '../../services/aiQuizService';
import { nativeQuizService, NativeQuizParticipant, NativeQuizSessionSummary } from '../../services/nativeQuizService';
import { useTrainees } from '../../context/TraineeContext';

interface LiveQuizHostViewProps {
  isOpen: boolean;
  onClose: () => void;
  quizResult: GeneratedQuizResult | null;
  onSaveAssessmentResults: (summary: NativeQuizSessionSummary) => void;
  onOpenParticipantJoinModal?: () => void;
}

const nowIso = new Date().toISOString();

function formatTimeMs(ms?: number): string {
  if (!ms || ms <= 0) return '00:00';
  const totalSec = Math.floor(ms / 1000);
  const mins = Math.floor(totalSec / 60);
  const secs = totalSec % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

const checkTieBreakerWon = (p: NativeQuizParticipant, idx: number, sortedList: NativeQuizParticipant[]): boolean => {
  if (p.isTieBreakerWon) return true;
  if (p.tieBreakerReason === 'Faster completion') return true;

  const currentScore = p.correctAnswersCount ?? p.score ?? 0;
  const sameScoreList = sortedList.filter(
    (item) => (item.correctAnswersCount ?? item.score ?? 0) === currentScore
  );

  if (sameScoreList.length > 1) {
    const lowerRankedTied = sortedList
      .slice(idx + 1)
      .find((item) => (item.correctAnswersCount ?? item.score ?? 0) === currentScore);
    if (lowerRankedTied && (p.totalTimeMs ?? 0) < (lowerRankedTied.totalTimeMs ?? 0)) {
      return true;
    }
  }
  return false;
};

const DEMO_PARTICIPANTS: NativeQuizParticipant[] = [
  { id: 'p1', employeeId: 'EMP-1001', employeeName: 'Swetha Ramakrishnan', score: 8, correctAnswersCount: 8, totalQuestions: 10, totalTimeMs: 9000, formattedTime: '00:09', joinedAt: nowIso, isTieBreakerWon: true, tieBreakerReason: 'Faster completion' },
  { id: 'p2', employeeId: 'EMP-1002', employeeName: 'Deepika Mookan', score: 8, correctAnswersCount: 8, totalQuestions: 10, totalTimeMs: 60000, formattedTime: '01:00', joinedAt: nowIso },
  { id: 'p3', employeeId: 'EMP-1003', employeeName: 'Mohit Sharma', score: 7, correctAnswersCount: 7, totalQuestions: 10, totalTimeMs: 18000, formattedTime: '00:18', joinedAt: nowIso },
  { id: 'p4', employeeId: 'EMP-1004', employeeName: 'Janani Venkatesh', score: 7, correctAnswersCount: 7, totalQuestions: 10, totalTimeMs: 25000, formattedTime: '00:25', joinedAt: nowIso },
  { id: 'p5', employeeId: 'EMP-1005', employeeName: 'Manoj Kumar', score: 6, correctAnswersCount: 6, totalQuestions: 10, totalTimeMs: 30000, formattedTime: '00:30', joinedAt: nowIso },
  { id: 'p6', employeeId: 'EMP-1006', employeeName: 'Ananya Roy', score: 6, correctAnswersCount: 6, totalQuestions: 10, totalTimeMs: 35000, formattedTime: '00:35', joinedAt: nowIso },
  { id: 'p7', employeeId: 'EMP-1007', employeeName: 'Karthik Raja', score: 5, correctAnswersCount: 5, totalQuestions: 10, totalTimeMs: 40000, formattedTime: '00:40', joinedAt: nowIso },
  { id: 'p8', employeeId: 'EMP-1008', employeeName: 'Priya Sundaram', score: 4, correctAnswersCount: 4, totalQuestions: 10, totalTimeMs: 45000, formattedTime: '00:45', joinedAt: nowIso },
];

export const LiveQuizHostView: React.FC<LiveQuizHostViewProps> = ({
  isOpen,
  onClose,
  quizResult,
  onSaveAssessmentResults,
  onOpenParticipantJoinModal,
}) => {
  if (!isOpen || !quizResult) return null;

  const questions: QuizQuestion[] = quizResult.questions || [];
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Host Screen View State: 'lobby' | 'question' | 'reveal' | 'leaderboard' | 'summary'
  const [viewState, setViewState] = useState<'lobby' | 'question' | 'reveal' | 'leaderboard' | 'summary'>('lobby');

  const [joinCode, setJoinCode] = useState<string>('482913');
  const [sessionId, setSessionId] = useState<string>('');
  const [participants, setParticipants] = useState<NativeQuizParticipant[]>(DEMO_PARTICIPANTS);

  const { trainees } = useTrainees();

  // Candidate selection states & refs
  const [isCandidateDropdownOpen, setIsCandidateDropdownOpen] = useState(false);
  const [candidateSearchQuery, setCandidateSearchQuery] = useState('');
  const candidateDropdownRef = useRef<HTMLDivElement>(null);

  // Unified candidate pool combining DEMO_PARTICIPANTS + TraineeContext
  const candidatePool: NativeQuizParticipant[] = useMemo(() => {
    const map = new Map<string, NativeQuizParticipant>();

    // 1. Add default demo participants
    DEMO_PARTICIPANTS.forEach((p) => {
      map.set(p.employeeId, p);
    });

    // 2. Add trainees from TraineeContext if available
    if (trainees && trainees.length > 0) {
      trainees.forEach((t) => {
        const empId = t.employeeId || `EMP-${t.id}`;
        if (!map.has(empId)) {
          map.set(empId, {
            id: t.id || empId,
            employeeId: empId,
            employeeName: t.name,
            score: 0,
            correctAnswersCount: 0,
            totalQuestions: questions.length || 10,
            totalTimeMs: 0,
            formattedTime: '00:00',
            joinedAt: new Date().toISOString(),
          });
        }
      });
    }

    return Array.from(map.values());
  }, [trainees, questions.length]);

  // Click outside listener for candidate dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (candidateDropdownRef.current && !candidateDropdownRef.current.contains(event.target as Node)) {
        setIsCandidateDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleCandidate = (candidate: NativeQuizParticipant) => {
    setParticipants((prev) => {
      const exists = prev.some((p) => p.employeeId === candidate.employeeId);
      if (exists) {
        return prev.filter((p) => p.employeeId !== candidate.employeeId);
      } else {
        return [...prev, candidate];
      }
    });
  };

  const handleSelectAllCandidates = () => {
    setParticipants(candidatePool);
  };

  const handleDeselectAllCandidates = () => {
    setParticipants([]);
  };

  const handleRemoveCandidate = (employeeId: string) => {
    setParticipants((prev) => prev.filter((p) => p.employeeId !== employeeId));
  };

  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  // Timer state
  const [timeLeft, setTimeLeft] = useState(30);
  const [isPaused, setIsPaused] = useState(false);

  // Response count & distribution
  const [responseCount, setResponseCount] = useState(0);
  const [distribution, setDistribution] = useState<{ [key: string]: number }>({ A: 0, B: 0, C: 0, D: 0 });

  const currentQ: QuizQuestion | undefined = questions[currentQuestionIndex];

  // Initialize Session
  useEffect(() => {
    if (isOpen) {
      setViewState('lobby');
      setCurrentQuestionIndex(0);
      setResponseCount(0);
      setTimeLeft(30);
      setIsPaused(false);

      nativeQuizService.startLiveSession(`quiz-${Date.now()}`, quizResult).then((session) => {
        setSessionId(session.id);
        if (session.joinCode) setJoinCode(session.joinCode);
      });
    }
  }, [isOpen, quizResult]);

  // Connect WebSockets
  useEffect(() => {
    if (!isOpen) return;

    const socket = nativeQuizService.getSocket();

    const handleParticipantJoined = (data: any) => {
      if (data.participants) {
        setParticipants(data.participants);
      }
    };

    const handleResponseCount = (data: any) => {
      setResponseCount(data.responseCount || 0);
    };

    socket.on('quiz:participant-joined', handleParticipantJoined);
    socket.on('quiz:response-count', handleResponseCount);

    return () => {
      socket.off('quiz:participant-joined', handleParticipantJoined);
      socket.off('quiz:response-count', handleResponseCount);
    };
  }, [isOpen]);

  // Countdown timer logic
  useEffect(() => {
    let timer: any;
    if (viewState === 'question' && !isPaused && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (viewState === 'question' && timeLeft === 0) {
      handleAutoReveal();
    }
    return () => clearInterval(timer);
  }, [viewState, isPaused, timeLeft]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(joinCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyUrl = () => {
    const url = `${window.location.origin}/quiz/join?code=${joinCode}`;
    navigator.clipboard.writeText(url);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleStartQuiz = () => {
    setViewState('question');
    setCurrentQuestionIndex(0);
    setTimeLeft(currentQ?.timeLimit || 30);
    setResponseCount(Math.min(participants.length, Math.floor(participants.length * 0.85)));

    const socket = nativeQuizService.getSocket();
    socket.emit('quiz:start', { sessionId });
  };

  const handleAutoReveal = () => {
    setViewState('reveal');

    // Simulate realistic distribution
    const total = Math.max(1, participants.length);
    const correctIdx = currentQ?.options?.findIndex((opt) => opt === currentQ.correctAnswer) ?? 1;
    const dist = { A: 1, B: 1, C: 1, D: 1 };
    const key = String.fromCharCode(65 + Math.max(0, correctIdx)) as 'A' | 'B' | 'C' | 'D';
    dist[key] = Math.max(4, total - 3);
    setDistribution(dist);

    // Update demo participant scores strictly based on correct answers (no speed bonus addition)
    setParticipants((prev) =>
      prev.map((p, idx) => {
        const isCorrect = idx % 4 !== 3;
        const addCorrect = isCorrect ? 1 : 0;
        const addTimeMs = Math.floor(Math.random() * 3000) + 1000;
        const newCorrect = (p.correctAnswersCount ?? p.score) + addCorrect;
        const newTimeMs = (p.totalTimeMs ?? 0) + addTimeMs;

        return {
          ...p,
          score: newCorrect,
          correctAnswersCount: newCorrect,
          totalQuestions: questions.length || 10,
          totalTimeMs: newTimeMs,
          formattedTime: formatTimeMs(newTimeMs),
        };
      })
    );

    const socket = nativeQuizService.getSocket();
    socket.emit('quiz:reveal-answer', { sessionId, questionId: currentQ?.id });
  };

  const handleShowLeaderboard = () => {
    setViewState('leaderboard');
    const socket = nativeQuizService.getSocket();
    socket.emit('quiz:leaderboard', { sessionId });
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex + 1 < questions.length) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setViewState('question');
      setTimeLeft(questions[currentQuestionIndex + 1]?.timeLimit || 30);
      setResponseCount(Math.min(participants.length, Math.floor(participants.length * 0.9)));

      const socket = nativeQuizService.getSocket();
      socket.emit('quiz:next-question', { sessionId });
    } else {
      handleFinishQuiz();
    }
  };

  const handleFinishQuiz = () => {
    setViewState('summary');
    const socket = nativeQuizService.getSocket();
    socket.emit('quiz:end', { sessionId });
  };

  const sortedLeaderboard = [...participants].sort((a, b) => {
    const aScore = a.correctAnswersCount ?? a.score ?? 0;
    const bScore = b.correctAnswersCount ?? b.score ?? 0;
    if (bScore !== aScore) return bScore - aScore;

    const aTime = a.totalTimeMs ?? 0;
    const bTime = b.totalTimeMs ?? 0;
    if (aTime !== bTime) return aTime - bTime;

    return (a.completedAt || a.joinedAt || '').localeCompare(b.completedAt || b.joinedAt || '');
  });

  const handleSaveAndClose = () => {
    const summary: NativeQuizSessionSummary = {
      sessionId,
      quizTitle: quizResult.title,
      topic: quizResult.topic,
      totalParticipants: participants.length,
      averageScore: 78,
      passRate: 83,
      topScore: sortedLeaderboard[0]?.correctAnswersCount ?? sortedLeaderboard[0]?.score ?? 8,
      leaderboard: sortedLeaderboard.map((p, idx) => {
        const correctCount = p.correctAnswersCount ?? p.score ?? 0;
        const totalQ = p.totalQuestions ?? questions.length ?? 10;
        const percentage = Math.round((correctCount / Math.max(1, totalQ)) * 100);
        const tieBreaker = checkTieBreakerWon(p, idx, sortedLeaderboard);
        return {
          participantId: p.id,
          employeeId: p.employeeId,
          employeeName: p.employeeName,
          totalScore: correctCount,
          correctAnswersCount: correctCount,
          totalQuestions: totalQ,
          totalTimeMs: p.totalTimeMs,
          formattedTime: p.formattedTime || formatTimeMs(p.totalTimeMs),
          percentage,
          rank: idx + 1,
          status: percentage >= 60 ? 'Pass' : 'Fail',
          isTieBreakerWon: tieBreaker,
          tieBreakerReason: tieBreaker ? 'Faster completion' : undefined,
        };
      }),
      endedAt: new Date().toISOString(),
    };

    onSaveAssessmentResults(summary);
    onClose();
  };

  return (
    <div className="ai-quiz-modal-backdrop" style={{ background: 'rgba(9, 13, 20, 0.92)', backdropFilter: 'blur(12px)' }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.25 }}
        className="ai-quiz-modal-card"
        style={{ maxWidth: '1100px', height: '90vh', maxHeight: '850px', display: 'flex', flexDirection: 'column' }}
      >
        {/* TOP BAR */}
        <div
          style={{
            padding: '16px 24px',
            borderBottom: '1px solid var(--border-1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--surface-1)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #0d9488, #4f46e5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                boxShadow: '0 0 16px rgba(13, 148, 136, 0.4)',
              }}
            >
              <Zap size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', color: '#0d9488' }}>
                Systech Native Live Quiz Host
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-1)', margin: 0 }}>
                {quizResult.title}
              </h3>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {onOpenParticipantJoinModal && (
              <button
                type="button"
                onClick={onOpenParticipantJoinModal}
                className="ai-quiz-btn-secondary"
                style={{ padding: '6px 14px', fontSize: '0.78rem', color: '#4f46e5', borderColor: 'rgba(79, 70, 229, 0.3)' }}
              >
                Open Participant Mobile View
              </button>
            )}

            <button type="button" onClick={onClose} className="close-btn">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* MAIN DISPLAY AREA */}
        <div style={{ flex: 1, padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          {/* VIEW 1: LOBBY SCREEN */}
          {viewState === 'lobby' && (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between', gap: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                {/* JOIN CODE CARD */}
                <div
                  style={{
                    padding: '24px',
                    borderRadius: '20px',
                    background: 'linear-gradient(135deg, rgba(13, 148, 136, 0.12), rgba(79, 70, 229, 0.12))',
                    border: '1.5px solid rgba(13, 148, 136, 0.3)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    gap: '12px',
                  }}
                >
                  <span style={{ fontSize: '0.82rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', color: '#0d9488' }}>
                    Join Live Session Code
                  </span>
                  <div style={{ fontSize: '3.6rem', fontWeight: 900, letterSpacing: '8px', color: 'var(--text-1)', textShadow: '0 0 20px rgba(13, 148, 136, 0.3)' }}>
                    {joinCode}
                  </div>
                  <div style={{ display: 'flex', gap: '8px', width: '100%', maxWidth: '320px' }}>
                    <button
                      type="button"
                      onClick={handleCopyCode}
                      className="ai-quiz-btn-secondary"
                      style={{ flex: 1, justifyContent: 'center', fontSize: '0.8rem', gap: '6px' }}
                    >
                      {copiedCode ? <Check size={14} style={{ color: '#10b981' }} /> : <Copy size={14} />}
                      {copiedCode ? 'Copied Code!' : 'Copy Code'}
                    </button>
                    <button
                      type="button"
                      onClick={handleCopyUrl}
                      className="ai-quiz-btn-secondary"
                      style={{ flex: 1, justifyContent: 'center', fontSize: '0.8rem', gap: '6px' }}
                    >
                      {copiedUrl ? <Check size={14} style={{ color: '#10b981' }} /> : <Copy size={14} />}
                      {copiedUrl ? 'Copied Link!' : 'Copy Join Link'}
                    </button>
                  </div>
                </div>

                {/* QUIZ INFO & COUNT CARD */}
                <div
                  style={{
                    padding: '24px',
                    borderRadius: '20px',
                    background: 'var(--surface-2)',
                    border: '1px solid var(--border-1)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <span className="badge-tag" style={{ background: 'rgba(13, 148, 136, 0.15)', color: '#0d9488', marginBottom: '8px' }}>
                      {quizResult.difficulty} Level
                    </span>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--text-1)', margin: '4px 0 8px 0' }}>
                      {quizResult.topic}
                    </h2>
                    <p style={{ fontSize: '0.86rem', color: 'var(--text-2)', margin: 0 }}>
                      {questions.length} Questions • Multiple Choice Format • Real-time Scoring
                    </p>
                  </div>

                  <div style={{ padding: '16px', borderRadius: '14px', background: 'var(--surface-1)', border: '1px solid var(--border-1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Users size={22} style={{ color: '#0d9488' }} />
                      <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-2)', fontWeight: 700 }}>PARTICIPANTS JOINED</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--text-1)' }}>{participants.length} Trainees</div>
                      </div>
                    </div>
                    <span style={{ padding: '4px 10px', borderRadius: '20px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', fontSize: '0.75rem', fontWeight: 800 }}>
                      Ready to Start
                    </span>
                  </div>
                </div>
              </div>

              {/* PARTICIPANT CARDS GRID & CANDIDATE SELECTOR */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-2)', margin: 0 }}>
                      Joined Trainees ({participants.length})
                    </h4>
                    <span style={{ fontSize: '0.75rem', padding: '3px 10px', borderRadius: '12px', background: 'rgba(13, 148, 136, 0.15)', color: '#0d9488', fontWeight: 700 }}>
                      {participants.length} of {candidatePool.length} Selected
                    </span>
                  </div>

                  {/* CANDIDATE SELECTION CONTROLS */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', position: 'relative' }} ref={candidateDropdownRef}>
                    {/* MULTI-SELECT DROPDOWN TRIGGER BUTTON */}
                    <button
                      type="button"
                      onClick={() => setIsCandidateDropdownOpen(!isCandidateDropdownOpen)}
                      className="ai-quiz-btn-secondary"
                      style={{
                        padding: '8px 14px',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        background: isCandidateDropdownOpen ? 'rgba(13, 148, 136, 0.2)' : 'var(--surface-2)',
                        border: '1.5px solid #0d9488',
                        color: '#0d9488',
                      }}
                    >
                      <UserPlus size={15} />
                      Select Candidates
                      <ChevronDown size={14} style={{ transform: isCandidateDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
                    </button>

                    {/* MULTI-SELECT POPOVER DROPDOWN MENU */}
                    {isCandidateDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                        transition={{ duration: 0.15 }}
                        style={{
                          position: 'absolute',
                          top: 'calc(100% + 8px)',
                          right: 0,
                          width: '320px',
                          maxHeight: '380px',
                          background: 'var(--surface-2, #1e293b)',
                          border: '1px solid var(--border-1, #334155)',
                          borderRadius: '14px',
                          boxShadow: '0 12px 32px rgba(0, 0, 0, 0.35)',
                          zIndex: 999,
                          display: 'flex',
                          flexDirection: 'column',
                          overflow: 'hidden',
                        }}
                      >
                        {/* SEARCH & ACTION HEADER */}
                        <div style={{ padding: '12px', borderBottom: '1px solid var(--border-1)', display: 'flex', flexDirection: 'column', gap: '8px', background: 'var(--surface-1)' }}>
                          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                            <Search size={14} style={{ position: 'absolute', left: '10px', color: 'var(--text-3)' }} />
                            <input
                              type="text"
                              value={candidateSearchQuery}
                              onChange={(e) => setCandidateSearchQuery(e.target.value)}
                              placeholder="Search candidate name or ID..."
                              style={{
                                width: '100%',
                                padding: '6px 10px 6px 30px',
                                borderRadius: '8px',
                                background: 'var(--surface-2)',
                                border: '1px solid var(--border-1)',
                                color: 'var(--text-1)',
                                fontSize: '0.8rem',
                                outline: 'none',
                              }}
                            />
                            {candidateSearchQuery && (
                              <button
                                type="button"
                                onClick={() => setCandidateSearchQuery('')}
                                style={{ position: 'absolute', right: '8px', background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', padding: 0 }}
                              >
                                <X size={12} />
                              </button>
                            )}
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <button
                              type="button"
                              onClick={handleSelectAllCandidates}
                              style={{ background: 'none', border: 'none', color: '#0d9488', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', padding: '2px 4px' }}
                            >
                              ✓ Select All ({candidatePool.length})
                            </button>
                            <button
                              type="button"
                              onClick={handleDeselectAllCandidates}
                              style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', padding: '2px 4px' }}
                            >
                              ✕ Clear All
                            </button>
                          </div>
                        </div>

                        {/* CANDIDATES LIST */}
                        <div style={{ overflowY: 'auto', flex: 1, padding: '6px 0' }}>
                          {candidatePool
                            .filter(
                              (c) =>
                                c.employeeName.toLowerCase().includes(candidateSearchQuery.toLowerCase()) ||
                                c.employeeId.toLowerCase().includes(candidateSearchQuery.toLowerCase())
                            )
                            .map((c) => {
                              const isSelected = participants.some((p) => p.employeeId === c.employeeId);
                              return (
                                <div
                                  key={c.employeeId}
                                  onClick={() => toggleCandidate(c)}
                                  style={{
                                    padding: '8px 14px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    cursor: 'pointer',
                                    background: isSelected ? 'rgba(13, 148, 136, 0.12)' : 'transparent',
                                    transition: 'background 0.15s',
                                  }}
                                >
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => {}} // Handled by outer div click
                                    style={{ cursor: 'pointer', accentColor: '#0d9488', width: '16px', height: '16px' }}
                                  />
                                  <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: isSelected ? '#0d9488' : 'var(--border-1)', color: '#fff', fontSize: '0.7rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {c.employeeName.charAt(0)}
                                  </div>
                                  <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: '0.8rem', fontWeight: isSelected ? 700 : 500, color: 'var(--text-1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                      {c.employeeName}
                                    </div>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-3)' }}>{c.employeeId}</div>
                                  </div>
                                </div>
                              );
                            })}
                          {candidatePool.filter(
                            (c) =>
                              c.employeeName.toLowerCase().includes(candidateSearchQuery.toLowerCase()) ||
                              c.employeeId.toLowerCase().includes(candidateSearchQuery.toLowerCase())
                          ).length === 0 && (
                            <div style={{ padding: '16px', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-3)' }}>
                              No candidates match your search
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>

                {/* SELECTED CANDIDATES GRID */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '10px' }}>
                  <AnimatePresence>
                    {participants.map((p) => (
                      <motion.div
                        key={p.id || p.employeeId}
                        initial={{ opacity: 0, scale: 0.85 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.85 }}
                        transition={{ duration: 0.2 }}
                        style={{
                          padding: '10px 14px',
                          borderRadius: '12px',
                          background: 'var(--surface-2)',
                          border: '1px solid var(--border-1)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                        }}
                      >
                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#0d9488', color: '#fff', fontSize: '0.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {p.employeeName.charAt(0)}
                        </div>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {p.employeeName}
                          </div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-3)' }}>{p.employeeId}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveCandidate(p.employeeId)}
                          title="Remove candidate"
                          style={{
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: 'none',
                            color: '#ef4444',
                            cursor: 'pointer',
                            padding: '4px',
                            borderRadius: '6px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <X size={13} />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
                {participants.length === 0 && (
                  <div style={{ padding: '24px', textAlign: 'center', borderRadius: '12px', background: 'var(--surface-2)', border: '1px dashed var(--border-1)', color: 'var(--text-3)', fontSize: '0.85rem' }}>
                    No candidates selected for this quiz. Use the <strong>Select Candidates</strong> dropdown above to add participants.
                  </div>
                )}
              </div>

              {/* LOBBY FOOTER ACTION */}
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={handleStartQuiz}
                  className="ai-quiz-btn-primary"
                  style={{ padding: '14px 32px', fontSize: '1rem', fontWeight: 900, background: 'linear-gradient(135deg, #0d9488, #4f46e5)', boxShadow: '0 4px 20px rgba(13, 148, 136, 0.4)' }}
                >
                  <Play size={18} /> Start Live Quiz →
                </motion.button>
              </div>
            </div>
          )}

          {/* VIEW 2: LIVE QUESTION SCREEN */}
          {viewState === 'question' && currentQ && (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between', gap: '20px' }}>
              {/* QUESTION STATUS BAR */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className="badge-tag" style={{ background: 'rgba(79, 70, 229, 0.15)', color: '#4f46e5', fontSize: '0.85rem', fontWeight: 800 }}>
                  Question {currentQuestionIndex + 1} of {questions.length}
                </span>

                {/* CIRCULAR TIMER */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      background: timeLeft <= 5 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(13, 148, 136, 0.15)',
                      border: `2px solid ${timeLeft <= 5 ? '#ef4444' : '#0d9488'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.1rem',
                      fontWeight: 900,
                      color: timeLeft <= 5 ? '#ef4444' : '#0d9488',
                    }}
                  >
                    {timeLeft}
                  </div>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-2)' }}>Seconds Remaining</span>
                </div>
              </div>

              {/* QUESTION TEXT */}
              <div style={{ padding: '24px', borderRadius: '16px', background: 'var(--surface-2)', border: '1px solid var(--border-1)' }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-1)', margin: 0, lineHeight: 1.4 }}>
                  {currentQ.question}
                </h2>
              </div>

              {/* OPTIONS GRID */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
                {currentQ.options?.map((opt, idx) => {
                  const label = String.fromCharCode(65 + idx);
                  return (
                    <div
                      key={idx}
                      style={{
                        padding: '16px 20px',
                        borderRadius: '14px',
                        background: 'var(--surface-2)',
                        border: '1.5px solid var(--border-1)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                      }}
                    >
                      <span style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--surface-1)', color: 'var(--text-1)', fontSize: '0.9rem', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {label}
                      </span>
                      <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-1)' }}>{opt}</span>
                    </div>
                  );
                })}
              </div>

              {/* LIVE RESPONSE COUNT BAR */}
              <div style={{ padding: '16px 20px', borderRadius: '14px', background: 'var(--surface-2)', border: '1px solid var(--border-1)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-1)' }}>
                  <span>LIVE RESPONSES</span>
                  <span style={{ color: '#0d9488' }}>
                    {responseCount} / {participants.length} Submitted
                  </span>
                </div>
                <div style={{ height: '8px', background: 'var(--surface-1)', borderRadius: '10px', overflow: 'hidden' }}>
                  <motion.div
                    style={{ height: '100%', background: 'linear-gradient(90deg, #0d9488, #4f46e5)', borderRadius: '10px' }}
                    animate={{ width: `${(responseCount / Math.max(1, participants.length)) * 100}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>

              {/* HOST CONTROLS BAR */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setIsPaused(!isPaused)}
                  className="ai-quiz-btn-secondary"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  {isPaused ? <Play size={16} /> : <Pause size={16} />}
                  {isPaused ? 'Resume Timer' : 'Pause Timer'}
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={handleAutoReveal}
                    className="ai-quiz-btn-secondary"
                    style={{ color: '#f59e0b', borderColor: 'rgba(245, 158, 11, 0.3)' }}
                  >
                    <SkipForward size={16} /> Skip Question
                  </button>

                  <button
                    type="button"
                    onClick={handleAutoReveal}
                    className="ai-quiz-btn-primary"
                    style={{ background: '#0d9488' }}
                  >
                    <CheckCircle2 size={16} /> Reveal Answer
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 3: ANSWER REVEAL SCREEN */}
          {viewState === 'reveal' && currentQ && (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between', gap: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className="badge-tag" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', fontSize: '0.85rem', fontWeight: 800 }}>
                  Answer Revealed
                </span>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-2)' }}>
                  Question {currentQuestionIndex + 1} of {questions.length}
                </span>
              </div>

              {/* CORRECT ANSWER BANNER */}
              <div style={{ padding: '20px', borderRadius: '16px', background: 'rgba(16, 185, 129, 0.1)', border: '1.5px solid #10b981', display: 'flex', alignItems: 'center', gap: '14px' }}>
                <CheckCircle2 size={28} style={{ color: '#10b981' }} />
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: '#10b981' }}>CORRECT ANSWER</div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--text-1)', marginTop: '2px' }}>
                    {currentQ.correctAnswer}
                  </div>
                </div>
              </div>

              {/* DISTRIBUTION BAR CHART */}
              <div style={{ padding: '20px', borderRadius: '16px', background: 'var(--surface-2)', border: '1px solid var(--border-1)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-2)' }}>
                  RESPONSE DISTRIBUTION
                </span>
                {currentQ.options?.map((opt, idx) => {
                  const label = String.fromCharCode(65 + idx) as 'A' | 'B' | 'C' | 'D';
                  const count = distribution[label] || 0;
                  const isCorrect = opt === currentQ.correctAnswer;
                  const percentage = Math.round((count / Math.max(1, participants.length)) * 100);

                  return (
                    <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-1)' }}>
                        <span>
                          {label}. {opt} {isCorrect && <span style={{ color: '#10b981', fontWeight: 800 }}>✓ Correct</span>}
                        </span>
                        <span>{count} votes ({percentage}%)</span>
                      </div>
                      <div style={{ height: '10px', background: 'var(--surface-1)', borderRadius: '10px', overflow: 'hidden' }}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 0.5 }}
                          style={{
                            height: '100%',
                            background: isCorrect ? '#10b981' : 'rgba(255,255,255,0.2)',
                            borderRadius: '10px',
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* EXPLANATION */}
              <div style={{ padding: '16px', borderRadius: '14px', background: 'rgba(13, 148, 136, 0.08)', border: '1px solid rgba(13, 148, 136, 0.2)', fontSize: '0.82rem', color: 'var(--text-1)' }}>
                <span style={{ fontWeight: 800, color: '#0d9488', textTransform: 'uppercase', fontSize: '0.72rem', display: 'block', marginBottom: '4px' }}>
                  Explanation:
                </span>
                <p style={{ margin: 0, lineHeight: 1.4 }}>{currentQ.explanation}</p>
              </div>

              {/* FOOTER ACTIONS */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={handleShowLeaderboard}
                  className="ai-quiz-btn-primary"
                  style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}
                >
                  <Trophy size={16} /> View Leaderboard →
                </button>
              </div>
            </div>
          )}

          {/* VIEW 4: LEADERBOARD SCREEN */}
          {viewState === 'leaderboard' && (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between', gap: '16px' }}>
              <div style={{ textAlign: 'center' }}>
                <span className="badge-tag" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', fontSize: '0.85rem', fontWeight: 800 }}>
                  <Trophy size={14} className="inline mr-1" /> Live Leaderboard
                </span>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--text-1)', margin: '6px 0 0 0' }}>
                  Top Performing Trainees
                </h2>
              </div>

              {/* SCOREBOARD TABLE HEADER */}
              <div style={{ display: 'grid', gridTemplateColumns: '60px 2.2fr 1fr 1fr 1.2fr', padding: '10px 16px', background: 'var(--surface-2)', borderRadius: '10px', fontSize: '0.74rem', fontWeight: 800, color: 'var(--text-3)', letterSpacing: '0.5px', border: '1px solid var(--border-1)' }}>
                <div>RANK</div>
                <div>PARTICIPANT</div>
                <div style={{ textAlign: 'center' }}>SCORE</div>
                <div style={{ textAlign: 'center' }}>ACCURACY</div>
                <div style={{ textAlign: 'right' }}>COMPLETION TIME</div>
              </div>

              {/* RANKED LIST */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, overflowY: 'auto' }}>
                <AnimatePresence>
                  {sortedLeaderboard.map((p, idx) => {
                    const isTop1 = idx === 0;
                    const isTop3 = idx < 3;
                    const correctCount = p.correctAnswersCount ?? p.score ?? 0;
                    const totalQ = p.totalQuestions ?? questions.length ?? 10;
                    const accuracy = Math.round((correctCount / Math.max(1, totalQ)) * 100);
                    const formattedTime = p.formattedTime || formatTimeMs(p.totalTimeMs);
                    const isTieWinner = checkTieBreakerWon(p, idx, sortedLeaderboard);

                    return (
                      <motion.div
                        key={p.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: idx * 0.04 }}
                        style={{
                          padding: '12px 16px',
                          borderRadius: '14px',
                          background: isTop1
                            ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(13, 148, 136, 0.15))'
                            : 'var(--surface-2)',
                          border: isTop1
                            ? '1.5px solid #f59e0b'
                            : isTop3
                            ? '1px solid rgba(13, 148, 136, 0.4)'
                            : '1px solid var(--border-1)',
                          display: 'grid',
                          gridTemplateColumns: '60px 2.2fr 1fr 1fr 1.2fr',
                          alignItems: 'center',
                        }}
                      >
                        {/* RANK */}
                        <div
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            background: isTop1 ? '#f59e0b' : isTop3 ? '#0d9488' : 'var(--surface-1)',
                            color: isTop1 || isTop3 ? '#fff' : 'var(--text-2)',
                            fontSize: '0.9rem',
                            fontWeight: 900,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {idx + 1}
                        </div>

                        {/* PARTICIPANT */}
                        <div>
                          <div style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-1)' }}>
                            {p.employeeName}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                            <span style={{ fontSize: '0.74rem', color: 'var(--text-3)' }}>{p.employeeId}</span>
                            {isTieWinner && (
                              <span style={{ fontSize: '0.7rem', color: '#f59e0b', background: 'rgba(245, 158, 11, 0.12)', padding: '2px 8px', borderRadius: '10px', border: '1px solid rgba(245, 158, 11, 0.3)', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                                <Zap size={10} /> Faster completion
                              </span>
                            )}
                          </div>
                        </div>

                        {/* SCORE */}
                        <div style={{ textAlign: 'center', fontSize: '1rem', fontWeight: 900, color: isTop1 ? '#f59e0b' : '#0d9488' }}>
                          {correctCount}/{totalQ}
                        </div>

                        {/* ACCURACY */}
                        <div style={{ textAlign: 'center', fontSize: '0.95rem', fontWeight: 900, color: '#10b981' }}>
                          {accuracy}%
                        </div>

                        {/* COMPLETION TIME */}
                        <div style={{ textAlign: 'right', fontSize: '0.95rem', fontWeight: 900, fontFamily: 'monospace', color: 'var(--text-1)' }}>
                          {formattedTime}
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>

              {/* FOOTER ACTIONS */}
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={handleNextQuestion}
                  className="ai-quiz-btn-primary"
                  style={{ background: 'linear-gradient(135deg, #0d9488, #4f46e5)' }}
                >
                  {currentQuestionIndex + 1 < questions.length ? (
                    <>Next Question →</>
                  ) : (
                    <>Finish Live Quiz &amp; Save Results →</>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* VIEW 5: SUMMARY & PODIUM SCREEN */}
          {viewState === 'summary' && (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between', gap: '20px' }}>
              <div style={{ textAlign: 'center' }}>
                <span className="badge-tag" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', fontSize: '0.85rem', fontWeight: 800 }}>
                  <Award size={14} className="inline mr-1" /> Quiz Completed
                </span>
                <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--text-1)', margin: '6px 0 0 0' }}>
                  Live Quiz Winner &amp; Final Results
                </h2>
              </div>

              {/* TOP 3 PODIUM */}
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '16px', padding: '16px 0' }}>
                {/* 2ND PLACE */}
                {sortedLeaderboard[1] && (() => {
                  const p2 = sortedLeaderboard[1];
                  const c2 = p2.correctAnswersCount ?? p2.score ?? 0;
                  const t2 = p2.totalQuestions ?? questions.length ?? 10;
                  const acc2 = Math.round((c2 / Math.max(1, t2)) * 100);
                  const time2 = p2.formattedTime || formatTimeMs(p2.totalTimeMs);
                  return (
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.1 }}
                      style={{ flex: 1, maxWidth: '210px', padding: '16px', borderRadius: '16px', background: 'var(--surface-2)', border: '1px solid var(--border-1)', textAlign: 'center' }}
                    >
                      <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#94a3b8' }}>#2</div>
                      <div style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-1)', margin: '4px 0' }}>{p2.employeeName}</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0d9488' }}>{c2}/{t2} ({acc2}%)</div>
                      <div style={{ fontSize: '0.82rem', fontFamily: 'monospace', color: 'var(--text-2)', marginTop: '2px' }}>Time: {time2}</div>
                    </motion.div>
                  );
                })()}

                {/* 1ST PLACE WINNER */}
                {sortedLeaderboard[0] && (() => {
                  const p1 = sortedLeaderboard[0];
                  const c1 = p1.correctAnswersCount ?? p1.score ?? 0;
                  const t1 = p1.totalQuestions ?? questions.length ?? 10;
                  const acc1 = Math.round((c1 / Math.max(1, t1)) * 100);
                  const time1 = p1.formattedTime || formatTimeMs(p1.totalTimeMs);
                  const tie1 = checkTieBreakerWon(p1, 0, sortedLeaderboard);

                  return (
                    <motion.div
                      initial={{ y: 30, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      style={{ flex: 1, maxWidth: '240px', padding: '20px 16px', borderRadius: '20px', background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(13, 148, 136, 0.2))', border: '2px solid #f59e0b', textAlign: 'center', boxShadow: '0 0 30px rgba(245, 158, 11, 0.3)' }}
                    >
                      <Trophy size={32} style={{ color: '#f59e0b', margin: '0 auto 8px auto' }} />
                      <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#f59e0b' }}>#1 WINNER</div>
                      <div style={{ fontSize: '1.05rem', fontWeight: 900, color: 'var(--text-1)', margin: '6px 0' }}>{p1.employeeName}</div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0d9488' }}>{c1}/{t1} ({acc1}%)</div>
                      <div style={{ fontSize: '0.85rem', fontFamily: 'monospace', color: 'var(--text-1)', marginTop: '2px', fontWeight: 800 }}>Time: {time1}</div>
                      {tie1 && (
                        <div style={{ marginTop: '8px', fontSize: '0.72rem', color: '#f59e0b', background: 'rgba(245, 158, 11, 0.2)', padding: '3px 8px', borderRadius: '10px', border: '1px solid rgba(245, 158, 11, 0.4)', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Zap size={12} /> Faster completion
                        </div>
                      )}
                    </motion.div>
                  );
                })()}

                {/* 3RD PLACE */}
                {sortedLeaderboard[2] && (() => {
                  const p3 = sortedLeaderboard[2];
                  const c3 = p3.correctAnswersCount ?? p3.score ?? 0;
                  const t3 = p3.totalQuestions ?? questions.length ?? 10;
                  const acc3 = Math.round((c3 / Math.max(1, t3)) * 100);
                  const time3 = p3.formattedTime || formatTimeMs(p3.totalTimeMs);
                  return (
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      style={{ flex: 1, maxWidth: '210px', padding: '16px', borderRadius: '16px', background: 'var(--surface-2)', border: '1px solid var(--border-1)', textAlign: 'center' }}
                    >
                      <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#b45309' }}>#3</div>
                      <div style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-1)', margin: '4px 0' }}>{p3.employeeName}</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0d9488' }}>{c3}/{t3} ({acc3}%)</div>
                      <div style={{ fontSize: '0.82rem', fontFamily: 'monospace', color: 'var(--text-2)', marginTop: '2px' }}>Time: {time3}</div>
                    </motion.div>
                  );
                })()}
              </div>

              {/* SUMMARY STATS ROW */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                <div style={{ padding: '14px', borderRadius: '12px', background: 'var(--surface-2)', border: '1px solid var(--border-1)', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-2)', fontWeight: 800 }}>PARTICIPANTS</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--text-1)' }}>{participants.length}</div>
                </div>
                <div style={{ padding: '14px', borderRadius: '12px', background: 'var(--surface-2)', border: '1px solid var(--border-1)', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-2)', fontWeight: 800 }}>AVG SCORE</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0d9488' }}>78%</div>
                </div>
                <div style={{ padding: '14px', borderRadius: '12px', background: 'var(--surface-2)', border: '1px solid var(--border-1)', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-2)', fontWeight: 800 }}>PASS RATE</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#10b981' }}>83%</div>
                </div>
                <div style={{ padding: '14px', borderRadius: '12px', background: 'var(--surface-2)', border: '1px solid var(--border-1)', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-2)', fontWeight: 800 }}>TOP SCORE</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#f59e0b' }}>{sortedLeaderboard[0]?.score || 4800}</div>
                </div>
              </div>

              {/* FINAL FOOTER */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={onClose} className="ai-quiz-btn-secondary">
                  Close
                </button>

                <button
                  type="button"
                  onClick={handleSaveAndClose}
                  className="ai-quiz-btn-primary"
                  style={{ background: 'linear-gradient(135deg, #0d9488, #4f46e5)' }}
                >
                  <Save size={16} /> Save Assessment Results →
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
