import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot,
  X,
  Send,
  Sparkles,
  Award,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  ExternalLink,
  RotateCcw,
  UserCheck,
  Brain,
  ShieldCheck,
  Target,
} from 'lucide-react';
import {
  certificationIntelligenceService,
  CertificationCopilotResult,
} from '../../services/certificationIntelligenceService';

interface MessageItem {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  dataResponse?: CertificationCopilotResult;
  timestamp: string;
}

interface CertificationChatbotWidgetProps {
  onSelectTalentFilter?: (provider: string) => void;
  isOpenExternal?: boolean;
  onToggleExternal?: () => void;
}

export const CertificationChatbotWidget: React.FC<CertificationChatbotWidgetProps> = ({
  onSelectTalentFilter,
  isOpenExternal,
  onToggleExternal,
}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = isOpenExternal !== undefined ? isOpenExternal : internalOpen;

  const toggleOpen = () => {
    if (onToggleExternal) {
      onToggleExternal();
    } else {
      setInternalOpen(!internalOpen);
    }
  };

  const [inputQuery, setInputQuery] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Default initial chat thread
  const [messages, setMessages] = useState<MessageItem[]>([
    {
      id: 'msg-init-1',
      sender: 'ai',
      text: "Hello! I am your AI Certification Intelligence Assistant. Ask me anything about employee certifications (e.g., 'Who is Informatica certified?'), provider requirements, partnership gaps, or upcoming exam deadlines.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isThinking, isOpen]);

  const handleSendQuery = (textToSend?: string) => {
    const q = textToSend || inputQuery;
    if (!q.trim()) return;

    const userMsgId = `msg-${Date.now()}`;
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newUserMsg: MessageItem = {
      id: userMsgId,
      sender: 'user',
      text: q,
      timestamp,
    };

    setMessages((prev) => [...prev, newUserMsg]);
    if (!textToSend) setInputQuery('');
    setIsThinking(true);

    // Simulated AI API delay
    setTimeout(() => {
      const res = certificationIntelligenceService.askCertificationCopilot(q);
      const aiMsgId = `msg-ai-${Date.now()}`;

      const newAiMsg: MessageItem = {
        id: aiMsgId,
        sender: 'ai',
        text: res.summaryText,
        dataResponse: res,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, newAiMsg]);
      setIsThinking(false);
    }, 450);
  };

  const handleQuickChipClick = (promptText: string) => {
    handleSendQuery(promptText);
  };

  return (
    <>
      {/* 1. FLOATING BOTTOM-RIGHT TRIGGER BUTTON */}
      <motion.button
        type="button"
        className="cert-chatbot-trigger-btn"
        onClick={toggleOpen}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Open AI Certification Copilot"
      >
        <div className="trigger-icon-wrap">
          <Bot size={22} className="text-white" />
          <span className="online-indicator-dot" />
        </div>
        <span className="trigger-label">AI Certification Copilot</span>
        <Sparkles size={14} className="text-amber-300 animate-pulse ml-1" />
      </motion.button>

      {/* 2. FLOATING PREMIUM CHATBOT PANEL */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="cert-chatbot-window"
          >
            {/* CHATBOT HEADER */}
            <div className="cert-chatbot-header">
              <div className="flex items-center gap-2.5">
                <div className="chatbot-avatar-ring">
                  <Bot size={20} className="text-white" />
                  <span className="online-pulse-ring" />
                </div>
                <div>
                  <h4 className="chatbot-title">AI Certification Copilot</h4>
                  <span className="chatbot-subtitle flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" /> Live Enterprise Credential AI
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  className="chatbot-close-btn"
                  onClick={toggleOpen}
                  title="Close Assistant"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* SUGGESTED QUICK PROMPT CHIPS */}
            <div className="cert-chatbot-chips-bar">
              <span className="chips-label">QUICK AI PROMPTS:</span>
              <div className="chips-flex">
                <button
                  type="button"
                  className="prompt-chip"
                  onClick={() => handleQuickChipClick('Give me 10 Informatica certified resources')}
                >
                  "Informatica Certified?"
                </button>
                <button
                  type="button"
                  className="prompt-chip"
                  onClick={() => handleQuickChipClick('Who is ready for Databricks certification?')}
                >
                  "Databricks Certified?"
                </button>
                <button
                  type="button"
                  className="prompt-chip"
                  onClick={() => handleQuickChipClick('What is our Microsoft certification gap?')}
                >
                  "Microsoft Partner Gap?"
                </button>
                <button
                  type="button"
                  className="prompt-chip"
                  onClick={() => handleQuickChipClick('Which certifications expire next month?')}
                >
                  "Expiring Certificates?"
                </button>
              </div>
            </div>

            {/* CHAT MESSAGES SCROLL VIEW */}
            <div className="cert-chatbot-messages-body">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`chat-msg-row ${msg.sender === 'user' ? 'user-msg' : 'ai-msg'}`}
                >
                  {msg.sender === 'ai' && (
                    <div className="msg-avatar-small">
                      <Bot size={14} className="text-white" />
                    </div>
                  )}

                  <div className="msg-bubble-wrap">
                    <div className="msg-bubble">
                      {msg.sender === 'ai' && (
                        <div className="flex items-center gap-1 mb-1 text-[10px] font-black text-teal-600 dark:text-teal-400">
                          <Sparkles size={11} /> CERTIFICATION INTELLIGENCE API
                        </div>
                      )}
                      <p className="msg-text">{msg.text}</p>

                      {/* DATA RESPONSE STRUCTURED CARDS */}
                      {msg.dataResponse && msg.dataResponse.results.length > 0 && (
                        <div className="msg-results-list mt-2 space-y-2">
                          <div className="results-headline">
                            <Award size={13} className="text-teal-600" />
                            <span>{msg.dataResponse.headline}</span>
                          </div>

                          {msg.dataResponse.results.map((item) => (
                            <div key={item.rank} className="result-card-item">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 rounded-full bg-teal-600 text-white font-extrabold text-[10px] flex items-center justify-center">
                                    {item.avatarInitials}
                                  </div>
                                  <span className="font-extrabold text-xs text-slate-900 dark:text-white">
                                    {item.traineeName} <span className="text-[10px] text-slate-400 font-bold">({item.employeeId})</span>
                                  </span>
                                </div>
                                <span className={`risk-tag ${item.statusBadge === 'ACTIVE' || item.statusBadge === 'READY TO SCHEDULE' ? 'risk-low' : 'risk-medium'}`}>
                                  {item.statusBadge}
                                </span>
                              </div>

                              <div className="text-[11px] text-slate-500 mt-1">
                                <strong>Exam:</strong> {item.examCode} • <strong>{item.scoreLabel}:</strong> {item.score}
                              </div>

                              {item.evidence && item.evidence.length > 0 && (
                                <div className="text-[10px] text-slate-400 mt-0.5">
                                  {item.evidence.join(' • ')}
                                </div>
                              )}

                              <p className="text-[10px] font-bold text-teal-700 dark:text-teal-300 mt-1">
                                {item.gapAction}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <span className="msg-timestamp">{msg.timestamp}</span>
                  </div>
                </div>
              ))}

              {/* LIVE THINKING INDICATOR */}
              {isThinking && (
                <div className="chat-msg-row ai-msg">
                  <div className="msg-avatar-small">
                    <Bot size={14} className="text-white" />
                  </div>
                  <div className="msg-bubble-wrap">
                    <div className="msg-bubble thinking-bubble flex items-center gap-2">
                      <Brain size={16} className="animate-spin text-teal-600" />
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Analyzing credential database...</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* INPUT COMMAND BAR */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendQuery();
              }}
              className="cert-chatbot-input-form"
            >
              <input
                type="text"
                className="chatbot-text-input"
                placeholder="Ask AI about certified employees, providers..."
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
              />
              <button
                type="submit"
                className="chatbot-send-btn"
                disabled={!inputQuery.trim() || isThinking}
                aria-label="Send Query"
              >
                <Send size={15} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
