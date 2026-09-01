import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Award,
  Sparkles,
  Search,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ArrowRight,
  Send,
  UserCheck,
  Zap,
  Target,
  X,
  Bot,
  Brain,
  Crown,
  HelpCircle,
  Check,
  FileCheck,
  Database,
  Calendar,
  MoreVertical,
  BookOpen,
  ChevronRight,
  ShieldCheck,
  Clock,
  Briefcase,
  FileText,
  Filter,
} from 'lucide-react';
import {
  certificationIntelligenceService,
  CertificationCatalogItem,
  TraineeCertificationRecommendation,
  CertifiedTraineeRecord,
  CertificationCopilotResult,
} from '../../services/certificationIntelligenceService';
import { CertificationDetailsModal } from './CertificationDetailsModal';
import { useBootcamps } from '../../context/BootcampContext';

export const CertificationIntelligenceView: React.FC = () => {
  const { bootcamps } = useBootcamps();

  // Navigation Tabs state
  const [activeTab, setActiveTab] = useState<'overview' | 'recommendations' | 'tracker' | 'certified'>('overview');

  // Centralized Datasets
  const catalog = certificationIntelligenceService.getCertificationCatalog();
  const recommendations = certificationIntelligenceService.getCertificationRecommendations();
  const certifiedTalent = certificationIntelligenceService.getCertifiedTalent();
  const trackerItems = certificationIntelligenceService.getCertificationTracker();
  const gapAnalysis = certificationIntelligenceService.getCertificationGapAnalysis();

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBootcampFilter, setSelectedBootcampFilter] = useState('All');
  const [selectedCertFilter, setSelectedCertFilter] = useState('All');
  const [selectedReadinessFilter, setSelectedReadinessFilter] = useState('All');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('All');

  // Drawer / Modal States
  const [selectedCertForDrawer, setSelectedCertForDrawer] = useState<CertificationCatalogItem | null>(null);
  const [selectedReadinessTrainee, setSelectedReadinessTrainee] = useState<string | null>(null);
  const [updateStatusModalItem, setUpdateStatusModalItem] = useState<any | null>(null);

  // Copilot State
  const [copilotResponse, setCopilotResponse] = useState<CertificationCopilotResult | null>(null);
  const [customCopilotInput, setCustomCopilotInput] = useState('');
  const [isCopilotThinking, setIsCopilotThinking] = useState(false);

  // Status Modal Form State
  const [newStatus, setNewStatus] = useState('READY TO SCHEDULE');
  const [newExamDate, setNewExamDate] = useState('2026-09-15');
  const [newResultScore, setNewResultScore] = useState('880');
  const [newCredentialId, setNewCredentialId] = useState('MS-CERT-992014');
  const [newCredentialDate, setNewCredentialDate] = useState('2026-09-15');
  const [newExpiryDate, setNewExpiryDate] = useState('2027-09-15');
  const [newNotes, setNewNotes] = useState('Candidate completed all prerequisite labs and mock drills with 85%+ score.');

  const handleCopilotQuery = (queryText: string) => {
    setIsCopilotThinking(true);
    setTimeout(() => {
      setIsCopilotThinking(false);
      const res = certificationIntelligenceService.askCertificationCopilot(queryText);
      setCopilotResponse(res);
    }, 450);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customCopilotInput.trim()) return;
    setIsCopilotThinking(true);
    setTimeout(() => {
      setIsCopilotThinking(false);
      const res = certificationIntelligenceService.askCertificationCopilot(customCopilotInput);
      setCopilotResponse(res);
      setCustomCopilotInput('');
    }, 450);
  };

  // Filtered Recommendations
  const filteredRecommendations = recommendations.filter((r) => {
    const matchesSearch =
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCert = selectedCertFilter === 'All' || r.examCode === selectedCertFilter;
    const matchesReadiness = selectedReadinessFilter === 'All' || r.readinessLevel === selectedReadinessFilter;
    return matchesSearch && matchesCert && matchesReadiness;
  });

  const recommendationSummary = {
    total: filteredRecommendations.length,
    ready: filteredRecommendations.filter((r) => r.readinessLevel === 'READY TO SCHEDULE').length,
    preparing: filteredRecommendations.filter((r) => r.readinessLevel === 'PREPARING').length,
    highMatch: filteredRecommendations.filter((r) => r.matchScore >= 88).length,
  };

  // Filtered Tracker Items
  const filteredTrackerItems = trackerItems.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCert = selectedCertFilter === 'All' || t.examCode === selectedCertFilter;
    const matchesStatus = selectedStatusFilter === 'All' || t.status === selectedStatusFilter;
    return matchesSearch && matchesCert && matchesStatus;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
      className="certification-intelligence-page"
    >
      {/* 1. TOP HERO GLASS CARD WITH ANIMATED JOURNEY */}
      <section className="crt-hero-glass-card">
        <div className="ski-hero-left">
          <span className="crt-hero-badge">
            <Award size={13} /> MICROSOFT CREDENTIAL INTELLIGENCE
          </span>
          <h1 className="ski-hero-title">Certification Intelligence</h1>
          <p className="ski-hero-subtitle">
            Match trainee capabilities to Microsoft credentials, track readiness and guide certification journeys.
          </p>

          <div className="ski-hero-actions">
            <button
              type="button"
              className="ski-hero-btn-primary"
              onClick={() => setActiveTab('recommendations')}
            >
              <Zap size={16} /> Explore Credentials
            </button>
            <button
              type="button"
              className="ski-hero-btn-secondary"
              onClick={() => setActiveTab('certified')}
            >
              <Award size={16} /> View Certified Talent
            </button>
          </div>
        </div>

        {/* RIGHT VISUAL: ANIMATED CERTIFICATION ORBIT */}
        <div className="crt-journey-visual-box">
          <div className="crt-journey-core-badge">
            <Award size={26} className="text-teal-700" />
            <span className="crt-journey-core-title">MICROSOFT</span>
          </div>

          <svg className="crt-journey-path-svg" viewBox="0 0 320 220">
            <circle cx="160" cy="110" r="85" className="ski-orbit-path-1" />
            <circle cx="160" cy="110" r="50" className="ski-orbit-path-2" />
          </svg>

          <div className="crt-journey-node n1">DP-700</div>
          <div className="crt-journey-node n2">DP-750</div>
          <div className="crt-journey-node n3">DP-600</div>
          <div className="crt-journey-node n4">AZURE</div>
        </div>
      </section>

      {/* 2. 5 EQUAL KPI CARDS */}
      <section className="asm-kpi-cards-5row">
        {/* KPI 1: Certified */}
        <motion.div whileHover={{ y: -3, scale: 1.01 }} transition={{ duration: 0.18 }} className="asm-kpi-card-box">
          <div className="kpi-card-header">
            <span className="kpi-label-text">CERTIFIED</span>
            <div className="kpi-icon-badge emerald">
              <Award size={16} />
            </div>
          </div>
          <div className="kpi-num-display">2</div>
          <span className="kpi-desc-text">Completed credentials</span>
        </motion.div>

        {/* KPI 2: Preparing */}
        <motion.div whileHover={{ y: -3, scale: 1.01 }} transition={{ duration: 0.18 }} className="asm-kpi-card-box">
          <div className="kpi-card-header">
            <span className="kpi-label-text">PREPARING</span>
            <div className="kpi-icon-badge teal">
              <BookOpen size={16} />
            </div>
          </div>
          <div className="kpi-num-display">3</div>
          <span className="kpi-desc-text">Active preparation</span>
        </motion.div>

        {/* KPI 3: Exam Scheduled */}
        <motion.div whileHover={{ y: -3, scale: 1.01 }} transition={{ duration: 0.18 }} className="asm-kpi-card-box">
          <div className="kpi-card-header">
            <span className="kpi-label-text">EXAM SCHEDULED</span>
            <div className="kpi-icon-badge indigo">
              <Calendar size={16} />
            </div>
          </div>
          <div className="kpi-num-display">1</div>
          <span className="kpi-desc-text">Upcoming exam</span>
        </motion.div>

        {/* KPI 4: Certification Ready */}
        <motion.div whileHover={{ y: -3, scale: 1.01 }} transition={{ duration: 0.18 }} className="asm-kpi-card-box">
          <div className="kpi-card-header">
            <span className="kpi-label-text">CERTIFICATION READY</span>
            <div className="kpi-icon-badge emerald">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div className="kpi-num-display">2</div>
          <span className="kpi-desc-text">Above 85% readiness threshold</span>
        </motion.div>

        {/* KPI 5: Need Development */}
        <motion.div whileHover={{ y: -3, scale: 1.01 }} transition={{ duration: 0.18 }} className="asm-kpi-card-box">
          <div className="kpi-card-header">
            <span className="kpi-label-text text-rose">NEED DEVELOPMENT</span>
            <div className="kpi-icon-badge rose">
              <AlertTriangle size={16} />
            </div>
          </div>
          <div className="kpi-num-display text-rose">2</div>
          <span className="kpi-desc-text">Not yet exam ready</span>
        </motion.div>
      </section>

      {/* 3. PRIMARY NAVIGATION TABS WITH ACTIVE INDICATOR */}
      <div className="crt-tabs-bar">
        <button
          type="button"
          className={`crt-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <Layers size={16} /> Overview
        </button>
        <button
          type="button"
          className={`crt-tab-btn ${activeTab === 'recommendations' ? 'active' : ''}`}
          onClick={() => setActiveTab('recommendations')}
        >
          <Zap size={16} /> Recommendations
        </button>
        <button
          type="button"
          className={`crt-tab-btn ${activeTab === 'tracker' ? 'active' : ''}`}
          onClick={() => setActiveTab('tracker')}
        >
          <FileCheck size={16} /> Certification Tracker
        </button>
        <button
          type="button"
          className={`crt-tab-btn ${activeTab === 'certified' ? 'active' : ''}`}
          onClick={() => setActiveTab('certified')}
        >
          <Award size={16} /> Certified Talent
        </button>
      </div>

      {/* =========================================================================
          TAB 1: OVERVIEW
          ========================================================================= */}
      {activeTab === 'overview' && (
        <div className="space-y-6 crt-overview-layout">
          {/* CERTIFICATION CATALOG PORTFOLIO (3-COLUMN GRID) */}
          <section className="ski-section-card crt-portfolio-section">
            <div className="ski-section-header">
              <div className="ski-section-title-group">
                <h3 className="ski-section-title">
                  <Award size={18} className="text-teal-700" /> Microsoft Certification Portfolio
                </h3>
                <span className="ski-section-subtitle">Official Microsoft Data &amp; Analytics Credentials</span>
              </div>
            </div>

            <div className="crt-portfolio-grid">
              {catalog.map((cert) => (
                <div key={cert.id} className="crt-portfolio-card">
                  <div className="crt-card-top-content">
                    {/* TOP META ROW */}
                    <div className="crt-card-meta-header">
                      <span className="crt-vendor-badge">{cert.product}</span>
                      <span className="crt-exam-code-pill">{cert.examCode}</span>
                    </div>

                    <h4 className="crt-card-title">{cert.title}</h4>
                    <span className="crt-role-line">{cert.role} • {cert.level}</span>

                    <p className="crt-card-desc">{cert.description}</p>

                    {/* CAPABILITY SKILL CHIPS */}
                    <div className="crt-skills-chip-row">
                      {cert.capabilityAreas.map((cap) => (
                        <span key={cap} className="crt-skill-tag-chip">
                          {cap}
                        </span>
                      ))}
                    </div>

                    {/* MATCH SUMMARY (4 DISTINCT STAT TILES) */}
                    <div className="crt-match-stats-grid">
                      <div className="crt-stat-tile">
                        <span className="crt-stat-label">Matched</span>
                        <strong className="crt-stat-value text-slate">4 Trainees</strong>
                      </div>
                      <div className="crt-stat-tile">
                        <span className="crt-stat-label">Ready</span>
                        <strong className="crt-stat-value text-teal">2 Trainees</strong>
                      </div>
                      <div className="crt-stat-tile">
                        <span className="crt-stat-label">Preparing</span>
                        <strong className="crt-stat-value text-amber">1 Trainee</strong>
                      </div>
                      <div className="crt-stat-tile">
                        <span className="crt-stat-label">Certified</span>
                        <strong className="crt-stat-value text-emerald">1 Certified</strong>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="crt-view-cert-btn"
                    onClick={() => setSelectedCertForDrawer(cert)}
                  >
                    View Certification &rarr;
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* CERTIFICATION COPILOT + RESPONSIVE QUICK INTELLIGENCE */}
          <section className="crt-intelligence-workspace">
            <div className="ski-copilot-card crt-copilot-panel">
              <div className="ski-copilot-header crt-copilot-header">
                <div className="flex items-center gap-2">
                  <Bot size={20} className="text-teal-700" />
                  <div>
                    <h3 className="ski-copilot-title">Certification Copilot</h3>
                    <p className="ski-copilot-subtitle">
                      Ask about certification readiness, credential matching and development gaps.
                    </p>
                  </div>
                </div>
                <span className="ski-preview-boundary-tag">● Intelligence Online</span>
              </div>

              {/* CHAT DISPLAY BODY */}
              <div className="ski-copilot-chat-body crt-copilot-chat-body">
                {!copilotResponse && !isCopilotThinking ? (
                  <div className="ski-copilot-empty-state">
                    <div className="crt-copilot-hero-icon"><Award size={25} /></div>
                    <h4 className="ski-empty-prompt-title">How can I assist with certification planning?</h4>
                    <p className="ski-empty-prompt-sub">
                      Click a suggested question below or type a query to evaluate exam readiness.
                    </p>

                    <div className="crt-copilot-questions-grid">
                      <button
                        type="button"
                        className="crt-copilot-question-card"
                        onClick={() => handleCopilotQuery('Who is ready for DP-700?')}
                      >
                        <span>Who is ready for DP-700?</span><ChevronRight size={15} />
                      </button>
                      <button
                        type="button"
                        className="crt-copilot-question-card"
                        onClick={() => handleCopilotQuery('Which certification is best for Kaviram?')}
                      >
                        <span>Which certification is best for Kaviram?</span><ChevronRight size={15} />
                      </button>
                      <button
                        type="button"
                        className="crt-copilot-question-card"
                        onClick={() => handleCopilotQuery('Who has completed certifications?')}
                      >
                        <span>Who has completed certifications?</span><ChevronRight size={15} />
                      </button>
                      <button
                        type="button"
                        className="crt-copilot-question-card"
                        onClick={() => handleCopilotQuery('Which trainees need more preparation?')}
                      >
                        <span>Which trainees need more preparation?</span><ChevronRight size={15} />
                      </button>
                    </div>
                  </div>
                ) : isCopilotThinking ? (
                  <div className="ski-copilot-thinking-state">
                    <span className="text-sm font-bold text-slate-800">Analyzing trainee evidence against certification standards...</span>
                  </div>
                ) : (
                  <div className="ski-copilot-response-wrapper">
                    <div className="ski-user-query-bubble">
                      <strong>Query:</strong> &ldquo;{copilotResponse?.question}&rdquo;
                    </div>

                    <div className="ski-response-card crt-copilot-response-card">
                      <h4 className="ski-response-headline">{copilotResponse?.headline}</h4>
                      <p className="crt-copilot-response-summary">{copilotResponse?.summaryText}</p>

                      <div className="crt-copilot-results-grid">
                        {copilotResponse?.results.map((r) => {
                          const certificationTitle = catalog.find((cert) => cert.examCode === r.examCode)?.title || r.examCode;
                          const developmentGap = r.gapAction?.startsWith('Development Focus:')
                            ? r.gapAction.replace('Development Focus:', '').trim()
                            : 'No critical readiness gap identified';
                          const nextAction = r.gapAction || r.statusBadge;

                          return (
                          <div key={r.traineeName + r.rank} className="crt-copilot-result-card">
                            <div className="crt-copilot-result-header">
                              <div className="crt-copilot-result-person">
                                <div className="crt-copilot-result-avatar">{r.avatarInitials}</div>
                                <div className="crt-copilot-result-identity">
                                  <strong>{r.traineeName}</strong>
                                  <span>{r.employeeId}</span>
                                </div>
                              </div>
                              <div className="crt-copilot-result-score">
                                <strong>{r.score}%</strong><span>{r.scoreLabel}</span>
                              </div>
                            </div>

                            <div className="crt-copilot-certification-row">
                              <Award size={15} />
                              <div><span>{r.examCode}</span><strong>{certificationTitle}</strong></div>
                            </div>

                            <div className="crt-copilot-result-details">
                              <div>
                                <span className="crt-result-detail-label">Strengths &amp; evidence</span>
                                <div className="crt-result-evidence-list">
                                  {r.evidence.map((ev, i) => <span key={i}>{ev}</span>)}
                                </div>
                              </div>
                              <div>
                                <span className="crt-result-detail-label">Development gap</span>
                                <p>{developmentGap}</p>
                              </div>
                            </div>

                            <div className="crt-copilot-next-action">
                              <Target size={14} /><span><strong>Recommended next action</strong>{nextAction}</span>
                            </div>
                          </div>
                          );
                        })}
                      </div>

                      <button
                        type="button"
                        className="text-xs text-teal-700 font-bold hover:underline mt-2 self-end"
                        onClick={() => setCopilotResponse(null)}
                      >
                        &larr; Ask Another Question
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* COMPOSER INPUT */}
              <form className="ski-copilot-composer crt-copilot-composer" onSubmit={handleCustomSubmit}>
                <div className="ski-composer-input-wrapper crt-copilot-input-bar">
                  <Bot size={16} className="text-teal-700 flex-shrink-0" />
                  <input
                    type="text"
                    className="ski-composer-field"
                    placeholder="Ask about certification readiness, exam booking or gaps..."
                    value={customCopilotInput}
                    onChange={(e) => setCustomCopilotInput(e.target.value)}
                  />
                  <button type="submit" className="ski-composer-send-btn crt-copilot-send-button" aria-label="Send certification query">
                    <Send size={14} />
                  </button>
                </div>
              </form>
            </div>

            <div className="crt-insights-section">
              <div className="crt-insights-heading">
                <div>
                  <span>CERTIFICATION INSIGHTS</span>
                  <h3>Quick Intelligence</h3>
                </div>
                <p>Credential readiness and exam planning at a glance.</p>
              </div>

                <div className="crt-quick-insights-grid">
                  <div className="crt-insight-card teal">
                    <div className="crt-insight-icon"><Award size={17} /></div>
                    <span className="crt-insight-header">MOST READY CREDENTIAL</span>
                    <strong className="crt-insight-code">DP-600</strong>
                    <span className="crt-insight-name">Fabric Analytics Engineer Associate</span>
                    <span className="crt-insight-meta text-teal">2 Ready Candidates (&ge;85%)</span>
                  </div>

                  <div className="crt-insight-card emerald">
                    <div className="crt-insight-icon"><UserCheck size={17} /></div>
                    <span className="crt-insight-header">READY CANDIDATES</span>
                    <strong className="crt-insight-code text-emerald">2 Trainees</strong>
                    <span className="crt-insight-name">Above 85% readiness threshold</span>
                    <span className="crt-insight-meta text-emerald">DP-600 &amp; DP-750</span>
                  </div>

                  <div className="crt-insight-card amber">
                    <div className="crt-insight-icon"><AlertTriangle size={17} /></div>
                    <span className="crt-insight-header">LARGEST READINESS GAP</span>
                    <strong className="crt-insight-code text-amber">DP-750</strong>
                    <span className="crt-insight-name">Unity Catalog Governance</span>
                    <span className="crt-insight-meta text-amber">4 Trainees Below 65% Target</span>
                  </div>

                  <div className="crt-insight-card indigo">
                    <div className="crt-insight-icon"><Calendar size={17} /></div>
                    <span className="crt-insight-header">NEXT SCHEDULED EXAM</span>
                    <strong className="crt-insight-code text-indigo">DP-600</strong>
                    <span className="crt-insight-name">Pavithra Annadurai</span>
                    <span className="crt-insight-meta text-indigo">Scheduled for Sep 5, 2026</span>
                  </div>
                </div>
            </div>
          </section>
        </div>
      )}

      {/* =========================================================================
          TAB 2: RECOMMENDATIONS
          ========================================================================= */}
      {activeTab === 'recommendations' && (
        <div className="space-y-5 crt-recommendations-view">
          {/* FILTER TOOLBAR */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between gap-4 crt-recommendation-filters">
            <div className="search-input-wrapper h-9 flex-1 max-w-sm crt-recommendation-search">
              <Search size={14} className="text-teal-700" />
              <input
                type="text"
                className="asm-search-input-field text-xs"
                placeholder="Search trainee name or employee ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-3 crt-recommendation-filter-selects">
              <select
                className="asm-select-field h-9 text-xs crt-recommendation-select"
                value={selectedCertFilter}
                onChange={(e) => setSelectedCertFilter(e.target.value)}
              >
                <option value="All">Certification: All</option>
                <option value="DP-700">DP-700 (Fabric Data Engineer)</option>
                <option value="DP-750">DP-750 (Databricks Associate)</option>
                <option value="DP-600">DP-600 (Fabric Analytics Engineer)</option>
              </select>

              <select
                className="asm-select-field h-9 text-xs crt-recommendation-select"
                value={selectedReadinessFilter}
                onChange={(e) => setSelectedReadinessFilter(e.target.value)}
              >
                <option value="All">Readiness Level: All</option>
                <option value="READY TO SCHEDULE">READY TO SCHEDULE (&ge;85%)</option>
                <option value="PREPARING">PREPARING (70–84%)</option>
                <option value="NEEDS DEVELOPMENT">NEEDS DEVELOPMENT (60–69%)</option>
                <option value="NOT READY">NOT READY (&lt;60%)</option>
              </select>
            </div>
          </div>

          <div className="crt-recommendation-summary" aria-label="Recommendation summary">
            {[
              { label: 'Total Recommendations', value: recommendationSummary.total, icon: <Layers size={15} /> },
              { label: 'Ready to Schedule', value: recommendationSummary.ready, icon: <CheckCircle2 size={15} /> },
              { label: 'Preparing', value: recommendationSummary.preparing, icon: <BookOpen size={15} /> },
              { label: 'High Match Candidates', value: recommendationSummary.highMatch, icon: <Target size={15} />, note: '88%+' },
            ].map((item) => (
              <div key={item.label} className="crt-recommendation-summary-card">
                <span className="crt-rec-summary-icon">{item.icon}</span>
                <span><small>{item.label}</small><strong>{item.value}</strong></span>
                {item.note && <em>{item.note}</em>}
              </div>
            ))}
          </div>

          {/* RECOMMENDATION CARDS (2-COLUMN COMPACT GRID) */}
          <div className="crt-recommendations-grid">
            {filteredRecommendations.map((rec) => (
              <div key={rec.traineeId} className="crt-recommendation-card">
                <div>
                  {/* TRAINEE HEADER */}
                  <div className="flex items-center justify-between mb-3 crt-rec-card-header">
                    <div className="flex items-center gap-3 crt-rec-person">
                      <div className="w-10 h-10 rounded-full bg-teal-700 text-white font-black text-sm flex items-center justify-center crt-rec-avatar">
                        {rec.avatarInitials}
                      </div>
                      <div className="flex flex-col crt-rec-identity">
                        <strong className="text-base font-black text-slate-900 leading-tight">{rec.name}</strong>
                        <span className="text-xs text-slate-500">{rec.employeeId} • {rec.bootcampName}</span>
                      </div>
                    </div>

                    <span
                      className={`text-xs font-black px-2.5 py-1 rounded-xl border crt-rec-status ${
                        rec.readinessLevel === 'READY TO SCHEDULE'
                          ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                          : rec.readinessLevel === 'PREPARING'
                          ? 'bg-teal-100 text-teal-900 border-teal-300'
                          : 'bg-amber-100 text-amber-900 border-amber-300'
                      }`}
                    >
                      {rec.readinessLevel}
                    </span>
                  </div>

                  {/* BEST MATCH PANEL */}
                  <div className="bg-teal-50/70 border border-teal-200 p-3.5 rounded-xl mb-3 crt-rec-match-panel">
                    <span className="text-[10px] font-black text-teal-800 uppercase block tracking-wide">BEST CERTIFICATION MATCH</span>
                    <div className="crt-rec-certification-identity">
                      <strong>{rec.examCode}</strong>
                      <span>{rec.certificationTitle}</span>
                    </div>
                    <h4 className="text-base font-black text-slate-900 m-0 mt-0.5">
                      {rec.examCode} • {rec.certificationTitle}
                    </h4>
                  </div>

                  {/* MATCH SCORE VS READINESS SCORE (TWO CIRCULAR PROGRESS RINGS) */}
                  <div className="grid grid-cols-2 gap-3 mb-3 crt-rec-metrics">
                    <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl flex items-center gap-3 crt-rec-metric">
                      <div className="relative w-10 h-10 flex items-center justify-center">
                        <svg className="w-10 h-10 transform -rotate-90" viewBox="0 0 36 36">
                          <path className="text-teal-100 stroke-current" strokeWidth="3.5" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                          <path className="text-teal-700 stroke-current" strokeWidth="3.5" strokeDasharray={`${rec.matchScore}, 100`} strokeLinecap="round" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                        </svg>
                        <span className="absolute text-[10px] font-black text-teal-800">{rec.matchScore}%</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] font-extrabold text-slate-400 uppercase">MATCH</span>
                        <strong className="text-xs font-black text-teal-800">Track Align</strong>
                      </div>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl flex items-center gap-3 crt-rec-metric readiness">
                      <div className="relative w-10 h-10 flex items-center justify-center">
                        <svg className="w-10 h-10 transform -rotate-90" viewBox="0 0 36 36">
                          <path className="text-emerald-100 stroke-current" strokeWidth="3.5" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                          <path className="text-emerald-600 stroke-current" strokeWidth="3.5" strokeDasharray={`${rec.readinessScore}, 100`} strokeLinecap="round" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                        </svg>
                        <span className="absolute text-[10px] font-black text-emerald-800">{rec.readinessScore}%</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] font-extrabold text-slate-400 uppercase">READINESS</span>
                        <strong className="text-xs font-black text-emerald-800">Exam Prep</strong>
                      </div>
                    </div>
                  </div>

                  {/* EVIDENCE & GAPS */}
                  <div className="space-y-2 text-xs border-t border-slate-100 pt-3 crt-rec-evidence-grid">
                    <div className="crt-rec-evidence-section strong">
                      <strong className="text-slate-800 block mb-1">STRONG EVIDENCE:</strong>
                      <div className="flex gap-1.5 flex-wrap crt-rec-skill-list">
                        {rec.strongEvidence.map((ev) => (
                          <span key={ev.skill} className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded font-bold">
                            <span>{ev.skill}</span><strong>{ev.score}%</strong>
                          </span>
                        ))}
                      </div>
                    </div>

                    {rec.developmentGaps.length > 0 && (
                      <div className="crt-rec-evidence-section development">
                        <strong className="text-slate-800 block mb-1">DEVELOPMENT BEFORE EXAM:</strong>
                        <div className="flex gap-1.5 flex-wrap crt-rec-skill-list">
                          {rec.developmentGaps.map((gap) => (
                            <span key={gap.skill} className="bg-rose-50 text-rose-800 border border-rose-200 px-2 py-0.5 rounded font-bold">
                              <span>{gap.skill}</span><strong>{gap.score}%</strong>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  className="ui-button-secondary w-full justify-center mt-2 crt-rec-readiness-button"
                  onClick={() => setSelectedReadinessTrainee(rec.traineeId)}
                >
                  View Readiness Breakdown &rarr;
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: CERTIFICATION TRACKER
          ========================================================================= */}
      {activeTab === 'tracker' && (
        <div className="space-y-5">
          {/* TRACKER TABLE */}
          <section className="ski-section-card">
            <div className="ski-section-header">
              <div className="ski-section-title-group">
                <h3 className="ski-section-title">
                  <FileCheck size={18} className="text-teal-700" /> Certification Lifecycle Tracker
                </h3>
                <span className="ski-section-subtitle">Track trainee progress from recommendation to official credential</span>
              </div>
            </div>

            <div className="table-responsive-wrapper">
              <table className="asm-fixed-proportional-table">
                <thead>
                  <tr>
                    <th style={{ width: '26%' }}>TRAINEE</th>
                    <th style={{ width: '22%' }}>CERTIFICATION</th>
                    <th style={{ width: '10%' }}>READINESS</th>
                    <th style={{ width: '15%' }}>STATUS</th>
                    <th style={{ width: '15%' }}>NEXT ACTION</th>
                    <th style={{ width: '12%' }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTrackerItems.map((item) => (
                    <tr key={item.traineeId} className="asm-table-row-item">
                      <td>
                        <div className="cell-evaluator-flex min-w-0">
                          <div className="evaluator-avatar-34px">{item.avatarInitials}</div>
                          <div className="flex flex-col min-w-0 overflow-hidden">
                            <strong
                              className="evaluator-name-single truncate block max-w-full"
                              title={item.name}
                            >
                              {item.name}
                            </strong>
                            <span className="text-xs text-slate-400 block truncate">
                              {item.employeeId}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <div className="flex flex-col min-w-0 overflow-hidden">
                          <span className="text-xs font-black text-teal-800 block truncate">
                            {item.examCode}
                          </span>
                          <span
                            className="text-[11px] font-medium text-slate-500 line-clamp-2 leading-snug block"
                            title={item.certificationTitle}
                          >
                            {item.certificationTitle}
                          </span>
                        </div>
                      </td>

                      <td>
                        <strong className="text-sm font-black text-teal-800">{item.readinessScore}%</strong>
                      </td>

                      <td>
                        <span
                          className={`text-xs font-black px-2.5 py-1 rounded-xl border ${
                            item.status === 'CERTIFIED'
                              ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                              : item.status === 'READY TO SCHEDULE'
                              ? 'bg-teal-100 text-teal-900 border-teal-300'
                              : item.status === 'EXAM SCHEDULED'
                              ? 'bg-indigo-100 text-indigo-900 border-indigo-300'
                              : 'bg-slate-100 text-slate-800 border-slate-300'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>

                      <td>
                        <span className="text-xs text-slate-600 line-clamp-2">{item.nextAction}</span>
                      </td>

                      <td>
                        <button
                          type="button"
                          className="ui-button-secondary text-xs py-1 px-2.5"
                          onClick={() => setUpdateStatusModalItem(item)}
                        >
                          Update Status &rarr;
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}

      {/* =========================================================================
          TAB 4: CERTIFIED TALENT
          ========================================================================= */}
      {activeTab === 'certified' && (
        <div className="space-y-5">
          <section className="ski-section-card">
            <div className="ski-section-header">
              <div className="ski-section-title-group">
                <h3 className="ski-section-title">
                  <Award size={18} className="text-teal-700" /> Microsoft Certified Talent Gallery
                </h3>
                <span className="ski-section-subtitle">Official credential achievements verified by L&amp;D</span>
              </div>
            </div>

            <div className="crt-certified-gallery-grid">
              {certifiedTalent.map((c) => (
                <div key={c.traineeId} className="crt-certified-card">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-full bg-teal-700 text-white font-black text-sm flex items-center justify-center">
                          {c.avatarInitials}
                        </div>
                        <div className="flex flex-col">
                          <strong className="text-base font-black text-slate-900 leading-tight">{c.name}</strong>
                          <span className="text-xs text-slate-500">{c.employeeId} • {c.bootcampName}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl mb-3">
                      <span className="text-[10px] font-black text-emerald-800 uppercase block tracking-wide flex items-center gap-1">
                        <ShieldCheck size={13} /> MICROSOFT CERTIFIED
                      </span>
                      <strong className="text-base font-black text-slate-900 block mt-0.5">{c.examCode} • {c.certificationTitle}</strong>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs space-y-1 mb-3">
                      <div className="flex justify-between"><span>Certified Date:</span> <strong>{c.certifiedDate}</strong></div>
                      <div className="flex justify-between"><span>Exam Score:</span> <strong>{c.score} / 1000</strong></div>
                      <div className="flex justify-between"><span>Credential ID:</span> <strong>{c.credentialId}</strong></div>
                      <div className="flex justify-between"><span>Status:</span> <strong className="text-emerald-700">{c.status}</strong></div>
                    </div>

                    <div className="text-xs text-teal-800 bg-teal-50 border border-teal-200 p-2.5 rounded-lg">
                      <strong>Next Recommendation:</strong> {c.nextRecommendedCertCode}
                    </div>
                  </div>

                  <div className="flex gap-2 border-t border-slate-100 pt-3">
                    <button type="button" className="ui-button-secondary flex-1 text-xs justify-center">
                      View Profile
                    </button>
                    <button type="button" className="create-asm-primary-btn flex-1 text-xs justify-center">
                      View Credential
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* =========================================================================
          INTELLIGENCE DATA SOURCES INDICATOR
          ========================================================================= */}
      {false && <section className="ski-data-sources-card">
        <div className="flex items-center gap-2">
          <FileCheck size={16} className="text-teal-700" />
          <span className="text-xs font-bold text-slate-800">CERTIFICATION INTELLIGENCE SOURCES</span>
        </div>
        <div className="ski-data-sources-pills">
          {[
            { label: 'Skill Intelligence', active: true },
            { label: 'Assessments', active: true },
            { label: 'Trainer Feedback', active: true },
            { label: 'Attendance', active: true },
            { label: 'Bootcamp Progress', active: true },
            { label: 'Projects', active: false },
            { label: 'Certification Results', active: true },
          ].map((src) => (
            <span key={src.label} className={`ski-source-pill-item ${src.active ? 'active' : 'muted'}`}>
              {src.active ? <Check size={12} className="text-teal-700" /> : '○'} {src.label}
            </span>
          ))}
        </div>
      </section>}

      {/* =========================================================================
          MODAL 1: CENTERED CERTIFICATION DETAILS MODAL COMPONENT
          ========================================================================= */}
      <AnimatePresence>
        {selectedCertForDrawer && (
          <CertificationDetailsModal
            certification={selectedCertForDrawer}
            recommendations={recommendations}
            onClose={() => setSelectedCertForDrawer(null)}
            onSelectCandidateReadiness={(traineeId) => setSelectedReadinessTrainee(traineeId)}
            onOpenTracker={() => setActiveTab('tracker')}
            onOpenRecommendations={() => setActiveTab('recommendations')}
          />
        )}
      </AnimatePresence>

      {/* =========================================================================
          DRAWER 2: TRAINEE READINESS BREAKDOWN & JOURNEY DRAWER
          ========================================================================= */}
      <AnimatePresence>
        {selectedReadinessTrainee && (() => {
          const breakdown = certificationIntelligenceService.getCertificationReadiness(selectedReadinessTrainee, 'cert-dp750');
          return (
            <div className="crt-modal-backdrop justify-end p-0" onClick={() => setSelectedReadinessTrainee(null)}>
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ duration: 0.22 }}
                className="w-[480px] h-full bg-white border-l border-slate-200 p-6 overflow-y-auto flex flex-col justify-between shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-black text-slate-900 m-0">Certification Readiness Breakdown</h3>
                    <button
                      type="button"
                      className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-100"
                      onClick={() => setSelectedReadinessTrainee(null)}
                    >
                      <X size={16} />
                    </button>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-teal-50 border border-teal-200 rounded-2xl mb-4">
                    <div className="w-12 h-12 rounded-full bg-teal-700 text-white font-black text-base flex items-center justify-center">
                      {breakdown.avatarInitials}
                    </div>
                    <div className="flex flex-col">
                      <h4 className="text-base font-black text-slate-900 m-0 leading-tight">{breakdown.name}</h4>
                      <span className="text-xs text-slate-500">{breakdown.employeeId}</span>
                    </div>
                  </div>

                  <div className="mb-4 bg-slate-50 border border-slate-200 p-4 rounded-2xl text-center">
                    <span className="text-xs font-bold text-slate-500 block mb-1">Target Exam: {breakdown.examCode}</span>
                    <div className="text-3xl font-black text-teal-800">{breakdown.overallReadinessScore}%</div>
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200 mt-2 inline-block">
                      {breakdown.readinessLevel}
                    </span>
                  </div>

                  {/* CERTIFICATION JOURNEY TIMELINE */}
                  <div className="border-t border-slate-200 pt-4 mb-4">
                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide mb-3">CERTIFICATION JOURNEY</h4>
                    <div className="flex items-center justify-between text-xs bg-slate-50 border border-slate-200 p-3 rounded-xl">
                      <div className="flex flex-col items-center text-center">
                        <span className="text-emerald-600 font-bold">✓ DP-900</span>
                        <span className="text-[10px] text-slate-400">Completed</span>
                      </div>
                      <ChevronRight size={14} className="text-slate-300" />
                      <div className="flex flex-col items-center text-center">
                        <strong className="text-teal-800 font-black">● {breakdown.examCode}</strong>
                        <span className="text-[10px] text-teal-700 font-bold">{breakdown.overallReadinessScore}% Ready</span>
                      </div>
                      <ChevronRight size={14} className="text-slate-300" />
                      <div className="flex flex-col items-center text-center">
                        <span className="text-slate-400">○ DP-700</span>
                        <span className="text-[10px] text-slate-400">Next Target</span>
                      </div>
                    </div>
                  </div>

                  {/* CATEGORY BREAKDOWN */}
                  <div className="border-t border-slate-200 pt-4 mb-4">
                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide mb-3">Skill Category Breakdown</h4>
                    <div className="space-y-3">
                      {breakdown.categoryBreakdown.map((cat) => (
                        <div key={cat.category} className="text-xs">
                          <div className="flex justify-between font-bold text-slate-800 mb-1">
                            <span>{cat.category}</span>
                            <span>{cat.score}%</span>
                          </div>
                          <div className="mini-score-progress-track h-1.5">
                            <div className="mini-score-progress-fill bg-teal-600" style={{ width: `${cat.score}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* RECOMMENDED BEFORE EXAM TIMELINE CHECKLIST */}
                  <div className="border-t border-slate-200 pt-4">
                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide mb-2">BEFORE EXAM CHECKLIST</h4>
                    <div className="space-y-2 text-xs">
                      {breakdown.recommendedActionPlan.map((plan, i) => (
                        <div key={i} className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-lg">
                          <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 font-bold text-[10px] flex items-center justify-center">
                            {i + 1}
                          </span>
                          <span className="text-slate-700 font-semibold">{plan}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  className="create-asm-primary-btn w-full justify-center mt-6"
                  onClick={() => setSelectedReadinessTrainee(null)}
                >
                  Close Readiness Breakdown
                </button>
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>

      {/* =========================================================================
          MODAL: UPDATE CERTIFICATION STATUS MODAL (720px REBUILT)
          ========================================================================= */}
      {updateStatusModalItem && (
        <div className="crt-modal-backdrop" onClick={() => setUpdateStatusModalItem(null)}>
          <div className="crt-modal-shell-720 p-6" onClick={(e) => e.stopPropagation()}>
            {/* MODAL HEADER */}
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center">
                  <Award size={18} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 m-0 leading-tight">Update Certification Status</h3>
                  <p className="text-xs text-slate-500 m-0">Record exam progress, results and official credential details.</p>
                </div>
              </div>
              <button
                type="button"
                className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-100"
                onClick={() => setUpdateStatusModalItem(null)}
              >
                <X size={16} />
              </button>
            </div>

            {/* TRAINEE IDENTITY SUMMARY CARD */}
            <div className="bg-teal-50/70 border border-teal-200 p-3.5 rounded-xl my-4 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-teal-700 text-white font-black flex items-center justify-center text-sm">
                  {updateStatusModalItem.avatarInitials}
                </div>
                <div className="flex flex-col">
                  <strong className="text-sm font-black text-slate-900">{updateStatusModalItem.name}</strong>
                  <span className="text-slate-500">{updateStatusModalItem.employeeId}</span>
                </div>
              </div>

              <div className="flex flex-col text-right">
                <span className="text-[10px] font-extrabold text-teal-800 uppercase">{updateStatusModalItem.examCode}</span>
                <strong className="text-slate-900 font-bold">{updateStatusModalItem.certificationTitle}</strong>
              </div>
            </div>

            {/* 2-COLUMN FORM GRID */}
            <div className="space-y-4 text-xs overflow-y-auto pr-1">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Certification Status</label>
                  <select
                    className="asm-select-field w-full text-xs"
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                  >
                    <option value="READY TO SCHEDULE">READY TO SCHEDULE</option>
                    <option value="PREPARING">PREPARING</option>
                    <option value="EXAM SCHEDULED">EXAM SCHEDULED</option>
                    <option value="CERTIFIED">CERTIFIED / PASSED</option>
                    <option value="REATTEMPT PLANNED">REATTEMPT PLANNED</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Exam Date</label>
                  <input
                    type="date"
                    className="fbm-control-input text-xs w-full"
                    value={newExamDate}
                    onChange={(e) => setNewExamDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Result Score (Optional)</label>
                  <input
                    type="text"
                    className="fbm-control-input text-xs w-full"
                    placeholder="e.g. 880 / 1000"
                    value={newResultScore}
                    onChange={(e) => setNewResultScore(e.target.value)}
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Credential ID (Optional)</label>
                  <input
                    type="text"
                    className="fbm-control-input text-xs w-full"
                    placeholder="e.g. MS-CERT-992014"
                    value={newCredentialId}
                    onChange={(e) => setNewCredentialId(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Credential Issue Date</label>
                  <input
                    type="date"
                    className="fbm-control-input text-xs w-full"
                    value={newCredentialDate}
                    onChange={(e) => setNewCredentialDate(e.target.value)}
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Expiry / Renewal Date</label>
                  <input
                    type="date"
                    className="fbm-control-input text-xs w-full"
                    value={newExpiryDate}
                    onChange={(e) => setNewExpiryDate(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">L&amp;D Evaluation Notes</label>
                <textarea
                  rows={2}
                  className="fbm-control-input text-xs w-full resize-none"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                />
              </div>
            </div>

            {/* STICKY FOOTER */}
            <div className="flex gap-3 justify-end mt-5 pt-3 border-t border-slate-200">
              <button
                type="button"
                className="ui-button-secondary text-xs"
                onClick={() => setUpdateStatusModalItem(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="create-asm-primary-btn text-xs"
                onClick={() => setUpdateStatusModalItem(null)}
              >
                Save Certification Status
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};
