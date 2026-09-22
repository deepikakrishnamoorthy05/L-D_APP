import React, { useMemo, useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, BookOpen, CalendarDays, Check, CheckCircle2, Clock3, Edit3, Search, Send, X } from 'lucide-react';
import { TrainingPlan } from '../../types/training';
import { useTraining } from '../../context/TrainingContext';
import './PlanTrainingModal.css';

interface Props { onClose: () => void; onSuccess?: (plan: TrainingPlan) => void; }
interface EmailTemplate { subject:string; greeting:string; body:string; closing:string; }

const computeDuration = (sDate: string, eDate: string, sTime: string, eTime: string): string => {
  if (!sDate || !eDate || !sTime || !eTime) return '';
  const start = new Date(`${sDate}T${sTime}`);
  const end = new Date(`${eDate}T${eTime}`);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return '';
  const diffMs = end.getTime() - start.getTime();
  if (diffMs <= 0) return '';
  
  const totalMins = Math.floor(diffMs / (1000 * 60));
  const days = Math.floor(totalMins / (24 * 60));
  const remainingMins = totalMins % (24 * 60);
  const hours = Math.floor(remainingMins / 60);
  const mins = remainingMins % 60;

  const parts: string[] = [];
  if (days > 0) parts.push(`${days} ${days === 1 ? 'Day' : 'Days'}`);
  if (hours > 0) parts.push(`${hours} ${hours === 1 ? 'Hour' : 'Hours'}`);
  if (mins > 0) parts.push(`${mins} Mins`);

  return parts.join(', ') || '0 Minutes';
};

export const PlanTrainingModal: React.FC<Props> = ({ onClose, onSuccess }) => {
  const { trainers, createTrainingPlan } = useTraining();
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [startTime, setStartTime] = useState('09:30');
  const [endTime, setEndTime] = useState('11:30');
  const [duration, setDuration] = useState('');
  const [isUserDuration, setIsUserDuration] = useState(false);
  const [description, setDescription] = useState('');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (!isUserDuration) {
      const calc = computeDuration(startDate, endDate, startTime, endTime);
      if (calc) setDuration(calc);
    }
  }, [startDate, endDate, startTime, endTime, isUserDuration]);

  const defaultTemplate: EmailTemplate = {
    subject: 'Trainer Availability Request – {{TrainingSessionName}}',
    greeting: 'Hi {{TrainerName}},',
    body: 'We are planning {{TrainingSessionName}} from {{Date}} ({{Time}}) for {{Duration}}.\n\n{{Description}}\n\nPlease confirm your availability for this session.',
    closing: 'Regards,\nL&D Operations Team',
  };
  const [template, setTemplate] = useState(defaultTemplate);
  const [draft, setDraft] = useState(defaultTemplate);
  const chosen = trainers.filter((t) => selected.includes(t.id));
  const filtered = useMemo(
    () =>
      trainers.filter((t) =>
        `${t.name} ${t.employeeId} ${t.track} ${t.skills.join(' ')}`.toLowerCase().includes(search.toLowerCase())
      ),
    [trainers, search]
  );

  const formattedDateRange = startDate && endDate ? (startDate === endDate ? startDate : `${startDate} to ${endDate}`) : 'Scheduled date';
  const formattedTimeRange = `${startTime} - ${endTime}`;

  const replace = (text: string, trainer = 'Trainer') =>
    text
      .replace(/\{\{TrainerName\}\}/g, trainer)
      .replace(/\{\{TrainingSessionName\}\}/g, name || 'Training Session')
      .replace(/\{\{Date\}\}/g, formattedDateRange)
      .replace(/\{\{Time\}\}/g, formattedTimeRange)
      .replace(/\{\{Duration\}\}/g, duration || 'Scheduled duration')
      .replace(/\{\{Description\}\}/g, description || 'Session details will be shared shortly.');

  const next = () => {
    setError('');
    if (step === 1) {
      if (!name.trim()) {
        setError('Training Session Name is required.');
        return;
      }
      if (!startDate) {
        setError('Start Date is required.');
        return;
      }
      if (!endDate) {
        setError('End Date is required.');
        return;
      }
      if (!startTime) {
        setError('Start Time is required.');
        return;
      }
      if (!endTime) {
        setError('End Time is required.');
        return;
      }
      if (new Date(endDate) < new Date(startDate)) {
        setError('End Date cannot be before Start Date.');
        return;
      }
      if (startDate === endDate && startTime >= endTime) {
        setError('End Time cannot be before or equal to Start Time on the same date.');
        return;
      }
    }
    if (step === 2 && !selected.length) {
      setError('Select at least one trainer.');
      return;
    }
    setStep((s) => Math.min(3, s + 1));
  };

  const submit = () => {
    const first = chosen[0];
    const plan = createTrainingPlan({
      name: name.trim(),
      type: 'Internal Learning Session',
      topic: name.trim(),
      description,
      track: first?.track || 'DE',
      targetAudience: 'Internal Team',
      expectedParticipants: 1,
      preferredDate: formattedDateRange,
      preferredTime: formattedTimeRange,
      duration: duration || '1 Hour',
      priority: 'Medium',
      selectedTrainerIds: selected,
    });
    onSuccess?.(plan);
    onClose();
  };

  const steps = ['Details', 'Trainers', 'Request'];

  return (
    <div className="pts-backdrop" onClick={onClose}>
      <motion.div
        className="pts-modal"
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.96, y: 14 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
      >
        <header className="pts-header">
          <span><BookOpen /></span>
          <div>
            <h2>Plan Training Session</h2>
            <p>Create a session and request trainer availability.</p>
          </div>
          <button onClick={onClose}><X /></button>
        </header>

        <nav className="pts-stepper">
          {steps.map((label, i) => {
            const n = i + 1;
            return (
              <React.Fragment key={label}>
                <button
                  type="button"
                  className={`${step === n ? 'active' : ''} ${step > n ? 'done' : ''}`}
                  onClick={() => n < step && setStep(n)}
                >
                  <i>{step > n ? <Check /> : n}</i>
                  <span>{label}</span>
                </button>
                {n < 3 && <b />}
              </React.Fragment>
            );
          })}
        </nav>

        <section className="pts-body">
          {error && <div className="pts-error">{error}</div>}
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="details"
                className="pts-pane"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
              >
                <div className="pts-section-title">
                  <div>
                    <h3>Training Details</h3>
                    <p>Enter the essential session information.</p>
                  </div>
                  <span>Step 1 of 3</span>
                </div>

                <div className="pts-form">
                  <label className="full">
                    <span>Training Session Name *</span>
                    <input
                      autoFocus
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Databricks Performance Workshop"
                    />
                  </label>

                  <label>
                    <span>Start Date *</span>
                    <div className="pts-input-icon">
                      <CalendarDays />
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => {
                          setStartDate(e.target.value);
                          if (!endDate) setEndDate(e.target.value);
                        }}
                      />
                    </div>
                  </label>

                  <label>
                    <span>End Date *</span>
                    <div className="pts-input-icon">
                      <CalendarDays />
                      <input
                        type="date"
                        min={startDate}
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                      />
                    </div>
                  </label>

                  <label>
                    <span>Start Time *</span>
                    <div className="pts-input-icon">
                      <Clock3 />
                      <input
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                      />
                    </div>
                  </label>

                  <label>
                    <span>End Time *</span>
                    <div className="pts-input-icon">
                      <Clock3 />
                      <input
                        type="time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                      />
                    </div>
                  </label>

                  <label className="full">
                    <span>Duration</span>
                    <div className="pts-input-icon">
                      <Clock3 />
                      <input
                        type="text"
                        value={duration}
                        onChange={(e) => {
                          setDuration(e.target.value);
                          setIsUserDuration(true);
                        }}
                        placeholder="Auto-calculated (e.g. 2 Hours)"
                      />
                    </div>
                  </label>

                  <label className="full">
                    <span>Description</span>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Briefly describe the learning objective and session coverage..."
                    />
                  </label>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="trainers"
                className="pts-pane"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
              >
                <div className="pts-section-title">
                  <div>
                    <h3>Select Trainers</h3>
                    <p>Choose one or more trainers for the availability request.</p>
                  </div>
                  <span>{selected.length} selected</span>
                </div>
                <label className="pts-search">
                  <Search />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search trainers..."
                  />
                </label>
                <div className="pts-trainer-grid">
                  {filtered.map((t) => {
                    const on = selected.includes(t.id);
                    return (
                      <button
                        type="button"
                        key={t.id}
                        className={on ? 'selected' : ''}
                        onClick={() =>
                          setSelected((ids) =>
                            on ? ids.filter((id) => id !== t.id) : [...ids, t.id]
                          )
                        }
                      >
                        <div className="pts-trainer-top">
                          <span>{t.initials}</span>
                          <i>{on && <Check />}</i>
                        </div>
                        <h4>{t.name}</h4>
                        <small>{t.employeeId}</small>
                        <p>
                          {t.track === 'DE'
                            ? 'Data Engineering'
                            : t.track === 'BA'
                            ? 'Business Analysis'
                            : 'Tools & Platforms'}
                        </p>
                        <div className="pts-skills">
                          {t.skills.slice(0, 3).map((s) => (
                            <em key={s}>{s}</em>
                          ))}
                          {t.skills.length > 3 && <em>+{t.skills.length - 3}</em>}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="request"
                className="pts-pane"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
              >
                <div className="pts-section-title">
                  <div>
                    <h3>Request Email</h3>
                    <p>Review the message before sending trainer requests.</p>
                  </div>
                  <button
                    className="pts-edit-email"
                    onClick={() => {
                      setDraft(template);
                      setEditing(true);
                    }}
                  >
                    <Edit3 />Edit Email
                  </button>
                </div>
                <article className="pts-email">
                  <div className="pts-email-row">
                    <b>Recipients</b>
                    <div>
                      {chosen.map((t) => (
                        <span key={t.id}>
                          {t.name} · {t.email}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="pts-email-row">
                    <b>Subject</b>
                    <strong>{replace(template.subject)}</strong>
                  </div>
                  <div className="pts-email-paper">
                    <p>{replace(template.greeting, chosen[0]?.name || 'Trainer')}</p>
                    {replace(template.body)
                      .split('\n')
                      .map((line: string, i: number) => (
                        <p key={i}>{line || <br />}</p>
                      ))}
                    <p>{replace(template.closing)}</p>
                  </div>
                </article>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        <footer className="pts-footer">
          <button
            className="secondary"
            onClick={
              step === 1
                ? onClose
                : () => {
                    setError('');
                    setStep((s) => s - 1);
                  }
            }
          >
            {step === 1 ? 'Cancel' : <><ArrowLeft />Back</>}
          </button>
          <button className="primary" onClick={step < 3 ? next : submit}>
            {step < 3 ? <><span style={{ whiteSpace: 'nowrap' }}>Continue</span><ArrowRight /></> : <><Send />Send Request</>}
          </button>
        </footer>

        <AnimatePresence>
          {editing && (
            <div className="pts-editor-backdrop" onClick={() => setEditing(false)}>
              <motion.div
                className="pts-editor"
                onClick={(e) => e.stopPropagation()}
                initial={{ opacity: 0, y: 12, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
              >
                <header>
                  <div>
                    <h3>Edit Email</h3>
                    <p>Personalize the trainer availability request.</p>
                  </div>
                  <button onClick={() => setEditing(false)}><X /></button>
                </header>
                <div className="pts-editor-body">
                  <label>
                    <span>Subject</span>
                    <input
                      value={draft.subject}
                      onChange={(e) => setDraft({ ...draft, subject: e.target.value })}
                    />
                  </label>
                  <label>
                    <span>Greeting</span>
                    <input
                      value={draft.greeting}
                      onChange={(e) => setDraft({ ...draft, greeting: e.target.value })}
                    />
                  </label>
                  <label>
                    <span>Email Body</span>
                    <textarea
                      value={draft.body}
                      onChange={(e) => setDraft({ ...draft, body: e.target.value })}
                    />
                  </label>
                  <label>
                    <span>Closing / Regards</span>
                    <textarea
                      className="short"
                      value={draft.closing}
                      onChange={(e) => setDraft({ ...draft, closing: e.target.value })}
                    />
                  </label>
                  <div className="pts-placeholders">
                    <b>Available fields</b>
                    <span>{'{{TrainerName}}'}</span>
                    <span>{'{{TrainingSessionName}}'}</span>
                    <span>{'{{Date}}'}</span>
                    <span>{'{{Time}}'}</span>
                    <span>{'{{Duration}}'}</span>
                    <span>{'{{Description}}'}</span>
                  </div>
                </div>
                <footer>
                  <button onClick={() => setEditing(false)}>Cancel</button>
                  <button
                    onClick={() => {
                      setTemplate(draft);
                      setEditing(false);
                    }}
                  >
                    <CheckCircle2 />Save Changes
                  </button>
                </footer>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

