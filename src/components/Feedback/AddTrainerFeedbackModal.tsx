import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  X,
  CheckCircle2,
} from 'lucide-react';
import { useFeedback } from '../../context/FeedbackContext';
import { COMPANY_CALENDAR_SESSIONS } from '../../data/companyCalendarDataset';

interface AddTrainerFeedbackModalProps {
  onClose: () => void;
}

export const AddTrainerFeedbackModal: React.FC<AddTrainerFeedbackModalProps> = ({ onClose }) => {
  const { addSessionFeedback } = useFeedback();

  const [selectedSessionId, setSelectedSessionId] = useState(COMPANY_CALENDAR_SESSIONS[0]?.id || 'cal-101');
  const [trainerName, setTrainerName] = useState('Sarah David');
  const [trainingType, setTrainingType] = useState('Knowledge Sharing Series');
  const [track, setTrack] = useState('DE');
  const [overallRating, setOverallRating] = useState(4.5);
  const [contentRating, setContentRating] = useState(4.5);
  const [trainerRating, setTrainerRating] = useState(4.8);
  const [relevanceRating, setRelevanceRating] = useState(4.4);
  const [engagementRating, setEngagementRating] = useState(4.5);
  const [paceRating, setPaceRating] = useState(4.3);
  const [totalParticipants, setTotalParticipants] = useState(18);
  const [responsesCount, setResponsesCount] = useState(15);
  const [positiveComment, setPositiveComment] = useState('');
  const [improvementComment, setImprovementComment] = useState('');
  const [trainerRemarks, setTrainerRemarks] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const selectedSession = COMPANY_CALENDAR_SESSIONS.find((s) => s.id === selectedSessionId);

  const handleSessionChange = (id: string) => {
    setSelectedSessionId(id);
    const session = COMPANY_CALENDAR_SESSIONS.find((s) => s.id === id);
    if (session) {
      setTrainingType(session.eventType || 'Knowledge Sharing Series');
      setTrack(session.learningTrack || 'DE');
      setTrainerName(session.trainerName || 'Sarah David');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addSessionFeedback({
      sessionId: selectedSessionId,
      sessionTitle: selectedSession?.title || selectedSession?.agenda || 'L&D Training Session',
      trainingType,
      track,
      trainerName,
      sessionDate: selectedSession?.sessionDate || new Date().toISOString().split('T')[0],
      overallRating,
      contentRating,
      trainerRating,
      relevanceRating,
      engagementRating,
      paceRating,
      totalParticipants,
      responsesCount,
      pendingCount: totalParticipants - responsesCount,
      positiveComments: positiveComment ? [positiveComment] : ['Excellent session delivery and clear examples.'],
      improvementSuggestions: improvementComment ? [improvementComment] : ['Provide follow-up exercise notebooks.'],
      trainerComments: trainerRemarks || 'Trainees were engaged and actively participated.',
      status: 'Collected',
    });

    setIsSuccess(true);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <div className="cert-modal-overlay" onClick={onClose}>
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="cert-modal-card"
        style={{ maxWidth: '620px', width: '100%' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="cert-modal-header">
          <div>
            <h3 className="cert-modal-title" style={{ fontSize: '1.25rem' }}>
              Add Session Feedback
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Record evaluation ratings and participant responses for completed L&amp;D training sessions.
            </p>
          </div>
          <button type="button" className="cert-modal-close" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-8 text-center space-y-3">
            <CheckCircle2 size={48} className="text-teal-600 mx-auto" />
            <h4 className="font-extrabold text-lg text-slate-900 dark:text-white">Feedback Record Saved!</h4>
            <p className="text-xs text-slate-500">Session evaluation added successfully to organization L&amp;D registry.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="cert-modal-body space-y-4" style={{ maxHeight: '75vh', overflowY: 'auto' }}>
            {/* Session Selection */}
            <div className="cert-form-group">
              <label className="cert-form-label">Select L&amp;D Training Session</label>
              <select
                className="ui-input text-xs w-full"
                value={selectedSessionId}
                onChange={(e) => handleSessionChange(e.target.value)}
              >
                {COMPANY_CALENDAR_SESSIONS.slice(0, 15).map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title || s.agenda} ({s.eventType || 'Training'} • {s.sessionDate})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="cert-form-group">
                <label className="cert-form-label">Training Type</label>
                <select
                  className="ui-input text-xs w-full"
                  value={trainingType}
                  onChange={(e) => setTrainingType(e.target.value)}
                >
                  <option value="Knowledge Sharing Series">Knowledge Sharing Series</option>
                  <option value="Antigravity Training">Antigravity Training</option>
                  <option value="Informatica Training">Informatica Training</option>
                  <option value="Databricks Training">Databricks Training</option>
                  <option value="BA Training">BA Training</option>
                  <option value="DE Training">DE Training</option>
                  <option value="Tools Training">Tools Training</option>
                  <option value="Technical Training">Technical Training</option>
                  <option value="Workshop">Workshop</option>
                  <option value="Soft Skills Training">Soft Skills Training</option>
                  <option value="Management Training">Management Training</option>
                  <option value="Bootcamp Training">Bootcamp Training</option>
                </select>
              </div>

              <div className="cert-form-group">
                <label className="cert-form-label">Learning Track</label>
                <select
                  className="ui-input text-xs w-full"
                  value={track}
                  onChange={(e) => setTrack(e.target.value)}
                >
                  <option value="DE">DE (Data Engineering)</option>
                  <option value="BA">BA (Business Analytics)</option>
                  <option value="Tools">Tools</option>
                  <option value="Shared">Shared</option>
                  <option value="Common Foundation">Common Foundation</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="cert-form-group">
                <label className="cert-form-label">Lead Trainer Name</label>
                <input
                  type="text"
                  className="ui-input text-xs w-full"
                  value={trainerName}
                  onChange={(e) => setTrainerName(e.target.value)}
                  placeholder="e.g. Sarah David"
                  required
                />
              </div>

              <div className="cert-form-group">
                <label className="cert-form-label">Overall Rating (1.0 - 5.0)</label>
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  max="5"
                  className="ui-input text-xs w-full font-bold"
                  value={overallRating}
                  onChange={(e) => setOverallRating(parseFloat(e.target.value))}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="cert-form-group">
                <label className="cert-form-label">Total Participants</label>
                <input
                  type="number"
                  className="ui-input text-xs w-full"
                  value={totalParticipants}
                  onChange={(e) => setTotalParticipants(parseInt(e.target.value, 10))}
                  required
                />
              </div>

              <div className="cert-form-group">
                <label className="cert-form-label">Responses Collected</label>
                <input
                  type="number"
                  className="ui-input text-xs w-full"
                  value={responsesCount}
                  onChange={(e) => setResponsesCount(parseInt(e.target.value, 10))}
                  required
                />
              </div>
            </div>

            {/* Qualitative Feedback */}
            <div className="cert-form-group">
              <label className="cert-form-label">Positive Participant Highlight</label>
              <textarea
                className="ui-input text-xs w-full"
                rows={2}
                placeholder="What went exceptionally well in this session?"
                value={positiveComment}
                onChange={(e) => setPositiveComment(e.target.value)}
              />
            </div>

            <div className="cert-form-group">
              <label className="cert-form-label">Key Improvement Suggestion</label>
              <textarea
                className="ui-input text-xs w-full"
                rows={2}
                placeholder="What could be improved for future cohorts?"
                value={improvementComment}
                onChange={(e) => setImprovementComment(e.target.value)}
              />
            </div>

            <div className="cert-form-group">
              <label className="cert-form-label">Trainer Remarks &amp; Observations</label>
              <textarea
                className="ui-input text-xs w-full"
                rows={2}
                placeholder="Trainer's assessment of classroom engagement and understanding..."
                value={trainerRemarks}
                onChange={(e) => setTrainerRemarks(e.target.value)}
              />
            </div>

            <div className="cert-modal-footer">
              <button type="button" className="ui-button-secondary text-xs" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="ui-button-primary text-xs">
                Save Session Feedback
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
};
