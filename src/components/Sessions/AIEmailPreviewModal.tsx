import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Sparkles,
  Send,
  Edit3,
  RotateCcw,
  CheckCircle2,
  Mail,
  User,
  Calendar,
  Clock,
  MapPin,
  Laptop,
  Check,
  CheckCheck,
  ArrowLeft,
  FileText,
} from 'lucide-react';
import { Session } from '../../types/session';
import { aiCommunicationService, AIEmailContext } from '../../services/AICommunicationService';
import { notificationService } from '../../services/NotificationService';

interface AIEmailPreviewModalProps {
  session: Session;
  actionType?: 'SCHEDULED' | 'RESCHEDULED' | 'CANCELLED';
  onClose: () => void;
  onSendComplete?: () => void;
}

export const AIEmailPreviewModal: React.FC<AIEmailPreviewModalProps> = ({
  session,
  actionType = 'SCHEDULED',
  onClose,
  onSendComplete,
}) => {
  const trainerName = session.trainerName || 'Sneha';
  const trainerEmail = `${trainerName.toLowerCase().replace(/\s+/g, '.')}@systechusa.com`;
  const coordinatorName = session.coordinatorName || 'Priya Sharma';
  const coordinatorEmail = 'priya.sharma@systechusa.com';

  const emailContext: AIEmailContext = {
    trainerName,
    trainerEmail,
    bootcampName: session.bootcampName || 'SQL Data Architecture',
    learningTrack: session.learningTrack || 'Common Foundation',
    moduleName: session.moduleName || 'SQL Fundamentals',
    sessionTitle: session.title || session.agenda || 'SQL Fundamentals',
    sessionDate: session.sessionDate,
    startTime: session.startTime || '09:30',
    endTime: session.endTime || '12:30',
    mode: session.mode || 'Classroom',
    meetingLinkOrLocation: session.location || session.meetingLink || 'Training Room 4B',
    agenda: session.agenda || session.title || 'SQL Fundamentals',
    coordinatorName,
  };

  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [isGenerating, setIsGenerating] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedBody, setEditedBody] = useState('');
  const [sendStatus, setSendStatus] = useState<'idle' | 'sending' | 'sent' | 'failed'>('idle');
  const [sentTimestamp, setSentTimestamp] = useState('');

  useEffect(() => {
    // Initial AI generation delay for realistic shimmer transition
    const timer = setTimeout(() => {
      const initialGenerated = aiCommunicationService.generateTrainerSessionEmail(emailContext, actionType);
      setSubject(initialGenerated.subject);
      setBody(initialGenerated.body);
      setEditedBody(initialGenerated.body);
      setIsGenerating(false);
    }, 700);
    return () => clearTimeout(timer);
  }, []);

  const handleRegenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const regenerated = aiCommunicationService.generateTrainerSessionEmail(emailContext, actionType);
      setSubject(regenerated.subject);
      setBody(regenerated.body);
      setEditedBody(regenerated.body);
      setIsGenerating(false);
    }, 650);
  };

  const handleSaveEdit = () => {
    setBody(editedBody);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditedBody(body);
    setIsEditing(false);
  };

  const handleSendEmail = () => {
    setSendStatus('sending');
    setTimeout(() => {
      notificationService.sendTrainerNotification(
        session,
        {
          id: session.trainerId || 'tr-1',
          employeeId: 'EMP101',
          name: trainerName,
          email: trainerEmail,
          role: 'Trainer',
        },
        actionType
      );
      setSentTimestamp(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      setSendStatus('sent');
      if (onSendComplete) onSendComplete();
    }, 750);
  };

  return (
    <div className="unified-modal-backdrop" onClick={onClose}>
      <motion.div
        initial={{ scale: 0.96, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.96, opacity: 0, y: 10 }}
        transition={{ duration: 0.25 }}
        className="unified-modal-shell ai-email-preview-modal-shell"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle Ambient Radial Glows */}
        <div className="modal-ambient-glow glow-top-left" />
        <div className="modal-ambient-glow glow-bottom-right" />

        {/* 1. FIXED ELEGANT HEADER (88px) */}
        <div className="ai-modal-header-strip">
          <div className="header-left-title-block">
            <div className="ai-spark-badge">
              <Sparkles size={22} className="text-teal-700" />
            </div>
            <div>
              <h2 className="ai-modal-main-title">AI Trainer Email Notification Preview</h2>
              <p className="ai-modal-subtitle">
                Review and approve AI-generated trainer communication before dispatch.
              </p>
            </div>
          </div>

          <button type="button" className="ai-ghost-close-btn" onClick={onClose} title="Close Preview">
            <X size={18} />
          </button>
        </div>

        {/* 2. MAIN BODY */}
        {sendStatus === 'sent' ? (
          /* REDESIGNED PREMIUM CONFIRMATION SUCCESS STATE */
          <div className="ai-success-state-container">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              className="success-ring-avatar"
            >
              <CheckCircle2 size={42} className="text-emerald-600" />
              <span className="success-pulse-ring" />
            </motion.div>

            <motion.h3
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="success-heading-text"
            >
              Trainer Notification Sent
            </motion.h3>

            <p className="success-subheading-text">
              The trainer email communication has been successfully dispatched.
            </p>

            {/* COMPACT DISPATCH SUMMARY CARD */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="dispatch-summary-glass-card"
            >
              <div className="dispatch-row">
                <span className="dispatch-lbl">Recipient:</span>
                <div className="dispatch-val-block">
                  <strong>{trainerName}</strong>
                  <span className="dispatch-chip">{trainerEmail}</span>
                </div>
              </div>

              <div className="dispatch-row">
                <span className="dispatch-lbl">CC:</span>
                <div className="dispatch-val-block">
                  <strong>{coordinatorName}</strong>
                  <span className="dispatch-chip">{coordinatorEmail}</span>
                </div>
              </div>

              <div className="dispatch-row">
                <span className="dispatch-lbl">Sent At:</span>
                <span className="dispatch-time-text">{sentTimestamp || '02:37 PM'}</span>
              </div>

              <div className="dispatch-row">
                <span className="dispatch-lbl">Delivery Status:</span>
                <span className="queue-status-chip">
                  <span className="live-dot" /> Delivered to outbound queue
                </span>
              </div>
            </motion.div>

            {/* SUCCESS FOOTER ACTIONS */}
            <div className="success-footer-row">
              <button
                type="button"
                className="ui-button-secondary"
                onClick={() => setSendStatus('idle')}
              >
                <ArrowLeft size={14} /> View Email Preview
              </button>
              <button
                type="button"
                className="ui-button-primary ui-btn-lg"
                onClick={onClose}
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* 2-COLUMN PREVIEW WORKFLOW (LEFT METADATA + RIGHT EMAIL CANVAS) */
          <div className="ai-email-preview-body-grid">
            {/* LEFT PANEL: EMAIL METADATA & SESSION SUMMARY */}
            <div className="left-meta-summary-panel">
              <div className="meta-summary-glass-card">
                <h4 className="card-section-title">DISPATCH METADATA</h4>

                {/* TO Recipient */}
                <div className="meta-recipient-block">
                  <span className="meta-field-label">TO</span>
                  <div className="recipient-profile-row">
                    <div className="recipient-avatar">
                      {trainerName.split(' ').map((n) => n[0]).join('')}
                    </div>
                    <div className="recipient-info">
                      <strong className="recipient-name">{trainerName}</strong>
                      <span className="recipient-email-chip">{trainerEmail}</span>
                    </div>
                  </div>
                </div>

                {/* CC Recipient */}
                <div className="meta-recipient-block">
                  <span className="meta-field-label">CC</span>
                  <div className="recipient-profile-row">
                    <div className="recipient-avatar cc">
                      {coordinatorName.split(' ').map((n) => n[0]).join('')}
                    </div>
                    <div className="recipient-info">
                      <strong className="recipient-name">{coordinatorName}</strong>
                      <span className="recipient-email-chip">{coordinatorEmail}</span>
                    </div>
                  </div>
                </div>

                {/* SUBJECT CARD */}
                <div className="meta-subject-card">
                  <span className="meta-field-label">SUBJECT</span>
                  <p className="subject-card-text">{subject || `L&D Training Assignment — ${session.moduleName}`}</p>
                </div>

                {/* SESSION SUMMARY BOX */}
                <div className="meta-session-summary-box">
                  <h5 className="summary-box-title">SESSION SUMMARY</h5>

                  <div className="summary-info-row">
                    <span className="sum-lbl">Bootcamp:</span>
                    <span className="sum-val">{session.bootcampName || 'SQL Data Architecture'}</span>
                  </div>

                  <div className="summary-info-row">
                    <span className="sum-lbl">Track:</span>
                    <span className="sum-val">{session.learningTrack || 'Common Foundation'}</span>
                  </div>

                  <div className="summary-info-row">
                    <span className="sum-lbl">Module:</span>
                    <span className="sum-val">{session.moduleName || 'SQL Fundamentals'}</span>
                  </div>

                  <div className="summary-info-row">
                    <span className="sum-lbl">Date:</span>
                    <span className="sum-val highlight">{session.sessionDate}</span>
                  </div>

                  <div className="summary-info-row">
                    <span className="sum-lbl">Time Slot:</span>
                    <span className="sum-val">{session.startTime || '09:30'} – {session.endTime || '12:30'}</span>
                  </div>

                  <div className="summary-info-row">
                    <span className="sum-lbl">Delivery Mode:</span>
                    <span className="sum-val">{session.mode || 'Classroom'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT PANEL: STYLED EMAIL CANVAS */}
            <div className="right-email-canvas-panel">
              <div className="canvas-header-top-row">
                <div className="flex items-center gap-2">
                  <h4 className="canvas-title-text">Generated Email Draft</h4>
                  <span className="ai-generated-chip">
                    <Sparkles size={11} className="inline mr-1" />
                    AI Generated Draft
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {isEditing ? (
                    <>
                      <button
                        type="button"
                        className="canvas-ghost-action-btn danger"
                        onClick={handleCancelEdit}
                      >
                        Cancel Edit
                      </button>
                      <button
                        type="button"
                        className="canvas-ghost-action-btn primary"
                        onClick={handleSaveEdit}
                      >
                        <Check size={13} /> Save Changes
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      className="canvas-ghost-action-btn"
                      onClick={() => {
                        setEditedBody(body);
                        setIsEditing(true);
                      }}
                      disabled={isGenerating}
                    >
                      <Edit3 size={13} /> Edit Content
                    </button>
                  )}
                </div>
              </div>

              <span className="canvas-helper-note">Review, edit, regenerate, or send.</span>

              {/* REAL EMAIL PREVIEW CANVAS PAPER */}
              <div className="real-email-canvas-paper">
                {/* Email Top Header Bar */}
                <div className="email-paper-header-meta">
                  <div className="paper-meta-row">
                    <span className="p-key">From:</span>
                    <span className="p-val">L&amp;D Platform &lt;noreply@systechusa.com&gt;</span>
                  </div>
                  <div className="paper-meta-row">
                    <span className="p-key">To:</span>
                    <span className="p-val">{trainerName} &lt;{trainerEmail}&gt;</span>
                  </div>
                  <div className="paper-meta-row">
                    <span className="p-key">CC:</span>
                    <span className="p-val">{coordinatorName} &lt;{coordinatorEmail}&gt;</span>
                  </div>
                  <div className="paper-meta-row subject">
                    <span className="p-key">Subject:</span>
                    <strong className="p-val subject-text">{subject}</strong>
                  </div>
                </div>

                {/* Email Body Canvas */}
                <div className="email-paper-body-content">
                  {isGenerating ? (
                    <div className="ai-shimmer-loader-box">
                      <div className="shimmer-line line-1" />
                      <div className="shimmer-line line-2" />
                      <div className="shimmer-line line-3" />
                      <span className="shimmer-label">Generating improved trainer communication...</span>
                    </div>
                  ) : isEditing ? (
                    <textarea
                      className="canvas-editing-textarea"
                      value={editedBody}
                      onChange={(e) => setEditedBody(e.target.value)}
                    />
                  ) : (
                    <div className="styled-email-message-paper">
                      <p className="mail-para salutation">Hello {trainerName},</p>

                      <p className="mail-para intro">
                        You have been scheduled to conduct the following L&amp;D training session.
                      </p>

                      <div className="mail-details-card">
                        <h5 className="details-card-heading">Session Details</h5>
                        <ul className="details-bullets-list">
                          <li><strong>Session:</strong> {session.title || session.agenda || 'SQL Fundamentals'}</li>
                          <li><strong>Bootcamp:</strong> {session.bootcampName || 'SQL Data Architecture'}</li>
                          <li><strong>Learning Track:</strong> {session.learningTrack || 'Common Foundation'}</li>
                          <li><strong>Module:</strong> {session.moduleName || 'SQL Fundamentals'}</li>
                          <li><strong>Date:</strong> {session.sessionDate}</li>
                          <li><strong>Time:</strong> {session.startTime || '09:30'} – {session.endTime || '12:30'}</li>
                          <li><strong>Mode:</strong> {session.mode || 'Classroom'} ({session.location || session.meetingLink || 'Training Room 4B'})</li>
                        </ul>
                      </div>

                      <p className="mail-para outro">
                        Please review the curriculum syllabus and be prepared accordingly.
                      </p>

                      <div className="mail-signoff-block">
                        <span>Regards,</span>
                        <strong>L&amp;D Team</strong>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. FIXED ELEGANT FOOTER (78px) */}
        {sendStatus !== 'sent' && (
          <div className="ai-modal-footer-strip">
            <div className="footer-left-group">
              <button
                type="button"
                className="ui-button-secondary"
                onClick={handleRegenerate}
                disabled={isGenerating || sendStatus === 'sending'}
              >
                <RotateCcw size={14} className={isGenerating ? 'animate-spin' : ''} /> Regenerate with AI
              </button>
            </div>

            <div className="footer-right-group">
              <button
                type="button"
                className="ui-button-secondary"
                onClick={onClose}
                disabled={sendStatus === 'sending'}
              >
                Send Later
              </button>
              <button
                type="button"
                className="ui-button-primary premium-send-btn"
                onClick={handleSendEmail}
                disabled={sendStatus === 'sending' || isGenerating}
              >
                <Send size={15} />
                <span>{sendStatus === 'sending' ? 'Dispatching Email...' : 'Send Email Now'}</span>
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
