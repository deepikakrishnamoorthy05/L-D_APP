import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  X,
  Star,
  CheckCircle2,
  Send,
  MessageSquare,
  Clock,
  UserCheck,
  TrendingUp,
  Award,
  Users,
  AlertTriangle,
  ThumbsUp,
} from 'lucide-react';
import { useFeedback } from '../../context/FeedbackContext';
import { SessionFeedbackSummary, FeedbackRecord } from '../../types/feedback';
import { StatusBadge } from '../ui';

interface FeedbackDetailModalProps {
  sessionSummary?: SessionFeedbackSummary | null;
  record?: FeedbackRecord | null;
  onClose: () => void;
}

export const FeedbackDetailModal: React.FC<FeedbackDetailModalProps> = ({
  sessionSummary,
  record,
  onClose,
}) => {
  const { sendFeedbackReminder } = useFeedback();
  const [reminderSent, setReminderSent] = useState(false);
  const [activeTab, setActiveTab] = useState<'scorecard' | 'comments' | 'breakdown'>('scorecard');

  if (!sessionSummary && !record) return null;

  const title = sessionSummary?.sessionTitle || record?.sessionTitle || record?.moduleName || 'L&D Session Feedback';
  const trainer = sessionSummary?.trainerName || record?.trainerName || 'Sarah David';
  const type = sessionSummary?.trainingType || record?.bootcampName || 'Knowledge Sharing Series';
  const track = sessionSummary?.track || record?.track || 'DE';
  const date = sessionSummary?.sessionDate || record?.feedbackDate || '2026-09-18';
  const overallRating = sessionSummary?.overallRating || record?.overallRating || 4.6;
  const status = sessionSummary?.status || record?.status || 'Collected';

  const participants = sessionSummary?.totalParticipants || 18;
  const responses = sessionSummary?.responsesCount || 15;
  const pending = sessionSummary?.pendingCount || 3;
  const completionRate = Math.round((responses / (participants || 1)) * 100);

  const handleSendReminder = () => {
    if (sessionSummary) {
      sendFeedbackReminder(sessionSummary.sessionId);
    }
    setReminderSent(true);
    setTimeout(() => setReminderSent(false), 3000);
  };

  return (
    <div className="cert-modal-overlay" onClick={onClose}>
      <motion.div
        initial={{ x: 350, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 350, opacity: 0 }}
        className="cert-modal-card"
        style={{ maxWidth: '580px', width: '100%', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="cert-modal-header">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="code-chip lg text-[10px]">{type}</span>
              <span className="code-chip text-[10px]">{track}</span>
              <StatusBadge status={status as any} size="sm" />
            </div>
            <h3 className="cert-modal-title" style={{ fontSize: '1.25rem' }}>
              {title}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Trainer: <strong className="text-slate-800 dark:text-slate-200">{trainer}</strong> • Session Date: {date}
            </p>
          </div>
          <button type="button" className="cert-modal-close" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {/* Modal Sub-Tabs */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-200 dark:border-slate-800">
          <button
            type="button"
            className={`px-3 py-2 text-xs font-extrabold border-b-2 transition-colors ${
              activeTab === 'scorecard'
                ? 'border-teal-600 text-teal-700 dark:text-teal-400'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
            onClick={() => setActiveTab('scorecard')}
          >
            Feedback Scorecard
          </button>
          <button
            type="button"
            className={`px-3 py-2 text-xs font-extrabold border-b-2 transition-colors ${
              activeTab === 'comments'
                ? 'border-teal-600 text-teal-700 dark:text-teal-400'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
            onClick={() => setActiveTab('comments')}
          >
            Comments &amp; Feedback
          </button>
          <button
            type="button"
            className={`px-3 py-2 text-xs font-extrabold border-b-2 transition-colors ${
              activeTab === 'breakdown'
                ? 'border-teal-600 text-teal-700 dark:text-teal-400'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
            onClick={() => setActiveTab('breakdown')}
          >
            Response Breakdown
          </button>
        </div>

        {/* Body */}
        <div className="cert-modal-body space-y-4" style={{ overflowY: 'auto', flex: 1, padding: '1.25rem 1.5rem' }}>
          {activeTab === 'scorecard' && (
            <div className="space-y-4">
              {/* Overall Banner */}
              <div className="p-4 bg-teal-50 dark:bg-teal-900/30 border border-teal-200 dark:border-teal-800 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-extrabold text-teal-800 dark:text-teal-300 uppercase tracking-wider block mb-1">
                    Overall Session Satisfaction
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-slate-900 dark:text-white">{overallRating.toFixed(1)}</span>
                    <span className="text-xs text-slate-500 font-bold">/ 5.0</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-amber-500 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-teal-100 shadow-sm">
                  <Star size={18} className="fill-amber-400" />
                  <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                    {overallRating >= 4.5 ? 'Excellent' : overallRating >= 4.0 ? 'Very Good' : 'Needs Attention'}
                  </span>
                </div>
              </div>

              {/* Scorecard Bars */}
              <div className="feedback-scorecard-box">
                <h4 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                  Detailed Rating Breakdown
                </h4>

                <div className="space-y-3">
                  <div>
                    <div className="feedback-score-row mb-1">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Training Content</span>
                      <span className="text-xs font-extrabold text-teal-700 dark:text-teal-300">
                        {sessionSummary?.contentRating || record?.technicalRating || 4.7} / 5
                      </span>
                    </div>
                    <div className="feedback-score-bar-track">
                      <div
                        className="feedback-score-bar-fill"
                        style={{ width: `${((sessionSummary?.contentRating || record?.technicalRating || 4.7) / 5) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="feedback-score-row mb-1">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Trainer Effectiveness</span>
                      <span className="text-xs font-extrabold text-teal-700 dark:text-teal-300">
                        {sessionSummary?.trainerRating || record?.communicationRating || 4.8} / 5
                      </span>
                    </div>
                    <div className="feedback-score-bar-track">
                      <div
                        className="feedback-score-bar-fill"
                        style={{ width: `${((sessionSummary?.trainerRating || record?.communicationRating || 4.8) / 5) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="feedback-score-row mb-1">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Practical Relevance</span>
                      <span className="text-xs font-extrabold text-teal-700 dark:text-teal-300">
                        {sessionSummary?.relevanceRating || record?.practicalApplicationRating || 4.4} / 5
                      </span>
                    </div>
                    <div className="feedback-score-bar-track">
                      <div
                        className="feedback-score-bar-fill"
                        style={{ width: `${((sessionSummary?.relevanceRating || record?.practicalApplicationRating || 4.4) / 5) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="feedback-score-row mb-1">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Session Engagement</span>
                      <span className="text-xs font-extrabold text-teal-700 dark:text-teal-300">
                        {sessionSummary?.engagementRating || record?.participationRating || 4.5} / 5
                      </span>
                    </div>
                    <div className="feedback-score-bar-track">
                      <div
                        className="feedback-score-bar-fill"
                        style={{ width: `${((sessionSummary?.engagementRating || record?.participationRating || 4.5) / 5) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="feedback-score-row mb-1">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Training Pace</span>
                      <span className="text-xs font-extrabold text-teal-700 dark:text-teal-300">
                        {sessionSummary?.paceRating || 4.3} / 5
                      </span>
                    </div>
                    <div className="feedback-score-bar-track">
                      <div
                        className="feedback-score-bar-fill"
                        style={{ width: `${((sessionSummary?.paceRating || 4.3) / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'comments' && (
            <div className="space-y-4 text-xs">
              {/* Positive Comments */}
              <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl space-y-2">
                <h4 className="font-extrabold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5 uppercase text-[11px]">
                  <ThumbsUp size={14} /> Positive Participant Highlights
                </h4>
                <ul className="list-disc list-inside space-y-1 text-slate-700 dark:text-slate-300">
                  {sessionSummary?.positiveComments?.map((c, i) => (
                    <li key={i}>{c}</li>
                  )) || (
                    <>
                      <li>{record?.strengthComments || 'Understands relational database schema design extremely well.'}</li>
                      <li>High classroom engagement and clear conceptual explanation.</li>
                    </>
                  )}
                </ul>
              </div>

              {/* Improvement Comments */}
              <div className="p-3.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl space-y-2">
                <h4 className="font-extrabold text-amber-800 dark:text-amber-300 flex items-center gap-1.5 uppercase text-[11px]">
                  <AlertTriangle size={14} /> Key Improvement Suggestions
                </h4>
                <ul className="list-disc list-inside space-y-1 text-slate-700 dark:text-slate-300">
                  {sessionSummary?.improvementSuggestions?.map((c, i) => (
                    <li key={i}>{c}</li>
                  )) || (
                    <li>{record?.improvementComments || 'Provide more hands-on exercises for timed lab tasks.'}</li>
                  )}
                </ul>
              </div>

              {/* Trainer Remarks */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl space-y-1.5">
                <h4 className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5 uppercase text-[11px]">
                  <MessageSquare size={14} className="text-teal-600" /> Trainer Evaluation Remarks
                </h4>
                <p className="text-slate-600 dark:text-slate-300 italic leading-relaxed">
                  "{sessionSummary?.trainerComments || record?.generalComments || 'High participant engagement during query plan analysis.'}"
                </p>
              </div>
            </div>
          )}

          {activeTab === 'breakdown' && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase block mb-1">Target Audience</span>
                  <span className="text-lg font-black text-slate-900 dark:text-white">{participants}</span>
                </div>
                <div className="p-3 bg-teal-50 dark:bg-teal-900/40 rounded-xl border border-teal-200 dark:border-teal-800">
                  <span className="text-[10px] font-extrabold text-teal-600 uppercase block mb-1">Responses Collected</span>
                  <span className="text-lg font-black text-teal-700 dark:text-teal-300">{responses}</span>
                </div>
                <div className="p-3 bg-rose-50 dark:bg-rose-950/40 rounded-xl border border-rose-200 dark:border-rose-800">
                  <span className="text-[10px] font-extrabold text-rose-600 uppercase block mb-1">Pending Responses</span>
                  <span className="text-lg font-black text-rose-700 dark:text-rose-300">{pending}</span>
                </div>
              </div>

              {/* Response Rate Progress */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-700 dark:text-slate-300">Feedback Completion Rate</span>
                  <span className="text-teal-700 dark:text-teal-300 font-extrabold">{completionRate}%</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-teal-600 h-full transition-all duration-500" style={{ width: `${completionRate}%` }} />
                </div>
              </div>

              {pending > 0 && (
                <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-2xl flex items-center justify-between">
                  <div>
                    <h5 className="font-extrabold text-xs text-amber-900 dark:text-amber-300">
                      {pending} Participants Have Not Responded
                    </h5>
                    <p className="text-[11px] text-amber-700 dark:text-amber-400">
                      Automated reminder will notify only pending respondents.
                    </p>
                  </div>
                  <button
                    type="button"
                    className="ui-button-primary text-xs py-1.5 px-3 flex items-center gap-1.5"
                    onClick={handleSendReminder}
                  >
                    <Send size={13} /> {reminderSent ? 'Reminder Sent!' : `Remind ${pending} Pending`}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="cert-modal-footer" style={{ padding: '1rem 1.5rem' }}>
          <button type="button" className="ui-button-secondary text-xs" onClick={onClose}>
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
};
