import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  Sparkles,
  Search,
  CheckCircle2,
  AlertTriangle,
  Award,
  Layers,
  ArrowRight,
  Send,
  UserCheck,
  Zap,
  Target,
  Bot,
  Crown,
  Check,
  TrendingUp,
  Database,
  BarChart3,
  Route,
  UsersRound,
  ChevronLeft,
} from 'lucide-react';
import {
  skillIntelligenceService,
  TraineeTelemetryRecord,
  CopilotQueryResult,
} from '../../services/skillIntelligenceService';
import { useBootcamps } from '../../context/BootcampContext';

type SkillIntelligenceFeature =
  | 'copilot'
  | 'skill-matrix'
  | 'project-fit'
  | 'track-allocation'
  | 'cohort-coverage'
  | 'talent-snapshot';

const FEATURE_CONFIG: Array<{
  id: SkillIntelligenceFeature;
  title: string;
  description: string;
  action: string;
  icon: React.ElementType;
}> = [
  { id: 'copilot', title: 'AI Skill Copilot', description: 'Ask questions about trainees, skills, readiness and development areas.', action: 'Open Copilot', icon: Brain },
  { id: 'skill-matrix', title: 'Trainee Skill Matrix', description: 'Compare trainee proficiency across SQL, Python, Databricks, dbt, modeling and problem solving.', action: 'View Skill Matrix', icon: Layers },
  { id: 'project-fit', title: 'Project Fit Intelligence', description: 'Find the trainees whose skills best match a project requirement.', action: 'Find Project Match', icon: Target },
  { id: 'track-allocation', title: 'Track Allocation', description: 'Recommend the most suitable learning track using trainee performance evidence.', action: 'View Track Recommendations', icon: Route },
  { id: 'cohort-coverage', title: 'Cohort Skill Coverage', description: 'Understand cohort strengths, weaknesses and skill development priorities.', action: 'View Cohort Coverage', icon: BarChart3 },
  { id: 'talent-snapshot', title: 'Talent Snapshot', description: 'See project-ready trainees, top performers and trainees needing attention.', action: 'View Talent Snapshot', icon: UsersRound },
];

const getFeatureFromUrl = (): SkillIntelligenceFeature | null => {
  const requestedView = new URLSearchParams(window.location.search).get('view');
  return FEATURE_CONFIG.some((feature) => feature.id === requestedView)
    ? requestedView as SkillIntelligenceFeature
    : null;
};

export const SkillIntelligenceView: React.FC = () => {
  const { bootcamps } = useBootcamps();
  const openedFromHubRef = useRef(false);
  const [activeFeature, setActiveFeature] = useState<SkillIntelligenceFeature | null>(getFeatureFromUrl);

  const resetPageScroll = () => {
    document.querySelector<HTMLElement>('.shell-main-viewport')?.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  };

  const openFeature = (feature: SkillIntelligenceFeature) => {
    openedFromHubRef.current = true;
    window.history.pushState(null, '', `/skill-intelligence?view=${feature}`);
    setActiveFeature(feature);
  };

  const returnToHub = () => {
    if (openedFromHubRef.current) {
      openedFromHubRef.current = false;
      window.history.back();
      return;
    }
    window.history.replaceState(null, '', '/skill-intelligence');
    setActiveFeature(null);
  };

  useEffect(() => {
    const handlePopState = () => {
      openedFromHubRef.current = false;
      setActiveFeature(getFeatureFromUrl());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useLayoutEffect(resetPageScroll, [activeFeature]);

  // Centralized Single Source of Truth Datasets
  const readinessRanking = skillIntelligenceService.getOverallReadinessRanking();
  const projectMatches = skillIntelligenceService.getProjectFitRanking();
  const trackRecs = skillIntelligenceService.getTrackRecommendations();
  const cohortCoverageData = skillIntelligenceService.getCohortSkillCoverage();

  // Active Copilot Query
  const [copilotResponse, setCopilotResponse] = useState<CopilotQueryResult | null>(null);
  const [customInputText, setCustomInputText] = useState('');
  const [isCopilotThinking, setIsCopilotThinking] = useState(false);

  // Skill Matrix Filter state
  const [matrixSearch, setMatrixSearch] = useState('');
  const [selectedBootcampId, setSelectedBootcampId] = useState('All');
  const [selectedTrack, setSelectedTrack] = useState('All');

  // Project Matcher Animation State
  const [matchingStep, setMatchingStep] = useState<0 | 1 | 2 | 3>(0);

  // Tooltip State for Formula
  const [showFormulaTooltip, setShowFormulaTooltip] = useState(false);

  // Click suggestion handler
  const handleCopilotQuestion = (questionText: string) => {
    setIsCopilotThinking(true);
    setTimeout(() => {
      setIsCopilotThinking(false);
      const res = skillIntelligenceService.askCopilot(questionText);
      setCopilotResponse(res);
    }, 500);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customInputText.trim()) return;
    setIsCopilotThinking(true);
    setTimeout(() => {
      setIsCopilotThinking(false);
      const res = skillIntelligenceService.askCopilot(customInputText);
      setCopilotResponse(res);
      setCustomInputText('');
    }, 500);
  };

  // Run Talent Match animation trigger
  const runProjectMatch = () => {
    setMatchingStep(1);
    setTimeout(() => setMatchingStep(2), 350);
    setTimeout(() => setMatchingStep(3), 700);
  };

  // Matrix Heatmap Color Class Resolver
  const getHeatmapColorClass = (score: number) => {
    if (score >= 85) return 'ski-cell-strong'; // Strong (85-100)
    if (score >= 70) return 'ski-cell-proficient'; // Proficient (70-84)
    if (score >= 60) return 'ski-cell-developing'; // Developing (60-69)
    return 'ski-cell-gap'; // Needs Development (<60)
  };

  const filteredTrainees = readinessRanking.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(matrixSearch.toLowerCase()) ||
      p.employeeId.toLowerCase().includes(matrixSearch.toLowerCase());
    return matchesSearch;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
      className="skill-intelligence-page"
    >
      {!activeFeature ? (
        <>
      {/* 1. HERO SECTION WITH ANIMATED ORBIT NETWORK */}
      <section className="ski-hero-glass-card">
        <div className="ski-hero-left">
          <span className="ski-hero-badge">
            <Sparkles size={13} /> AI-Powered Talent Intelligence
          </span>
          <h1 className="ski-hero-title">Skill Intelligence</h1>
          <p className="ski-hero-subtitle">
            Turn trainee performance, skills and feedback into actionable talent decisions.
          </p>
        </div>

        {/* RIGHT: ANIMATED SKILL ORBIT NETWORK */}
        <div className="ski-hero-right-visual">
          <div className="ski-orbit-container">
            {/* Center Core */}
            <div className="ski-orbit-core">
              <Brain size={22} className="text-teal-700" />
              <span className="ski-core-title">SKILL CORE</span>
            </div>

            {/* SVG Orbit Ring */}
            <svg className="ski-orbit-svg" viewBox="0 0 300 300">
              <circle cx="150" cy="150" r="110" className="ski-orbit-path-1" />
              <circle cx="150" cy="150" r="65" className="ski-orbit-path-2" />
            </svg>

            {/* Skill rails keep every label in its own lane, even at narrow widths. */}
            <div className="ski-orbit-rail ski-orbit-rail-left" aria-label="Core technical skills">
              <div className="ski-orbit-node">SQL</div>
              <div className="ski-orbit-node">Modeling</div>
              <div className="ski-orbit-node">Communication</div>
              <div className="ski-orbit-node">Snowflake</div>
            </div>
            <div className="ski-orbit-rail ski-orbit-rail-right" aria-label="Applied technical skills">
              <div className="ski-orbit-node">Python</div>
              <div className="ski-orbit-node">Problem Solving</div>
              <div className="ski-orbit-node">Databricks</div>
              <div className="ski-orbit-node">dbt</div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. QUICK SUMMARY */}
      <section className="ski-hub-kpi-grid" aria-label="Skill intelligence quick summary">
        {/* KPI 1: Project Ready */}
        <motion.div whileHover={{ y: -2, scale: 1.01 }} transition={{ duration: 0.18 }} className="asm-kpi-card-box">
          <div className="kpi-card-header">
            <span className="kpi-label-text">PROJECT READY</span>
            <div className="kpi-icon-badge emerald">
              <UserCheck size={16} />
            </div>
          </div>
          <div className="kpi-num-display">
            {readinessRanking.filter((t) => t.readinessStatus === 'Project Ready').length}
          </div>
          <span className="kpi-desc-text">Qualified for deployment</span>
        </motion.div>

        {/* KPI 2: Strongest Skill */}
        <motion.div whileHover={{ y: -2, scale: 1.01 }} transition={{ duration: 0.18 }} className="asm-kpi-card-box">
          <div className="kpi-card-header">
            <span className="kpi-label-text">STRONGEST SKILL</span>
            <div className="kpi-icon-badge teal">
              <Award size={16} />
            </div>
          </div>
          <div className="kpi-num-display">SQL</div>
          <span className="kpi-desc-text">{cohortCoverageData.strongestArea.score}% cohort proficiency</span>
        </motion.div>

        {/* KPI 3: Critical Skill Gap */}
        <motion.div whileHover={{ y: -2, scale: 1.01 }} transition={{ duration: 0.18 }} className="asm-kpi-card-box">
          <div className="kpi-card-header">
            <span className="kpi-label-text text-rose">CRITICAL SKILL GAP</span>
            <div className="kpi-icon-badge rose">
              <AlertTriangle size={16} />
            </div>
          </div>
          <div className="kpi-num-display text-rose">dbt Core</div>
          <span className="kpi-desc-text">{cohortCoverageData.developmentPriority.score}% cohort proficiency</span>
        </motion.div>

        {/* KPI 4: Need Development */}
        <motion.div whileHover={{ y: -2, scale: 1.01 }} transition={{ duration: 0.18 }} className="asm-kpi-card-box">
          <div className="kpi-card-header">
            <span className="kpi-label-text">NEED DEVELOPMENT</span>
            <div className="kpi-icon-badge amber">
              <Target size={16} />
            </div>
          </div>
          <div className="kpi-num-display">
            {readinessRanking.filter((t) => t.readinessStatus === 'Needs Attention' || t.readinessStatus === 'At Risk').length}
          </div>
          <span className="kpi-desc-text">Requiring focused improvement</span>
        </motion.div>

      </section>

      <section className="ski-feature-launcher-section">
        <div className="ski-feature-launcher-heading">
          <h2>Explore Skill Intelligence</h2>
          <p>Choose an intelligence capability to explore.</p>
        </div>
        <div className="ski-feature-launcher-grid">
          {FEATURE_CONFIG.map((feature) => {
            const FeatureIcon = feature.icon;
            return (
              <button
                key={feature.id}
                type="button"
                className="ski-feature-launcher-card"
                onClick={() => openFeature(feature.id)}
              >
                <span className="ski-feature-icon"><FeatureIcon size={22} /></span>
                <span className="ski-feature-title">{feature.title}</span>
                <span className="ski-feature-description">{feature.description}</span>
                <span className="ski-feature-action">{feature.action} <ArrowRight size={15} /></span>
              </button>
            );
          })}
        </div>
      </section>
        </>
      ) : (
        <header className="ski-feature-detail-header">
          <button type="button" className="ski-feature-back-button" onClick={returnToHub}>
            <ChevronLeft size={16} /> Back to Skill Intelligence
          </button>
          <div className="ski-feature-detail-title-row">
            {(() => {
              const feature = FEATURE_CONFIG.find((item) => item.id === activeFeature)!;
              const FeatureIcon = feature.icon;
              return (
                <>
                  <span className="ski-feature-icon"><FeatureIcon size={22} /></span>
                  <div>
                    <h1>{feature.title}</h1>
                    <p>{feature.description}</p>
                  </div>
                </>
              );
            })()}
          </div>
        </header>
      )}

      {/* 3. MAIN INTELLIGENCE WORKSPACE (COPILOT + TALENT SNAPSHOT) */}
      {(activeFeature === 'copilot' || activeFeature === 'talent-snapshot') && (
      <section id="copilot-workspace" className={`ski-main-workspace-grid ski-single-feature-${activeFeature}`}>
        {/* LEFT: AI SKILL COPILOT */}
        {activeFeature === 'copilot' && (
        <div className="ski-copilot-card">
          <div className="ski-copilot-header">
            <div className="flex items-center gap-2">
              <Bot size={20} className="text-teal-700" />
              <div>
                <h3 className="ski-copilot-title">AI Skill Copilot</h3>
                <p className="ski-copilot-subtitle">
                  Ask questions about trainees, skills, project readiness and learning development.
                </p>
              </div>
            </div>
            <span className="ski-preview-boundary-tag">AI Integration Preview</span>
          </div>

          {/* AI NOTICE CHIP */}
          <div className="ski-ai-notice-banner">
            <Sparkles size={14} className="text-teal-700 flex-shrink-0" />
            <span>
              Responses currently use structured application data. OpenAI service connection will be added next.
            </span>
          </div>

          {/* CHAT DISPLAY BODY */}
          <div className="ski-copilot-chat-body">
            {!copilotResponse && !isCopilotThinking ? (
              <div className="ski-copilot-empty-state">
                <Brain size={40} className="text-teal-700 mb-2" />
                <h4 className="ski-empty-prompt-title">What would you like to know about your talent?</h4>
                <p className="ski-empty-prompt-sub">
                  Click any suggested question below or type a query to generate talent recommendations.
                </p>

                <div className="ski-suggestions-grid">
                  <button
                    type="button"
                    className="ski-suggestion-chip"
                    onClick={() => handleCopilotQuestion('Who is the top trainee?')}
                  >
                    Who is the top trainee?
                  </button>
                  <button
                    type="button"
                    className="ski-suggestion-chip"
                    onClick={() => handleCopilotQuestion('Who is best for a Databricks project?')}
                  >
                    Who is best for a Databricks project?
                  </button>
                  <button
                    type="button"
                    className="ski-suggestion-chip"
                    onClick={() => handleCopilotQuestion('Where does Kaviram Sudharajanainar Paramasivan need improvement?')}
                  >
                    Where does Kaviram Sudharajanainar Paramasivan need improvement?
                  </button>
                  <button
                    type="button"
                    className="ski-suggestion-chip"
                    onClick={() => handleCopilotQuestion('Who should move to DBT + Snowflake?')}
                  >
                    Who should move to DBT + Snowflake?
                  </button>
                  <button
                    type="button"
                    className="ski-suggestion-chip"
                    onClick={() => handleCopilotQuestion('Which skills are weakest across the cohort?')}
                  >
                    Which skills are weakest across the cohort?
                  </button>
                  <button
                    type="button"
                    className="ski-suggestion-chip"
                    onClick={() => handleCopilotQuestion('Who needs intervention?')}
                  >
                    Who needs intervention?
                  </button>
                </div>
              </div>
            ) : isCopilotThinking ? (
              <div className="ski-copilot-thinking-state">
                <Sparkles size={28} className="text-teal-700 animate-spin mb-2" />
                <span className="text-sm font-bold text-slate-800">Querying centralized telemetry service...</span>
              </div>
            ) : (
              <div className="ski-copilot-response-wrapper">
                <div className="ski-user-query-bubble">
                  <strong>Query:</strong> &ldquo;{copilotResponse?.question}&rdquo;
                </div>

                <div className="ski-response-card">
                  <h4 className="ski-response-headline">{copilotResponse?.headline}</h4>

                  {/* OVERALL DIVERGENCE CONTEXT IF PROJECT FIT DIFFERS */}
                  {copilotResponse?.overallDivergenceContext && (
                    <div className="text-xs text-amber-900 bg-amber-50 border border-amber-200 p-2.5 rounded-xl font-medium">
                      💡 <strong>Overall Readiness Context:</strong> {copilotResponse.overallDivergenceContext}
                    </div>
                  )}

                  <div className="ski-response-items-list">
                    {copilotResponse?.topMatches.map((item) => (
                      <div key={item.traineeId + item.rank} className="ski-response-item-box">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-teal-700 text-white font-bold text-xs flex items-center justify-center">
                              {item.avatarInitials}
                            </div>
                            <div className="flex flex-col">
                              <strong className="text-xs font-bold text-slate-900 leading-tight">{item.name}</strong>
                              <span className="text-[10px] text-slate-500">{item.employeeId} • {item.bootcampName}</span>
                            </div>
                          </div>
                          <span className="ski-match-percent-badge">
                            {item.primaryScore}% {item.scoreLabel}
                          </span>
                        </div>

                        <p className="text-xs text-slate-600 my-2 leading-relaxed">{item.summaryText}</p>

                        <div className="flex gap-2 flex-wrap mb-2">
                          {item.evidenceItems.map((ev, i) => (
                            <span key={i} className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-semibold border border-slate-200">
                              {ev.label}: <strong>{ev.value}</strong>
                            </span>
                          ))}
                        </div>

                        <div className="text-[11px] text-teal-800 bg-teal-50 border border-teal-200 p-2 rounded-lg">
                          <strong>Rationale:</strong> {item.whyRationale}
                        </div>

                        {item.gapAction && (
                          <div className="text-[11px] text-rose-800 bg-rose-50 border border-rose-200 p-2 rounded-lg mt-1">
                            <strong>Development Plan:</strong> {item.gapAction}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-200 pt-2 mt-2">
                    <span className="text-[10px] text-slate-400 font-semibold">
                      Data sources: {copilotResponse?.telemetrySources.join(' • ')}
                    </span>
                    <button
                      type="button"
                      className="text-xs text-teal-700 font-bold hover:underline"
                      onClick={() => setCopilotResponse(null)}
                    >
                      &larr; Ask Another Question
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* COMPOSER INPUT */}
          <form className="ski-copilot-composer" onSubmit={handleCustomSubmit}>
            <div className="ski-composer-input-wrapper">
              <Bot size={16} className="text-teal-700 flex-shrink-0" />
              <input
                type="text"
                className="ski-composer-field"
                placeholder="Ask Skill Intelligence about trainees, readiness or gaps..."
                value={customInputText}
                onChange={(e) => setCustomInputText(e.target.value)}
              />
              <button type="submit" className="ski-composer-send-btn">
                <Send size={14} />
              </button>
            </div>
            <div className="ski-composer-scope-sub">
              <span>Scope: Current Cohort (6 Trainees)</span>
            </div>
          </form>
        </div>
        )}

        {/* RIGHT: TALENT SNAPSHOT PANEL (REBUILT WITH 78px MINI CARDS & PERFECT ROW GRID) */}
        {activeFeature === 'talent-snapshot' && (
        <div className="ski-talent-snapshot-card">
          <div className="flex items-center justify-between relative">
            <div>
              <h3 className="ski-section-title">TALENT SNAPSHOT</h3>
              <p className="ski-section-subtitle">Cohort readiness distribution</p>
            </div>

            {/* SPARK / FORMULA TOOLTIP BUTTON */}
            <button
              type="button"
              className="w-8 h-8 rounded-full bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 hover:bg-teal-100 transition-colors"
              onClick={() => setShowFormulaTooltip(!showFormulaTooltip)}
              title="View readiness formula breakdown"
            >
              <Sparkles size={15} />
            </button>

            {showFormulaTooltip && (
              <div className="absolute right-0 top-10 bg-slate-900 text-white text-xs p-3.5 rounded-xl shadow-xl z-20 w-64 border border-slate-700">
                <strong className="text-teal-300 block mb-1">Overall Readiness Formula</strong>
                <ul className="space-y-1 text-[11px] text-slate-300 pl-3 list-disc">
                  <li>Assessment Performance (30%)</li>
                  <li>Trainer Feedback (25%)</li>
                  <li>Skill Proficiency (25%)</li>
                  <li>Attendance (10%)</li>
                  <li>Projects / Assignments (10%)</li>
                </ul>
              </div>
            )}
          </div>

          {/* 2x2 READINESS SUMMARY GRID (78px HEIGHT MINI CARDS) */}
          <div className="ski-summary-2x2-grid">
            <div className="ski-summary-mini-card emerald">
              <div className="ski-summary-left-stack">
                <span className="ski-summary-num">
                  {readinessRanking.filter((t) => t.readinessStatus === 'Project Ready').length}
                </span>
                <span className="ski-summary-lbl">PROJECT READY</span>
              </div>
              <div className="ski-summary-icon-box">
                <TrendingUp size={16} />
              </div>
            </div>

            <div className="ski-summary-mini-card teal">
              <div className="ski-summary-left-stack">
                <span className="ski-summary-num">
                  {readinessRanking.filter((t) => t.readinessStatus === 'On Track').length}
                </span>
                <span className="ski-summary-lbl">ON TRACK</span>
              </div>
              <div className="ski-summary-icon-box">
                <Check size={16} />
              </div>
            </div>

            <div className="ski-summary-mini-card amber">
              <div className="ski-summary-left-stack">
                <span className="ski-summary-num">
                  {readinessRanking.filter((t) => t.readinessStatus === 'Needs Attention').length}
                </span>
                <span className="ski-summary-lbl">NEEDS ATTENTION</span>
              </div>
              <div className="ski-summary-icon-box">
                <AlertTriangle size={16} />
              </div>
            </div>

            <div className="ski-summary-mini-card rose">
              <div className="ski-summary-left-stack">
                <span className="ski-summary-num">
                  {readinessRanking.filter((t) => t.readinessStatus === 'At Risk').length}
                </span>
                <span className="ski-summary-lbl">AT RISK</span>
              </div>
              <div className="ski-summary-icon-box">
                <AlertTriangle size={16} />
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 my-1" />

          {/* TOP READINESS PERFORMERS GRID ROWS */}
          <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Crown size={14} className="text-amber-500" /> TOP READINESS PERFORMERS
            </span>
          </h4>

          <div className="flex flex-col gap-2.5">
            {readinessRanking.slice(0, 3).map((p, idx) => {
              const isFirst = idx === 0;

              return (
                <div
                  key={p.traineeId}
                  className={`ski-performer-card-row ${isFirst ? 'rank-1' : ''}`}
                >
                  {/* COL 1: RANK */}
                  <div className="ski-rank-num-circle">
                    0{idx + 1}
                  </div>

                  {/* COL 2: AVATAR 46px + PULSE */}
                  <div className="ski-avatar-container-46">
                    {isFirst && <div className="ski-rank-1-orbit-pulse" />}
                    <div className="ski-avatar-circle-46">
                      {p.avatarInitials}
                    </div>
                  </div>

                  {/* COL 3: NAME, EMP ID, BOOTCAMP */}
                  <div className="ski-performer-id-stack">
                    <span className="ski-trainee-name-txt">{p.name}</span>
                    <span className="ski-trainee-empid-txt">{p.employeeId}</span>
                    <span className="ski-trainee-bootcamp-txt">{p.bootcampName}</span>
                  </div>

                  {/* COL 4: SCORE */}
                  <div className="ski-performer-score-bold">
                    {p.overallReadinessScore}%
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        )}
      </section>
      )}

      {/* 4. TRAINEE SKILL MATRIX SECTION */}
      {activeFeature === 'skill-matrix' && (
      <section id="skill-matrix-section" className="ski-section-card">
        <div className="ski-section-header">
          <div className="ski-section-title-group">
            <h3 className="ski-section-title">
              <Layers size={18} className="text-teal-700" /> Trainee Skill Matrix
            </h3>
            <span className="ski-section-subtitle">Comprehensive proficiency heatmap across 6 dimensions</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="search-input-wrapper h-9 min-w-[200px]">
              <Search size={14} className="text-teal-700" />
              <input
                type="text"
                className="asm-search-input-field text-xs"
                placeholder="Search trainee..."
                value={matrixSearch}
                onChange={(e) => setMatrixSearch(e.target.value)}
              />
            </div>

            <select
              className="asm-select-field h-9 text-xs"
              value={selectedBootcampId}
              onChange={(e) => setSelectedBootcampId(e.target.value)}
            >
              <option value="All">Bootcamp: All</option>
              {bootcamps.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>

            <select
              className="asm-select-field h-9 text-xs"
              value={selectedTrack}
              onChange={(e) => setSelectedTrack(e.target.value)}
            >
              <option value="All">Track: All</option>
              <option value="Common Foundation">Common Foundation</option>
              <option value="Databricks">Databricks</option>
              <option value="DBT & Snowflake">DBT &amp; Snowflake</option>
            </select>
          </div>
        </div>

        {/* MATRIX HEATMAP TABLE */}
        <div className="table-responsive-wrapper">
          <table className="asm-fixed-proportional-table ski-matrix-table">
            <thead>
              <tr>
                <th style={{ width: '28%' }}>TRAINEE</th>
                <th style={{ width: '12%' }}>SQL</th>
                <th style={{ width: '12%' }}>PYTHON</th>
                <th style={{ width: '12%' }}>DATABRICKS</th>
                <th style={{ width: '12%' }}>DBT</th>
                <th style={{ width: '12%' }}>MODELING</th>
                <th style={{ width: '12%' }}>PROB SOLVING</th>
              </tr>
            </thead>
            <tbody>
              {filteredTrainees.map((p) => (
                <tr
                  key={p.traineeId}
                  className="asm-table-row-item"
                >
                  {/* TRAINEE CELL (FLEX ALIGNED WITH TRUNCATION PREVENTING OVERFLOW) */}
                  <td>
                    <div className="flex items-center gap-3 min-w-0 pr-2 py-1">
                      <div className="w-9 h-9 rounded-full bg-[rgba(32,199,190,0.15)] border border-[rgba(32,199,190,0.3)] text-[var(--accent)] font-extrabold text-xs flex items-center justify-center shrink-0">
                        {p.avatarInitials}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <strong className="text-xs font-bold text-[var(--text-primary)] truncate leading-tight" title={p.name}>
                          {p.name}
                        </strong>
                        <span className="text-[11px] font-mono text-[var(--text-secondary)] mt-0.5">
                          {p.employeeId}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* SKILL CELLS */}
                  {['SQL', 'Python', 'Databricks', 'dbt', 'Modeling', 'Problem Solving'].map((skill) => {
                    const score = p.skills[skill as keyof typeof p.skills] || 60;
                    const heatClass = getHeatmapColorClass(score);

                    return (
                      <td key={skill} className={`ski-heatmap-cell ${heatClass}`}>
                        <div className="ski-cell-content">
                          <strong className="score-num">{score}%</strong>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* COMPACT PROFICIENCY SCALE LEGEND */}
        <div className="px-4 py-2.5 mt-3 border-t border-slate-100 bg-slate-50/80 rounded-xl flex items-center justify-between text-xs">
          <span className="font-bold text-slate-700">Proficiency Scale:</span>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 font-semibold text-slate-700">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Strong (85–100)
            </span>
            <span className="flex items-center gap-1.5 font-semibold text-slate-700">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-500 inline-block" /> Proficient (70–84)
            </span>
            <span className="flex items-center gap-1.5 font-semibold text-slate-700">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" /> Developing (60–69)
            </span>
            <span className="flex items-center gap-1.5 font-semibold text-slate-700">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-400 inline-block" /> Needs Development (&lt;60)
            </span>
          </div>
        </div>
      </section>
      )}

      {/* 5. PROJECT FIT INTELLIGENCE (340px LEFT + MINMAX RIGHT WORKSPACE) */}
      {activeFeature === 'project-fit' && (
      <section className="ski-section-card">
        <div className="ski-section-header">
          <div className="ski-section-title-group">
            <h3 className="ski-section-title">
              <Zap size={18} className="text-teal-700" /> Project Fit Intelligence
            </h3>
            <span className="ski-section-subtitle">Match trainee capabilities against project skill requirements</span>
          </div>
        </div>

        <div className="ski-project-fit-layout">
          {/* LEFT: PROJECT REQUIREMENT CARD */}
          <div className="ski-project-req-card">
            <div>
              <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wide block">TARGET PROJECT</span>
              <h4 className="text-base font-black text-slate-900 mt-1 mb-2">Azure Databricks Migration</h4>

              <div className="ski-req-skills-list">
                <div className="ski-req-skill-row">
                  <div className="ski-req-skill-header">
                    <span>Databricks</span>
                    <span className="ski-req-level-tag">High (35%)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-teal-700 h-full w-[95%]" />
                  </div>
                </div>

                <div className="ski-req-skill-row">
                  <div className="ski-req-skill-header">
                    <span>Python / PySpark</span>
                    <span className="ski-req-level-tag">High (25%)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-teal-700 h-full w-[88%]" />
                  </div>
                </div>

                <div className="ski-req-skill-row">
                  <div className="ski-req-skill-header">
                    <span>SQL Architecture</span>
                    <span className="ski-req-level-tag">High (20%)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-teal-700 h-full w-[80%]" />
                  </div>
                </div>

                <div className="ski-req-skill-row">
                  <div className="ski-req-skill-header">
                    <span>Data Modeling</span>
                    <span className="ski-req-level-tag text-slate-500">Medium (12%)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-slate-500 h-full w-[60%]" />
                  </div>
                </div>
              </div>
            </div>

            <button
              type="button"
              className="create-asm-primary-btn w-full justify-center"
              onClick={runProjectMatch}
            >
              <Zap size={16} />
              {matchingStep === 1
                ? 'Analyzing Talent...'
                : matchingStep === 2
                  ? 'Evaluating Readiness...'
                  : '⚡ Run Talent Match'}
            </button>
          </div>

          {/* RIGHT: BEST PROJECT MATCHES CARDS */}
          <div className="grid grid-cols-2 gap-4 align-start">
            {projectMatches.slice(0, 2).map((m, idx) => (
              <div key={m.traineeId} className="ski-candidate-fit-card">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-400">#{idx + 1} MATCH</span>
                    <span className="text-xs font-black text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-200">
                      {m.projectFitScore}% FIT
                    </span>
                  </div>

                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-teal-700 text-white font-black text-sm flex items-center justify-center">
                      {m.avatarInitials}
                    </div>
                    <div className="flex flex-col">
                      <h4 className="text-base font-black text-slate-900 m-0 leading-tight">{m.name}</h4>
                      <span className="text-xs text-slate-500">{m.employeeId} • {m.bootcampName}</span>
                    </div>
                  </div>

                  <div className="space-y-3 text-xs border-t border-slate-100 pt-3">
                    <div>
                      <span className="font-bold text-slate-700 block mb-1">STRONG MATCHES</span>
                      <div className="ski-strong-match-list">
                        {m.strongMatches.map((sm) => (
                          <div key={sm.skill} className="ski-strong-match-row">
                            <span>{sm.skill}</span>
                            <strong>{sm.score}%</strong>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="ski-development-gap-row">
                      <span className="font-bold text-slate-700 block mb-1">DEVELOPMENT GAP</span>
                      <strong>{m.developmentGap}</strong>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  className="card-view-link-btn pt-2 border-t border-slate-100"
                >
                  View Candidate &rarr;
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* 6. TRACK ALLOCATION INTELLIGENCE (REBUILT COMPACT CARDS, NO HUGE EMPTY SPACE) */}
      {activeFeature === 'track-allocation' && (
      <section className="ski-track-section-card">
        <div className="ski-section-header">
          <div className="ski-section-title-group">
            <h3 className="ski-section-title">
              <Target size={18} className="text-teal-700" /> Track Allocation Intelligence
            </h3>
            <span className="ski-section-subtitle">Support L&amp;D track decisions after common foundation</span>
          </div>

          {/* TWO SEPARATE PILL BADGES */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-teal-700 bg-teal-50 border border-teal-200 px-2.5 py-1 rounded-xl">
              AI Recommendation
            </span>
            <span className="text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-xl">
              L&amp;D Decision Required
            </span>
          </div>
        </div>

        {/* 2-COLUMN TRACK RECOMMENDATION GRID */}
        <div className="ski-track-grid-2col">
          {trackRecs.slice(0, 2).map((rec) => (
            <div key={rec.traineeId} className="ski-track-recommendation-card">
              {/* IDENTITY HEADER (GRID: 48px minmax(0, 1fr) auto) */}
              <div className="ski-track-identity-header">
                <div className="ski-track-avatar-48">
                  {rec.avatarInitials}
                </div>

                <div className="ski-track-name-stack">
                  <span className="ski-track-trainee-name">{rec.name}</span>
                  <span className="ski-track-trainee-empid">{rec.employeeId}</span>
                </div>

                {/* SVG CONFIDENCE RING WIDGET (62px) */}
                <div className="ski-confidence-ring-widget">
                  <div className="ski-confidence-svg-box">
                    <svg className="w-10 h-10 transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-teal-100 stroke-current"
                        strokeWidth="3.5"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="text-teal-700 stroke-current"
                        strokeWidth="3.5"
                        strokeDasharray={`${rec.confidence}, 100`}
                        strokeLinecap="round"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <span className="ski-confidence-percent-center">{rec.confidence}%</span>
                  </div>
                  <div className="ski-confidence-lbl-stack">
                    <span className="ski-confidence-lbl-txt">Confidence</span>
                    <span className="ski-confidence-badge-txt">AI Verified</span>
                  </div>
                </div>
              </div>

              {/* RECOMMENDED TRACK HIGHLIGHT PANEL */}
              <div className="ski-recommended-track-panel">
                <span className="ski-rec-track-title-lbl">RECOMMENDED TRACK</span>
                <h4 className="ski-rec-track-name-heading">
                  <Database size={16} className="text-teal-700" /> {rec.recommendedTrack}
                </h4>
              </div>

              {/* EVIDENCE SKILL PROGRESS ROWS */}
              <div className="ski-evidence-section">
                <span className="ski-evidence-title">WHY THIS TRACK (EVIDENCE)</span>
                {rec.evidence.map((ev) => (
                  <div key={ev.skill} className="ski-evidence-skill-item">
                    <div className="ski-evidence-skill-header">
                      <span>{ev.skill}</span>
                      <strong className="text-teal-800">{ev.score}%</strong>
                    </div>
                    <div className="ski-evidence-bar-track">
                      <div className="ski-evidence-bar-fill" style={{ width: `${ev.score}%` }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* ALTERNATIVE TRACK */}
              <div className="ski-alternative-track-box">
                ALTERNATIVE TRACK: <strong>{rec.alternative}</strong>
              </div>

              {/* CARD FOOTER WITH BUTTON */}
              <div className="ski-track-card-footer">
                <span className="ski-verified-chip-badge">
                  <CheckCircle2 size={12} /> Verified
                </span>
                <button
                  type="button"
                  className="ui-button-secondary py-1.5 px-3 text-xs"
                >
                  Review Recommendation &rarr;
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
      )}

      {/* 7. COHORT SKILL COVERAGE & INSIGHTS (TWO COLUMNS) */}
      {activeFeature === 'cohort-coverage' && (
      <section className="ski-cohort-intelligence-layout">
        {/* LEFT COL: SKILL COVERAGE */}
        <div className="ski-section-card">
          <div className="ski-section-header">
            <div className="ski-section-title-group">
              <h3 className="ski-section-title">
                <Brain size={18} className="text-teal-700" /> Cohort Skill Coverage
              </h3>
              <span className="ski-section-subtitle">Average cohort proficiency across core competency dimensions</span>
            </div>
          </div>

          <div className="flex flex-col">
            {cohortCoverageData.coverage.map((item) => (
              <div key={item.skillName} className="ski-skill-bar-row-item">
                <div className="ski-skill-bar-header">
                  <span className="ski-skill-title-txt">{item.skillName}</span>
                  <span className="ski-skill-score-percent">{item.avgScore}%</span>
                </div>

                <div className="ski-skill-progress-container">
                  <div
                    className={`ski-skill-progress-fill ${item.avgScore >= 85
                        ? 'strong'
                        : item.avgScore >= 70
                          ? 'proficient'
                          : item.avgScore >= 60
                            ? 'developing'
                            : 'gap'
                      }`}
                    style={{ width: `${item.avgScore}%` }}
                  />
                </div>

                <span
                  className={`ski-skill-level-badge ${item.avgScore >= 85
                      ? 'strong'
                      : item.avgScore >= 70
                        ? 'proficient'
                        : item.avgScore >= 60
                          ? 'developing'
                          : 'gap'
                    }`}
                >
                  {item.classification.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT COL: COHORT INTELLIGENCE CARD */}
        <div className="ski-section-card flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold text-teal-700 bg-teal-50 border border-teal-200 px-2.5 py-1 rounded uppercase">
              System Recommendation
            </span>
            <h3 className="ski-section-title mt-2 mb-3">Cohort Intelligence</h3>

            <div className="space-y-3 text-xs">
              <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl">
                <span className="font-bold text-emerald-900 block mb-0.5">STRONGEST SKILL</span>
                <span className="text-slate-800 font-bold block">{cohortCoverageData.strongestArea.name}</span>
                <span className="text-emerald-700 font-black text-base">{cohortCoverageData.strongestArea.score}% Avg</span>
              </div>

              <div className="bg-rose-50 border border-rose-200 p-3.5 rounded-xl">
                <span className="font-bold text-rose-900 block mb-0.5">DEVELOPMENT PRIORITY</span>
                <span className="text-slate-800 font-bold block">{cohortCoverageData.developmentPriority.name}</span>
                <span className="text-rose-700 font-black text-base">{cohortCoverageData.developmentPriority.score}% Avg</span>
              </div>

              <div className="bg-teal-50 border border-teal-200 p-3.5 rounded-xl">
                <span className="font-bold text-teal-900 block mb-0.5">RECOMMENDED L&amp;D ACTION</span>
                <span className="text-slate-700 leading-relaxed block">
                  {cohortCoverageData.recommendedAction}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            className="ui-button-secondary w-full justify-center mt-4"
          >
            View Development Strategy &rarr;
          </button>
        </div>
      </section>
      )}

    </motion.div>
  );
};
