import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap,
  CheckCircle2,
  XCircle,
  Clock,
  Trophy,
  User,
  Hash,
  ArrowRight,
  X,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { QuizQuestion } from '../../types/assessment';
import { nativeQuizService } from '../../services/nativeQuizService';

interface LiveQuizParticipantViewProps {
  isOpen: boolean;
  onClose: () => void;
  initialJoinCode?: string;
  defaultEmployeeName?: string;
  defaultEmployeeId?: string;
}

const PRESET_EMPLOYEES = [
  { id: 'EMP-1001', name: 'Deepika Mookan' },
  { id: 'EMP-1002', name: 'Mohit Sharma' },
  { id: 'EMP-1003', name: 'Swetha Ramakrishnan' },
  { id: 'EMP-1004', name: 'Janani Venkatesh' },
  { id: 'EMP-1005', name: 'Manoj Kumar' },
];

export const LiveQuizParticipantView: React.FC<LiveQuizParticipantViewProps> = ({
  isOpen,
  onClose,
  initialJoinCode = '482913',
  defaultEmployeeName = 'Deepika Mookan',
  defaultEmployeeId = 'EMP-1001',
}) => {
  if (!isOpen) return null;

  // View state: 'join' | 'waiting' | 'question' | 'answered' | 'reveal' | 'finished'
  const [viewState, setViewState] = useState<'join' | 'waiting' | 'question' | 'answered' | 'reveal' | 'finished'>('join');

  const [joinCode, setJoinCode] = useState(initialJoinCode);
  const [employeeName, setEmployeeName] = useState(defaultEmployeeName);
  const [employeeId, setEmployeeId] = useState(defaultEmployeeId);

  const [sessionId, setSessionId] = useState('');
  const [quizTitle, setQuizTitle] = useState('SQL Joins & Window Functions Quiz');
  const [participantId, setParticipantId] = useState('');

  // Question State
  const [questionIndex, setQuestionIndex] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(5);
  const [questionText, setQuestionText] = useState('Which SQL JOIN clause returns all rows from the left table?');
  const [options, setOptions] = useState<string[]>(['INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'CROSS JOIN']);
  const [questionId, setQuestionId] = useState('q-1');
  const [timeLimit, setTimeLimit] = useState(30);

  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [pointsEarned, setPointsEarned] = useState<number>(0);
  const [totalScore, setTotalScore] = useState<number>(0);
  const [correctAnswer, setCorrectAnswer] = useState<string | null>(null);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [currentRank, setCurrentRank] = useState<number>(1);

  const [timeLeft, setTimeLeft] = useState(30);

  // Timer countdown for participant
  useEffect(() => {
    let timer: any;
    if ((viewState === 'question' || viewState === 'answered') && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [viewState, timeLeft]);

  // Connect WebSockets
  useEffect(() => {
    if (!isOpen) return;

    const socket = nativeQuizService.getSocket();

    socket.on('quiz:joined', (data: any) => {
      setSessionId(data.sessionId);
      if (data.quizTitle) setQuizTitle(data.quizTitle);
      if (data.participant) setParticipantId(data.participant.id);
      setViewState('waiting');
    });

    socket.on('quiz:started', (data: any) => {
      setQuizTitle(data.quizTitle || quizTitle);
      setTotalQuestions(data.totalQuestions || 5);
      setViewState('question');
    });

    socket.on('quiz:question-start', (data: any) => {
      setQuestionIndex(data.questionIndex || 0);
      setTotalQuestions(data.totalQuestions || 5);
      setQuestionId(data.questionId);
      setQuestionText(data.question);
      setOptions(data.options || []);
      setTimeLimit(data.timeLimit || 30);
      setTimeLeft(data.timeLimit || 30);
      setSelectedAnswer(null);
      setCorrectAnswer(null);
      setExplanation(null);
      setViewState('question');
    });

    socket.on('quiz:reveal-answer', (data: any) => {
      setCorrectAnswer(data.correctAnswer);
      setExplanation(data.explanation);
      setViewState('reveal');
    });

    socket.on('quiz:leaderboard', (data: any) => {
      if (data.leaderboard) {
        const me = data.leaderboard.find((p: any) => p.employeeName === employeeName || p.id === participantId);
        if (me) {
          setCurrentRank(me.rank || 1);
          setTotalScore(me.score || totalScore);
        }
      }
    });

    socket.on('quiz:ended', (data: any) => {
      setViewState('finished');
    });

    return () => {
      socket.off('quiz:joined');
      socket.off('quiz:started');
      socket.off('quiz:question-start');
      socket.off('quiz:reveal-answer');
      socket.off('quiz:leaderboard');
      socket.off('quiz:ended');
    };
  }, [isOpen, employeeName, participantId, quizTitle, totalScore]);

  const handleJoin = async () => {
    if (!joinCode.trim()) return;

    const socket = nativeQuizService.getSocket();
    socket.emit('quiz:join', {
      joinCode: joinCode.trim(),
      employeeId,
      employeeName,
    });

    // Fallback UI transition if backend socket is offline
    setTimeout(() => {
      setViewState('waiting');
    }, 300);
  };

  const handleSelectOption = (opt: string) => {
    if (selectedAnswer !== null || viewState !== 'question') return;

    setSelectedAnswer(opt);
    setViewState('answered');

    const socket = nativeQuizService.getSocket();
    const responseTimeSec = Math.max(1, timeLimit - timeLeft);

    socket.emit('quiz:answer-submit', {
      sessionId: sessionId || 'session-1',
      questionId,
      participantId: participantId || 'part-1',
      selectedAnswer: opt,
      responseTimeSec,
    });

    // Compute local points for responsive UX feedback (1 point per correct answer)
    const basePts = 1;
    setPointsEarned(basePts);
    setTotalScore((prev) => prev + basePts);
  };

  return (
    <div className="ai-quiz-modal-backdrop" style={{ background: 'rgba(9, 13, 20, 0.94)', backdropFilter: 'blur(12px)' }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="ai-quiz-modal-card"
        style={{
          maxWidth: '420px',
          width: '100%',
          borderRadius: '24px',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
          background: 'var(--surface-1)',
          border: '1.5px solid rgba(13, 148, 136, 0.3)',
        }}
      >
        {/* HEADER */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg, #0d9488, #4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
              <Zap size={18} />
            </div>
            <span style={{ fontSize: '0.85rem', fontWeight: 900, color: 'var(--text-1)', letterSpacing: '0.5px' }}>
              Systech Live Quiz
            </span>
          </div>

          <button type="button" onClick={onClose} className="close-btn">
            <X size={18} />
          </button>
        </div>

        {/* SCREEN 1: JOIN SCREEN */}
        {viewState === 'join' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--text-1)', margin: 0 }}>
                Join Live Quiz
              </h2>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-2)', marginTop: '4px' }}>
                Enter the 6-digit code shown on the host screen.
              </p>
            </div>

            <div className="ai-quiz-form-group">
              <label style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', color: '#0d9488' }}>
                <Hash size={12} className="inline mr-1" /> 6-Digit Join Code
              </label>
              <input
                type="text"
                maxLength={6}
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                placeholder="482913"
                className="ai-quiz-input-lg"
                style={{ textAlign: 'center', fontSize: '1.6rem', fontWeight: 900, letterSpacing: '6px', padding: '12px' }}
              />
            </div>

            <div className="ai-quiz-form-group">
              <label style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-2)' }}>
                <User size={12} className="inline mr-1" /> Select / Enter Trainee Name
              </label>
              <select
                value={employeeName}
                onChange={(e) => {
                  const sel = PRESET_EMPLOYEES.find((emp) => emp.name === e.target.value);
                  if (sel) {
                    setEmployeeName(sel.name);
                    setEmployeeId(sel.id);
                  } else {
                    setEmployeeName(e.target.value);
                  }
                }}
                className="ai-quiz-select"
                style={{ padding: '10px 12px', fontSize: '0.88rem' }}
              >
                {PRESET_EMPLOYEES.map((emp) => (
                  <option key={emp.id} value={emp.name}>
                    {emp.name} ({emp.id})
                  </option>
                ))}
              </select>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={handleJoin}
              className="ai-quiz-btn-primary"
              style={{ width: '100%', padding: '14px', fontSize: '0.95rem', fontWeight: 900, background: 'linear-gradient(135deg, #0d9488, #4f46e5)', justifyContent: 'center' }}
            >
              Join Live Quiz →
            </motion.button>
          </div>
        )}

        {/* SCREEN 2: WAITING ROOM */}
        {viewState === 'waiting' && (
          <div style={{ padding: '20px 10px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
            <motion.div
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'rgba(13, 148, 136, 0.15)', border: '2px solid #0d9488', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0d9488' }}
            >
              <CheckCircle2 size={36} />
            </motion.div>

            <div>
              <span className="badge-tag" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', fontSize: '0.8rem', fontWeight: 800 }}>
                You're in!
              </span>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-1)', margin: '8px 0 4px 0' }}>
                {quizTitle}
              </h2>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-2)', margin: 0 }}>
                Welcome, <strong>{employeeName}</strong>! Waiting for the host to start the quiz.
              </p>
            </div>

            {/* DEMO CONTROLS TO FORCE START IF OFFLINE */}
            <button
              type="button"
              onClick={() => setViewState('question')}
              style={{ marginTop: '12px', background: 'none', border: 'none', color: '#0d9488', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}
            >
              (Simulate Host Starting Quiz)
            </button>
          </div>
        )}

        {/* SCREEN 3: QUESTION VIEW (MOBILE 390px RESPONSIVE) */}
        {(viewState === 'question' || viewState === 'answered') && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0d9488', textTransform: 'uppercase' }}>
                Q{questionIndex + 1} of {totalQuestions}
              </span>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 900, color: timeLeft <= 5 ? '#ef4444' : '#0d9488' }}>
                <Clock size={14} /> {timeLeft}s
              </div>
            </div>

            {/* QUESTION TEXT */}
            <div style={{ padding: '16px', borderRadius: '14px', background: 'var(--surface-2)', border: '1px solid var(--border-1)', fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-1)', lineHeight: 1.4 }}>
              {questionText}
            </div>

            {/* 4 TOUCHABLE ANSWER BUTTONS */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {options.map((opt, idx) => {
                const label = String.fromCharCode(65 + idx);
                const isSelected = selectedAnswer === opt;

                return (
                  <motion.button
                    key={idx}
                    whileTap={viewState === 'question' ? { scale: 0.98 } : undefined}
                    type="button"
                    disabled={viewState === 'answered'}
                    onClick={() => handleSelectOption(opt)}
                    style={{
                      padding: '14px 16px',
                      borderRadius: '12px',
                      border: '1.5px solid',
                      borderColor: isSelected ? '#0d9488' : 'var(--border-1)',
                      background: isSelected ? 'rgba(13, 148, 136, 0.15)' : 'var(--surface-2)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      textAlign: 'left',
                      cursor: viewState === 'question' ? 'pointer' : 'default',
                    }}
                  >
                    <span style={{ width: '28px', height: '28px', borderRadius: '6px', background: isSelected ? '#0d9488' : 'var(--surface-1)', color: isSelected ? '#fff' : 'var(--text-1)', fontSize: '0.82rem', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {label}
                    </span>
                    <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-1)', flex: 1 }}>{opt}</span>
                    {isSelected && <Check size={16} style={{ color: '#0d9488' }} />}
                  </motion.button>
                );
              })}
            </div>

            {/* SUBMISSION STATUS */}
            {viewState === 'answered' && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ padding: '12px', borderRadius: '12px', background: 'rgba(13, 148, 136, 0.1)', border: '1px solid #0d9488', textAlign: 'center', fontSize: '0.8rem', fontWeight: 800, color: '#0d9488' }}
              >
                Answer Submitted! Waiting for host to reveal results...
              </motion.div>
            )}

            {/* DEMO CONTROLS TO FORCE REVEAL IF OFFLINE */}
            <button
              type="button"
              onClick={() => {
                setCorrectAnswer(options[1] || 'LEFT JOIN');
                setExplanation('LEFT JOIN preserves all rows from the left table.');
                setViewState('reveal');
              }}
              style={{ marginTop: '4px', background: 'none', border: 'none', color: 'var(--text-3)', fontSize: '0.7rem', cursor: 'pointer' }}
            >
              (Simulate Host Revealing Answer)
            </button>
          </div>
        )}

        {/* SCREEN 4: ANSWER REVEAL VIEW */}
        {viewState === 'reveal' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'center' }}>
            <div style={{ padding: '16px', borderRadius: '14px', background: selectedAnswer === correctAnswer ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)', border: `1.5px solid ${selectedAnswer === correctAnswer ? '#10b981' : '#ef4444'}`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              {selectedAnswer === correctAnswer ? (
                <>
                  <CheckCircle2 size={32} style={{ color: '#10b981' }} />
                  <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#10b981' }}>Correct Answer!</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-1)' }}>+1 Correct Answer</div>
                </>
              ) : (
                <>
                  <XCircle size={32} style={{ color: '#ef4444' }} />
                  <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#ef4444' }}>Incorrect</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-2)' }}>Correct option was: <strong>{correctAnswer}</strong></div>
                </>
              )}
            </div>

            <div style={{ padding: '12px', borderRadius: '12px', background: 'var(--surface-2)', border: '1px solid var(--border-1)', display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-1)' }}>
              <span>CURRENT SCORE</span>
              <span style={{ color: '#0d9488' }}>{totalScore}/{totalQuestions} ({Math.round((totalScore / Math.max(1, totalQuestions)) * 100)}%)</span>
            </div>

            {explanation && (
              <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(13, 148, 136, 0.06)', border: '1px solid rgba(13, 148, 136, 0.2)', fontSize: '0.78rem', color: 'var(--text-1)', textAlign: 'left' }}>
                <span style={{ fontWeight: 800, color: '#0d9488', display: 'block', marginBottom: '2px' }}>Explanation:</span>
                {explanation}
              </div>
            )}
          </div>
        )}

        {/* SCREEN 5: FINISHED / PODIUM VIEW */}
        {viewState === 'finished' && (
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <Trophy size={48} style={{ color: '#f59e0b' }} />
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--text-1)', margin: 0 }}>
                Quiz Completed!
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-2)', marginTop: '4px' }}>
                Great job, {employeeName}!
              </p>
            </div>

            <div style={{ padding: '16px', borderRadius: '16px', background: 'var(--surface-2)', border: '1px solid var(--border-1)', width: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-2)' }}>YOUR FINAL SCORE</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0d9488' }}>{totalScore}/{totalQuestions}</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-1)' }}>Accuracy: {Math.round((totalScore / Math.max(1, totalQuestions)) * 100)}%</div>
              <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#10b981' }}>Rank #{currentRank} Overall</div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="ai-quiz-btn-primary"
              style={{ width: '100%', padding: '12px', fontSize: '0.9rem', justifyContent: 'center' }}
            >
              Done
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};
