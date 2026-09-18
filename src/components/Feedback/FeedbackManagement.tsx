import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, MessageSquarePlus, Search, Star, X } from 'lucide-react';
import { useFeedback } from '../../context/FeedbackContext';
import { useSessions } from '../../context/SessionContext';
import { useTrainees } from '../../context/TraineeContext';
import { useAuth } from '../../context/AuthContext';
import { LdFeedbackRecord, ParticipantFeedbackResponse, TrainerFeedbackRecord } from '../../types/feedback';
import { FeedbackOrbit } from './FeedbackOrbit';
import { TraineeFeedbackRequests } from './TraineeFeedbackRequests';

type Tab = 'trainer' | 'trainee' | 'ld';
type SelectedFeedback = { type: Tab; record: TrainerFeedbackRecord | ParticipantFeedbackResponse | LdFeedbackRecord } | null;
const formatDate = (value: string) => new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value));

const RatingField: React.FC<{ label: string; value: number; onChange: (value: number) => void }> = ({ label, value, onChange }) => (
  <label className="feedback-rating-field"><span>{label}</span><select value={value} onChange={(event) => onChange(Number(event.target.value))}>{[5, 4.5, 4, 3.5, 3, 2.5, 2, 1.5, 1].map((rating) => <option key={rating} value={rating}>{rating.toFixed(1)}</option>)}</select></label>
);

export const FeedbackManagement: React.FC = () => {
  const { trainerFeedbacks, participantResponses, ldFeedbacks, addTrainerFeedback, addParticipantFeedback, addLdFeedback } = useFeedback();
  const { user } = useAuth();
  const { sessions } = useSessions();
  const { trainees } = useTrainees();
  const [tab, setTab] = useState<Tab>('trainer');
  const [search, setSearch] = useState('');
  const [sessionFilter, setSessionFilter] = useState('All');
  const [secondaryFilter, setSecondaryFilter] = useState('All');
  const [ratingFilter, setRatingFilter] = useState('All');
  const [addMode, setAddMode] = useState<Tab | 'choose' | null>(null);
  const [selected, setSelected] = useState<SelectedFeedback>(null);

  const eligibleSessions = useMemo(() => sessions.filter((session) => session.status === 'Completed' && session.attendanceApplicable !== false), [sessions]);
  const trainerCount = trainerFeedbacks.length;
  const traineeCount = participantResponses.filter((item) => item.status === 'Completed').length;
  const ldCount = ldFeedbacks.length;
  const ratings = [...trainerFeedbacks.map((item) => item.overallRating), ...participantResponses.filter((item) => item.status === 'Completed').map((item) => item.overallRating), ...ldFeedbacks.map((item) => item.overallRating)];
  const average = ratings.length ? (ratings.reduce((sum, value) => sum + value, 0) / ratings.length).toFixed(1) : '0.0';

  const filteredTrainer = trainerFeedbacks.filter((item) => {
    const session = eligibleSessions.find((value) => value.id === item.sessionId);
    const matchesSearch = `${item.employeeName || ''} ${item.trainerName}`.toLowerCase().includes(search.toLowerCase());
    return matchesSearch && (sessionFilter === 'All' || item.sessionId === sessionFilter)
      && (secondaryFilter === 'All' || (session?.learningTrack || 'Shared') === secondaryFilter)
      && (ratingFilter === 'All' || item.overallRating >= Number(ratingFilter));
  });
  const filteredTrainee = participantResponses.filter((item) => item.status === 'Completed' && `${item.participantName}`.toLowerCase().includes(search.toLowerCase())
    && (sessionFilter === 'All' || item.sessionId === sessionFilter)
    && (secondaryFilter === 'All' || item.trainerName === secondaryFilter)
    && (ratingFilter === 'All' || item.overallRating >= Number(ratingFilter)));
  const filteredLd = ldFeedbacks.filter((item) => `${item.sessionTitle} ${item.trainerName} ${item.reviewerName}`.toLowerCase().includes(search.toLowerCase())
    && (sessionFilter === 'All' || item.sessionId === sessionFilter)
    && (secondaryFilter === 'All' || item.track === secondaryFilter)
    && (ratingFilter === 'All' || item.overallRating >= Number(ratingFilter)));
  const tracks = Array.from(new Set(eligibleSessions.map((session) => session.learningTrack || 'Shared')));
  const trainers = Array.from(new Set(eligibleSessions.map((session) => session.trainerName).filter(Boolean))) as string[];
  const isLdAdmin = user?.role === 'LD_ADMIN' || !user;
  const availableTabs: Tab[] = user?.role === 'TRAINER' ? ['trainer'] : user?.role === 'TRAINEE' ? ['trainee'] : ['trainer', 'trainee', 'ld'];

  const changeTab = (next: Tab) => { setTab(next); setSearch(''); setSessionFilter('All'); setSecondaryFilter('All'); setRatingFilter('All'); };

  return <motion.main className="feedback-workspace page-container space-y-6" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
    {/* 1. UNIFIED PREMIUM HERO CARD WITH 3D ANIMATED ORBIT */}
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="unified-bootcamp-hero-card"
    >
      {/* LEFT SECTION: ANIMATED ORBIT */}
      <div className="hero-section-left">
        <FeedbackOrbit />
      </div>

      {/* CENTER SECTION: EYEBROW, TITLE & SUBTITLE */}
      <div className="hero-section-center">
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="hero-eyebrow-badge"
        >
          <span>L&amp;D LEARNING EXPERIENCE / FEEDBACK</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="hero-merged-title"
        >
          Feedback Management
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="hero-merged-subtitle"
        >
          Capture and review feedback from trainers, trainees, and the L&amp;D team across completed training sessions.
        </motion.p>
      </div>

      {/* RIGHT SECTION: ACTION BUTTON */}
      <div className="hero-section-right">
        <motion.div
          initial={{ opacity: 0, x: 14 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <button
            type="button"
            className="feedback-btn primary hero-action-btn"
            onClick={() => setAddMode(isLdAdmin ? 'choose' : user?.role === 'TRAINER' ? 'trainer' : 'trainee')}
          >
            <MessageSquarePlus size={16} /> Add Feedback
          </button>
        </motion.div>
      </div>
    </motion.div>

    <section className="feedback-mini-summary"><div><strong>{trainerCount}</strong><span>Trainer Feedback</span></div><div><strong>{traineeCount}</strong><span>Trainee Feedback</span></div>{isLdAdmin && <div><strong>{ldCount}</strong><span>L&amp;D Reviews</span></div>}<div><Star size={15}/><strong>{average}</strong><span>Average Rating</span></div></section>

    <section className="feedback-main-card">
      <div className="feedback-two-tabs">{availableTabs.includes('trainer') && <button className={tab === 'trainer' ? 'active' : ''} onClick={() => changeTab('trainer')}>Trainer Feedback <span>{trainerCount}</span></button>}{availableTabs.includes('trainee') && <button className={tab === 'trainee' ? 'active' : ''} onClick={() => changeTab('trainee')}>Trainee Feedback <span>{traineeCount}</span></button>}{availableTabs.includes('ld') && <button className={tab === 'ld' ? 'active' : ''} onClick={() => changeTab('ld')}>L&amp;D Feedback <span>{ldCount}</span></button>}</div>
      {tab === 'ld' ? <TraineeFeedbackRequests /> : <><div className="feedback-compact-filters"><label className="feedback-search"><Search size={15}/><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={tab === 'trainer' ? 'Search employee / trainer' : 'Search participant'}/></label><label className="feedback-select"><select value={sessionFilter} onChange={(event) => setSessionFilter(event.target.value)}><option value="All">All Sessions</option>{eligibleSessions.map((session) => <option key={session.id} value={session.id}>{session.title}</option>)}</select><ChevronDown size={14}/></label><label className="feedback-select"><select value={secondaryFilter} onChange={(event) => setSecondaryFilter(event.target.value)}><option value="All">{tab === 'trainee'?'All Trainers':'All Tracks'}</option>{(tab==='trainee'?trainers:tracks).map((value) => <option key={value}>{value}</option>)}</select><ChevronDown size={14}/></label><label className="feedback-select rating"><select value={ratingFilter} onChange={(event) => setRatingFilter(event.target.value)}><option value="All">All Ratings</option><option value="4.5">4.5+</option><option value="4">4.0+</option><option value="3">3.0+</option></select><ChevronDown size={14}/></label></div>

      <div className="feedback-table-wrap"><table className="feedback-compact-table"><thead>{tab === 'trainer' ? <tr><th>Employee</th><th>Session</th><th>Trainer</th><th>Track</th><th>Overall Rating</th><th>Date</th><th>Status</th><th>Action</th></tr> : <tr><th>Participant</th><th>Session</th><th>Trainer</th><th>Overall Rating</th><th>Date</th><th>Status</th><th>Action</th></tr>}</thead><tbody>
        {tab === 'trainer' ? filteredTrainer.map((item) => { const session = eligibleSessions.find((value) => value.id === item.sessionId); return <tr key={item.id}><td><strong>{item.employeeName || 'Session Group'}</strong><small>{item.employeeId || 'All participants'}</small></td><td>{item.sessionTitle}</td><td>{item.trainerName}</td><td>{session?.learningTrack || 'Shared'}</td><td><span className="feedback-rating"><Star size={13}/>{item.overallRating.toFixed(1)} / 5</span></td><td>{formatDate(item.submittedAt)}</td><td><span className="feedback-submitted">Submitted</span></td><td><button className="feedback-view-btn" onClick={() => setSelected({ type:'trainer', record:item })}>View Feedback</button></td></tr>; }) : filteredTrainee.map((item) => <tr key={item.id}><td><strong>{item.participantName}</strong><small>{item.employeeId}</small></td><td>{item.sessionTitle}</td><td>{item.trainerName}</td><td><span className="feedback-rating"><Star size={13}/>{item.overallRating.toFixed(1)} / 5</span></td><td>{formatDate(item.submittedAt)}</td><td><span className="feedback-submitted">Submitted</span></td><td><button className="feedback-view-btn" onClick={() => setSelected({ type:'trainee', record:item })}>View Feedback</button></td></tr>)}
        {((tab === 'trainer' && !filteredTrainer.length) || (tab === 'trainee' && !filteredTrainee.length)) && <tr><td className="feedback-empty-row" colSpan={9}>No feedback matches these filters.</td></tr>}
      </tbody></table></div></>}
    </section>

    <AnimatePresence>{addMode && <FeedbackFormModal mode={addMode} setMode={setAddMode} sessions={eligibleSessions} trainees={trainees} reviewerName={user?.name || 'L&D Reviewer'} onAddTrainer={addTrainerFeedback} onAddParticipant={addParticipantFeedback} onAddLd={addLdFeedback}/>}</AnimatePresence>
    <AnimatePresence>{selected && <FeedbackDrawer selected={selected} onClose={() => setSelected(null)}/>}</AnimatePresence>
  </motion.main>;
};

const FeedbackFormModal = ({ mode, setMode, sessions, trainees, reviewerName, onAddTrainer, onAddParticipant, onAddLd }: any) => {
  const [sessionId, setSessionId] = useState(sessions[0]?.id || ''); const [personId, setPersonId] = useState(trainees[0]?.id || '');
  const [ratings, setRatings] = useState([4.5,4.5,4.5,4.5,4.5,4.5,4.5]); const [comments, setComments] = useState(['','','','','']); const [recommend, setRecommend] = useState('Yes');
  const session = sessions.find((item:any) => item.id === sessionId); const person = trainees.find((item:any) => item.id === personId);
  const labels = mode === 'trainer' ? ['Technical Skills','Participation','Communication','Problem Solving','Learning Progress','Overall Rating'] : mode === 'trainee' ? ['Training Content','Trainer Effectiveness','Practical Relevance','Session Engagement','Training Pace','Overall Rating'] : ['Training Effectiveness','Trainer Performance','Participant Engagement','Content Quality','Session Management','Business Relevance','Overall Rating'];
  const commentLabels = mode === 'trainer' ? ['Strengths','Areas for Improvement','Trainer Comments'] : mode === 'trainee' ? ['Most Useful Part','What Could Be Improved','Additional Comments'] : ['What Went Well','Areas for Improvement','L&D Observations','Recommended Follow-up Action'];
  const save = (event:React.FormEvent) => { event.preventDefault(); if (!session || (mode !== 'ld' && !person)) return;
    if (mode === 'trainer') onAddTrainer({ sessionId:session.id, sessionTitle:session.title, trainingType:session.eventType, trainerId:session.trainerId || 'trainer', trainerName:session.trainerName || 'Assigned Trainer', feedbackMode:'INDIVIDUAL_EMPLOYEE', employeeId:person.employeeId, employeeName:person.name, engagementRating:ratings[1], understandingRating:ratings[4], effectivenessRating:ratings[2], paceRating:ratings[4], contentSuitabilityRating:ratings[0], technicalSkillRating:ratings[0], problemSolvingRating:ratings[3], overallRating:ratings[5], trainerComments:[comments[0],comments[1],comments[2]].filter(Boolean).join('\n'), recommendedFollowUp:comments[1] });
    else if (mode === 'trainee') onAddParticipant({ sessionId:session.id, sessionTitle:session.title, trainingType:session.eventType, track:session.learningTrack || 'Shared', participantId:person.id, participantName:person.name, employeeId:person.employeeId, trainerName:session.trainerName || 'Assigned Trainer', contentRating:ratings[0], trainerRating:ratings[1], relevanceRating:ratings[2], engagementRating:ratings[3], paceRating:ratings[4], overallRating:ratings[5], mostUsefulComment:comments[0], improvementComment:comments[1], additionalComments:comments[2], recommendSession:recommend, status:'Completed' });
    else onAddLd({ sessionId:session.id, sessionTitle:session.title, trainingType:session.eventType, track:session.learningTrack || 'Shared', trainerName:session.trainerName || 'Assigned Trainer', sessionDate:session.sessionDate, reviewerName, trainingEffectivenessRating:ratings[0], trainerPerformanceRating:ratings[1], participantEngagementRating:ratings[2], contentQualityRating:ratings[3], sessionManagementRating:ratings[4], businessRelevanceRating:ratings[5], overallRating:ratings[6], whatWentWell:comments[0], improvementAreas:comments[1], observations:comments[2], recommendedFollowUp:comments[3], followUpRequired:recommend, followUpNotes:comments[4] }); setMode(null); };
  return <div className="feedback-modal-backdrop" onMouseDown={() => setMode(null)}><motion.div className="feedback-form-modal" initial={{ opacity:0, scale:.97 }} animate={{ opacity:1, scale:1 }} onMouseDown={(event) => event.stopPropagation()}>{mode === 'choose' ? <><div className="feedback-modal-header"><div><span>ADD FEEDBACK</span><h2>Choose Feedback Type</h2></div><button onClick={() => setMode(null)}><X size={18}/></button></div><div className="feedback-type-choice three"><button onClick={() => setMode('trainer')}><strong>Trainer Feedback</strong><span>Trainer feedback about an employee after a completed session.</span></button><button onClick={() => setMode('trainee')}><strong>Trainee Feedback</strong><span>Participant feedback about the session and trainer.</span></button><button onClick={() => setMode('ld')}><strong>L&amp;D Feedback</strong><span>Internal session-quality review by the L&amp;D team.</span></button></div></> : <form onSubmit={save}><div className="feedback-modal-header"><div><span>{mode.toUpperCase()} FEEDBACK</span><h2>Add {mode === 'ld' ? 'L&D' : mode === 'trainer' ? 'Trainer' : 'Trainee'} Feedback</h2></div><button type="button" onClick={() => setMode(null)}><X size={18}/></button></div><div className="feedback-form-body"><div className="feedback-form-grid"><label><span>Completed Session</span><select value={sessionId} onChange={(event) => setSessionId(event.target.value)}>{sessions.map((item:any) => <option key={item.id} value={item.id}>{item.title}</option>)}</select></label>{mode === 'ld' ? <label><span>L&amp;D Reviewer</span><input value={reviewerName} readOnly /></label> : <label><span>{mode === 'trainer' ? 'Trainee / Employee' : 'Participant'}</span><select value={personId} onChange={(event) => setPersonId(event.target.value)}>{trainees.map((item:any) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>}</div><div className="feedback-rating-grid">{labels.map((label,index) => <RatingField key={label} label={label} value={ratings[index]} onChange={(value) => setRatings((prev) => prev.map((item,i) => i === index ? value : item))}/>)}</div>{commentLabels.map((label,index) => <label className="feedback-comment-field" key={label}><span>{label}</span><textarea rows={2} value={comments[index]} onChange={(event) => setComments((prev) => prev.map((item,i) => i === index ? event.target.value : item))}/></label>)}{mode !== 'trainer' && <label className="feedback-recommend"><span>{mode === 'ld' ? 'Follow-up Required' : 'Would Recommend'}</span><select value={recommend} onChange={(event) => setRecommend(event.target.value)}><option>Yes</option><option>No</option></select></label>}{mode === 'ld' && recommend === 'Yes' && <label className="feedback-comment-field"><span>Follow-up Notes</span><textarea rows={2} value={comments[4]} onChange={(event) => setComments((prev) => prev.map((item,i) => i === 4 ? event.target.value : item))}/></label>}</div><div className="feedback-modal-footer"><button type="button" className="feedback-btn secondary" onClick={() => setMode(null)}>Cancel</button><button className="feedback-btn primary" type="submit">{mode === 'trainer' ? 'Save Feedback' : 'Submit Feedback'}</button></div></form>}</motion.div></div>;
};

const FeedbackDrawer = ({ selected, onClose }: { selected: NonNullable<SelectedFeedback>; onClose:()=>void }) => { const item:any = selected.record; const trainer = selected.type === 'trainer'; const ld = selected.type === 'ld'; const breakdown = trainer ? [['Technical Skills',item.technicalSkillRating || item.contentSuitabilityRating],['Participation',item.engagementRating],['Communication',item.effectivenessRating],['Problem Solving',item.problemSolvingRating || item.understandingRating],['Learning Progress',item.understandingRating]] : ld ? [['Training Effectiveness',item.trainingEffectivenessRating],['Trainer Performance',item.trainerPerformanceRating],['Participant Engagement',item.participantEngagementRating],['Content Quality',item.contentQualityRating],['Session Management',item.sessionManagementRating],['Business Relevance',item.businessRelevanceRating]] : [['Training Content',item.contentRating],['Trainer Effectiveness',item.trainerRating],['Practical Relevance',item.relevanceRating],['Session Engagement',item.engagementRating],['Training Pace',item.paceRating]];
  return <div className="feedback-drawer-backdrop" onMouseDown={onClose}><motion.aside className="feedback-detail-drawer" initial={{ x:420 }} animate={{ x:0 }} exit={{ x:420 }} onMouseDown={(event) => event.stopPropagation()}><div className="feedback-drawer-header"><div><span>{trainer ? 'TRAINER' : 'TRAINEE'} FEEDBACK</span><h2>{trainer ? item.employeeName || 'Session Group' : item.participantName}</h2></div><button onClick={onClose}><X size={18}/></button></div><div className="feedback-drawer-body"><div className="feedback-detail-meta"><div><span>Session</span><strong>{item.sessionTitle}</strong></div><div><span>Trainer</span><strong>{item.trainerName}</strong></div><div><span>Date</span><strong>{formatDate(item.submittedAt)}</strong></div><div><span>Overall</span><strong className="drawer-rating"><Star size={14}/>{item.overallRating.toFixed(1)} / 5</strong></div></div><section><h3>Rating Breakdown</h3>{breakdown.map(([label,value]) => <div className="feedback-breakdown-row" key={label}><span>{label}</span><div><i style={{ width:`${(value/5)*100}%` }}/></div><strong>{Number(value).toFixed(1)}</strong></div>)}</section><section><h3>Comments</h3>{trainer ? <><div className="feedback-comment-box"><span>Trainer Comments</span><p>{item.trainerComments || 'No comments provided.'}</p></div>{item.recommendedFollowUp && <div className="feedback-comment-box"><span>Development Recommendation</span><p>{item.recommendedFollowUp}</p></div>}</> : <><div className="feedback-comment-box"><span>Most Useful Part</span><p>{item.mostUsefulComment || 'No comment provided.'}</p></div><div className="feedback-comment-box"><span>What Could Be Improved</span><p>{item.improvementComment || 'No comment provided.'}</p></div><div className="feedback-comment-box"><span>Additional Comments</span><p>{item.additionalComments || 'No comment provided.'}</p></div><div className="feedback-recommend-result">Would recommend: <strong>{item.recommendSession || '—'}</strong></div></>}</section></div></motion.aside></div>;
};
