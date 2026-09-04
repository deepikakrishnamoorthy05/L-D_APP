import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Award,
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
  Plus,
  Download,
  Share2,
  ExternalLink,
  FileSpreadsheet,
  Mail,
  DollarSign,
  Ticket,
  CheckSquare,
  Square,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import {
  certificationIntelligenceService,
  CertificationCatalogItem,
  TraineeCertificationRecommendation,
  CertifiedTraineeRecord,
  PartnershipItem,
  ManagementRequestItem,
  QuotaItem,
  CertificationResourceItem,
  CertificationCopilotResult,
} from '../../services/certificationIntelligenceService';
import { CertificationOrbit } from './CertificationOrbit';
import { CertificationChatbotWidget } from './CertificationChatbotWidget';
import { useBootcamps } from '../../context/BootcampContext';

export const CertificationIntelligenceView: React.FC = () => {
  const { bootcamps, showToast } = useBootcamps();

  // Navigation Tabs state
  const [activeTab, setActiveTab] = useState<'overview' | 'quota' | 'talent' | 'partnership' | 'tracker' | 'resources'>('overview');

  // KPI Active Filter State
  const [activeKpiFilter, setActiveKpiFilter] = useState<'certified' | 'preparing' | 'quota' | 'expiring' | 'gap' | null>(null);

  // Centralized Datasets
  const catalog = certificationIntelligenceService.getCertificationCatalog();
  const partnerships = certificationIntelligenceService.getPartnerships();
  const managementRequests = certificationIntelligenceService.getManagementRequests();
  const quotaItems = certificationIntelligenceService.getQuotaItems();
  const resources = certificationIntelligenceService.getResources();
  const certifiedTalent = certificationIntelligenceService.getCertifiedTalent();
  const trackerItems = certificationIntelligenceService.getCertificationTracker();

  // Talent Finder Filters
  const [talentProviderFilter, setTalentProviderFilter] = useState('All');
  const [talentCertFilter, setTalentCertFilter] = useState('All');
  const [talentTrackFilter, setTalentTrackFilter] = useState('All');
  const [talentStatusFilter, setTalentStatusFilter] = useState('All');
  const [talentValidityFilter, setTalentValidityFilter] = useState('All');
  const [talentSearchTerm, setTalentSearchTerm] = useState('');

  // Selected Talent IDs for Management Request / Export
  const [selectedTalentIds, setSelectedTalentIds] = useState<string[]>([]);

  // Quota Filters
  const [quotaYearFilter, setQuotaYearFilter] = useState('2026');
  const [quotaQuarterFilter, setQuotaQuarterFilter] = useState('Q3');
  const [quotaProviderFilter, setQuotaProviderFilter] = useState('All');

  // Tracker Filter
  const [trackerStageFilter, setTrackerStageFilter] = useState('All');

  // Modals & Drawers State
  const [showAddPlanModal, setShowAddPlanModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showAssignVoucherModal, setShowAssignVoucherModal] = useState(false);
  const [selectedCertDrawerItem, setSelectedCertDrawerItem] = useState<CertifiedTraineeRecord | TraineeCertificationRecommendation | null>(null);

  // Add Plan Form State
  const [planProvider, setPlanProvider] = useState('Microsoft');
  const [planCertTitle, setPlanCertTitle] = useState('Fabric Data Engineer Associate (DP-700)');
  const [planQuarter, setPlanQuarter] = useState('Q3');
  const [planTarget, setPlanTarget] = useState(15);
  const [planTrack, setPlanTrack] = useState('DE');

  // Voucher Form State
  const [voucherEmployee, setVoucherEmployee] = useState('Kaviram Sudharajanainar Paramasivan (EMP001)');
  const [voucherCert, setVoucherCert] = useState('Databricks Certified Data Engineer (DP-750)');
  const [voucherCode, setVoucherCode] = useState('VOUCH-DB-2026-X99');

  // Filtered Certified Talent List
  const filteredCertifiedTalent = certifiedTalent.filter((item) => {
    if (talentProviderFilter !== 'All' && item.provider !== talentProviderFilter) return false;
    if (talentCertFilter !== 'All' && item.examCode !== talentCertFilter && !item.certificationTitle.includes(talentCertFilter)) return false;
    if (talentTrackFilter !== 'All' && item.track !== talentTrackFilter) return false;
    if (talentValidityFilter !== 'All' && item.status !== talentValidityFilter) return false;
    if (talentSearchTerm.trim()) {
      const q = talentSearchTerm.toLowerCase();
      if (!item.name.toLowerCase().includes(q) && !item.employeeId.toLowerCase().includes(q) && !item.certificationTitle.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  // KPI Computations
  const totalCertifiedCount = certifiedTalent.length;
  const totalPreparingCount = trackerItems.filter((t) => t.status === 'PREPARING' || t.status === 'RECOMMENDED').length;
  const totalTargetQuota = catalog.reduce((acc, c) => acc + c.targetCount, 0);
  const totalCompletedQuota = catalog.reduce((acc, c) => acc + c.completedCount, 0);
  const totalExpiringSoonCount = certifiedTalent.filter((c) => c.status === 'EXPIRING SOON' || c.expiryDaysRemaining <= 90).length;
  const totalPartnerGapCount = partnerships.reduce((acc, p) => acc + p.gapCount, 0);

  // Handle KPI Filter Clicks
  const handleKpiCardClick = (kpiKey: 'certified' | 'preparing' | 'quota' | 'expiring' | 'gap') => {
    setActiveKpiFilter(kpiKey);
    if (kpiKey === 'certified') {
      setActiveTab('talent');
      setTalentValidityFilter('All');
    } else if (kpiKey === 'preparing') {
      setActiveTab('tracker');
      setTrackerStageFilter('PREPARING');
    } else if (kpiKey === 'quota') {
      setActiveTab('quota');
    } else if (kpiKey === 'expiring') {
      setActiveTab('talent');
      setTalentValidityFilter('EXPIRING SOON');
    } else if (kpiKey === 'gap') {
      setActiveTab('partnership');
    }
  };

  const handleClearKpiFilter = () => {
    setActiveKpiFilter(null);
    setTalentProviderFilter('All');
    setTalentCertFilter('All');
    setTalentTrackFilter('All');
    setTalentValidityFilter('All');
    setTalentSearchTerm('');
    setTrackerStageFilter('All');
  };

  // Toggle Talent Selection Checkbox
  const handleToggleSelectTalent = (id: string) => {
    if (selectedTalentIds.includes(id)) {
      setSelectedTalentIds(selectedTalentIds.filter((item) => item !== id));
    } else {
      setSelectedTalentIds([...selectedTalentIds, id]);
    }
  };

  const handleSelectAllTalent = () => {
    if (selectedTalentIds.length === filteredCertifiedTalent.length) {
      setSelectedTalentIds([]);
    } else {
      setSelectedTalentIds(filteredCertifiedTalent.map((t) => t.traineeId));
    }
  };

  // Export CSV Handler
  const handleExportCSV = () => {
    const recordsToExport = selectedTalentIds.length > 0
      ? certifiedTalent.filter((t) => selectedTalentIds.includes(t.traineeId))
      : filteredCertifiedTalent;

    if (recordsToExport.length === 0) {
      showToast('No records to export');
      return;
    }

    const headers = 'Employee Name,Employee ID,Track,Certification,Provider,Certified Date,Valid Until,Status,Credential ID\n';
    const rows = recordsToExport
      .map((r) => `"${r.name}","${r.employeeId}","${r.track}","${r.certificationTitle}","${r.provider}","${r.certifiedDate}","${r.validUntil}","${r.status}","${r.credentialId}"`)
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Certified_Talent_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast(`Exported ${recordsToExport.length} certified talent records`);
  };

  return (
    <div className="certification-intelligence-page page-container space-y-6">
      {/* 1. UNIFIED PREMIUM HERO CARD WITH 3D ANIMATED ORBIT */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="unified-bootcamp-hero-card"
      >
        {/* LEFT SECTION: ANIMATED CERTIFICATION ORBIT */}
        <div className="hero-section-left">
          <CertificationOrbit />
        </div>

        {/* CENTER SECTION: EYEBROW, TITLE & SUBTITLE */}
        <div className="hero-section-center">
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="hero-eyebrow-badge"
          >
            <span>L&amp;D LEARNING OPERATIONS</span>
            <ChevronRight size={12} className="inline" />
            <span>L&amp;D Calendar</span>
            <ChevronRight size={12} className="inline" />
            <span className="text-teal-600 dark:text-teal-400 font-bold">Certifications</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
            className="hero-title"
          >
            Certification Management
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="hero-subtitle"
          >
            Plan quarterly certification targets, track certified talent, monitor partnership requirements and manage certification readiness.
          </motion.p>
        </div>

        {/* RIGHT SECTION: ACTION COMMAND BUTTONS */}
        <div className="hero-section-right flex items-center gap-2">
          <span className="code-chip lg bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 font-bold border border-teal-200 dark:border-teal-800 px-3 py-1.5 rounded-xl">
            2026 Certification Year
          </span>

          <button
            type="button"
            className="ui-button-primary micro-btn"
            onClick={() => setShowAddPlanModal(true)}
          >
            <Plus size={16} className="btn-plus-icon" /> Add Certification Plan
          </button>
        </div>
      </motion.div>

      {/* 2. TOP 5 OPERATIONAL SUMMARY KPI CARDS (CLICKABLE FILTERS) */}
      <section className="compact-glass-metrics-strip my-2">
        <div
          className={`glass-metric-tile interactive ${activeKpiFilter === 'certified' ? 'active' : ''}`}
          onClick={() => handleKpiCardClick('certified')}
          title="Click to filter Active Certified Resources"
        >
          <div className="metric-icon-wrap teal">
            <Award size={18} />
          </div>
          <div className="metric-info">
            <span className="metric-val">{totalCertifiedCount}</span>
            <span className="metric-lbl">Certified Resources</span>
          </div>
        </div>

        <div
          className={`glass-metric-tile interactive ${activeKpiFilter === 'preparing' ? 'active' : ''}`}
          onClick={() => handleKpiCardClick('preparing')}
          title="Click to filter Preparing & Exam Scheduled"
        >
          <div className="metric-icon-wrap amber">
            <Clock size={18} />
          </div>
          <div className="metric-info">
            <span className="metric-val">{totalPreparingCount}</span>
            <span className="metric-lbl">Preparing</span>
          </div>
        </div>

        <div
          className={`glass-metric-tile interactive ${activeKpiFilter === 'quota' ? 'active' : ''}`}
          onClick={() => handleKpiCardClick('quota')}
          title="Click to open Quota & Planning"
        >
          <div className="metric-icon-wrap emerald">
            <Target size={18} />
          </div>
          <div className="metric-info">
            <span className="metric-val">{totalCompletedQuota} / {totalTargetQuota}</span>
            <span className="metric-lbl">Quota Progress</span>
          </div>
        </div>

        <div
          className={`glass-metric-tile interactive ${activeKpiFilter === 'expiring' ? 'active' : ''}`}
          onClick={() => handleKpiCardClick('expiring')}
          title="Click to view Certifications Expiring Soon"
        >
          <div className="metric-icon-wrap rose">
            <AlertTriangle size={18} />
          </div>
          <div className="metric-info">
            <span className="metric-val">{totalExpiringSoonCount}</span>
            <span className="metric-lbl">Expiring Soon</span>
          </div>
        </div>

        <div
          className={`glass-metric-tile interactive ${activeKpiFilter === 'gap' ? 'active' : ''}`}
          onClick={() => handleKpiCardClick('gap')}
          title="Click to open Partnership Requirements"
        >
          <div className="metric-icon-wrap purple">
            <Layers size={18} />
          </div>
          <div className="metric-info">
            <span className="metric-val">{totalPartnerGapCount}</span>
            <span className="metric-lbl">Partner Gap</span>
          </div>
        </div>
      </section>


      {/* 3. MAIN NAVIGATION TABS BAR */}
      <nav className="bootcamp-tabs-bar" aria-label="Certification Modules">
        <button
          type="button"
          className={`bootcamp-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <Layers size={15} className="inline mr-1.5" /> Overview
        </button>

        <button
          type="button"
          className={`bootcamp-tab-btn ${activeTab === 'quota' ? 'active' : ''}`}
          onClick={() => setActiveTab('quota')}
        >
          <Target size={15} className="inline mr-1.5" /> Quota &amp; Planning
        </button>

        <button
          type="button"
          className={`bootcamp-tab-btn ${activeTab === 'talent' ? 'active' : ''}`}
          onClick={() => setActiveTab('talent')}
        >
          <Award size={15} className="inline mr-1.5" /> Certified Talent ({certifiedTalent.length})
        </button>

        <button
          type="button"
          className={`bootcamp-tab-btn ${activeTab === 'partnership' ? 'active' : ''}`}
          onClick={() => setActiveTab('partnership')}
        >
          <ShieldCheck size={15} className="inline mr-1.5" /> Partnership
        </button>

        <button
          type="button"
          className={`bootcamp-tab-btn ${activeTab === 'tracker' ? 'active' : ''}`}
          onClick={() => setActiveTab('tracker')}
        >
          <Clock size={15} className="inline mr-1.5" /> Certification Tracker
        </button>

        <button
          type="button"
          className={`bootcamp-tab-btn ${activeTab === 'resources' ? 'active' : ''}`}
          onClick={() => setActiveTab('resources')}
        >
          <Ticket size={15} className="inline mr-1.5" /> Resources &amp; Vouchers
        </button>
      </nav>

      {/* ============================================================ */}
      {/* TAB 1: OVERVIEW TAB                                          */}
      {/* ============================================================ */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* CERTIFICATION TARGET CARDS GRID */}
          <section className="details-section-card">
            <div className="flex items-center justify-between">
              <h3 className="section-heading flex items-center gap-2">
                <Target size={18} className="text-teal-600" /> Certification Progress by Provider &amp; Certification
              </h3>
              <button type="button" className="ui-button-secondary btn-sm" onClick={() => setActiveTab('quota')}>
                View Quota &amp; Planning →
              </button>
            </div>

            <div className="cert-target-cards-grid">
              {catalog.map((cert) => {
                const percent = Math.round((cert.completedCount / cert.targetCount) * 100);
                return (
                  <div key={cert.id} className="cert-target-card">
                    <div>
                      <div className="cert-card-header">
                        <span className="code-chip lg">{cert.provider}</span>
                        <span className="font-extrabold text-xs text-slate-600 dark:text-slate-300">{cert.examCode}</span>
                      </div>
                      <h4 className="cert-card-title">{cert.title}</h4>
                      <p className="cert-card-desc">{cert.description}</p>
                    </div>

                    <div>
                      <div className="cert-card-metrics-grid">
                        <div className="cert-metric-box target-box">
                          <span className="cert-metric-lbl">Target</span>
                          <strong className="cert-metric-val">{cert.targetCount}</strong>
                        </div>
                        <div className="cert-metric-box done-box">
                          <span className="cert-metric-lbl">Done</span>
                          <strong className="cert-metric-val">{cert.completedCount}</strong>
                        </div>
                        <div className="cert-metric-box prep-box">
                          <span className="cert-metric-lbl">Prep</span>
                          <strong className="cert-metric-val">{cert.preparingCount}</strong>
                        </div>
                        <div className="cert-metric-box gap-box">
                          <span className="cert-metric-lbl">Gap</span>
                          <strong className="cert-metric-val">{cert.gapCount}</strong>
                        </div>
                      </div>

                      <div className="cert-progress-wrapper">
                        <div className="cert-progress-header">
                          <span>Progress</span>
                          <span>{percent}%</span>
                        </div>
                        <div className="cert-progress-track">
                          <div className="cert-progress-fill" style={{ width: `${percent}%` }} />
                        </div>
                      </div>

                      <button
                        type="button"
                        className="cert-card-btn"
                        onClick={() => {
                          setActiveTab('talent');
                          setTalentCertFilter(cert.examCode);
                        }}
                      >
                        View Certified Talent →
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* MANAGEMENT REQUESTS & PARTNERSHIP SUMMARY */}
          <div className="two-col-layout-grid">
            {/* MANAGEMENT REQUEST CARD */}
            <section className="details-section-card">
              <div className="flex items-center justify-between">
                <h3 className="section-heading flex items-center gap-2">
                  <Briefcase size={18} className="text-teal-600" /> Active Management Resource Requests
                </h3>
                <span className="text-xs font-bold text-slate-500">Submitted by Delivery &amp; Leadership</span>
              </div>

              <div className="mgmt-req-list-wrapper">
                {managementRequests.map((req) => (
                  <div key={req.id} className="mgmt-req-card-item">
                    <div className="mgmt-req-header">
                      <h4 className="mgmt-req-title">{req.title}</h4>
                      <span className={`risk-tag ${req.status === 'Fulfilled' ? 'risk-low' : 'risk-high'}`}>{req.status}</span>
                    </div>

                    <div className="mgmt-req-metrics-grid">
                      <div className="mgmt-req-metric-cell req-box">
                        <span className="mgmt-req-metric-lbl">Required</span>
                        <strong className="mgmt-req-metric-val">{req.resourcesRequired} {req.provider}</strong>
                      </div>
                      <div className="mgmt-req-metric-cell avail-box">
                        <span className="mgmt-req-metric-lbl">Available</span>
                        <strong className="mgmt-req-metric-val">{req.currentlyAvailable} Active</strong>
                      </div>
                      <div className="mgmt-req-metric-cell prep-box">
                        <span className="mgmt-req-metric-lbl">Preparing</span>
                        <strong className="mgmt-req-metric-val">{req.preparing} Trainees</strong>
                      </div>
                      <div className="mgmt-req-metric-cell gap-box">
                        <span className="mgmt-req-metric-lbl">Gap</span>
                        <strong className="mgmt-req-metric-val">{req.gap} Needed</strong>
                      </div>
                    </div>

                    <p className="mgmt-req-purpose">
                      <strong>Purpose:</strong> {req.purpose} • <strong>Required By:</strong> {req.requiredBy}
                    </p>

                    <div className="mgmt-req-actions">
                      <button
                        type="button"
                        className="ui-button-primary text-xs py-1 px-3"
                        onClick={() => {
                          setActiveTab('talent');
                          setTalentProviderFilter(req.provider);
                        }}
                      >
                        Find Resources →
                      </button>
                      <button
                        type="button"
                        className="ui-button-secondary text-xs py-1 px-3"
                        onClick={() => setActiveTab('quota')}
                      >
                        Build Gap Plan →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* PARTNERSHIP REQUIREMENTS SUMMARY */}
            <section className="details-section-card">
              <div className="flex items-center justify-between">
                <h3 className="section-heading flex items-center gap-2">
                  <ShieldCheck size={18} className="text-teal-600" /> Partnership Certification Requirements
                </h3>
                <button type="button" className="ui-button-secondary btn-sm" onClick={() => setActiveTab('partnership')}>
                  View All Partnerships →
                </button>
              </div>

              <div className="partnership-list-wrapper">
                {partnerships.slice(0, 3).map((p) => (
                  <div key={p.id} className="partnership-row-item">
                    <div className="partnership-item-left">
                      <h4 className="partnership-item-title">
                        <span>{p.provider} Partnership</span>
                        <span className="partnership-item-tier">({p.tierName})</span>
                      </h4>
                      <p className="partnership-item-notes">{p.notes}</p>
                    </div>

                    <div className="partnership-item-right">
                      <span className={`risk-tag ${p.status === 'Requirement Met' ? 'risk-low' : p.status === 'On Track' ? 'risk-medium' : 'risk-high'}`}>
                        {p.status}
                      </span>
                      <span className="partnership-count-badge">
                        {p.certifiedCount} / {p.requiredCount} Certified
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 2: QUOTA & PLANNING TAB                                 */}
      {/* ============================================================ */}
      {activeTab === 'quota' && (
        <div className="space-y-6">
          <div className="details-section-card">
            <div className="quota-header-strip">
              <h3 className="section-heading flex items-center gap-2">
                <Target size={18} className="text-teal-600" /> Quarterly Certification Quota Planning (2026)
              </h3>
              <div className="quota-filter-controls">
                <select className="ui-input text-xs" style={{ width: '130px' }} value={quotaQuarterFilter} onChange={(e) => setQuotaQuarterFilter(e.target.value)}>
                  <option value="All">All Quarters</option>
                  <option value="Q1">Q1 2026</option>
                  <option value="Q2">Q2 2026</option>
                  <option value="Q3">Q3 2026</option>
                  <option value="Q4">Q4 2026</option>
                </select>
                <select className="ui-input text-xs" style={{ width: '140px' }} value={quotaProviderFilter} onChange={(e) => setQuotaProviderFilter(e.target.value)}>
                  <option value="All">All Providers</option>
                  <option value="Microsoft">Microsoft</option>
                  <option value="Databricks">Databricks</option>
                  <option value="Informatica">Informatica</option>
                  <option value="Snowflake">Snowflake</option>
                  <option value="AWS">AWS</option>
                </select>
                <button type="button" className="ui-button-primary text-xs" onClick={() => setShowAddPlanModal(true)}>
                  + Add Target
                </button>
              </div>
            </div>

            {/* QUARTERLY SUMMARY BANNER */}
            <div className="quota-banner-card">
              <div className="quota-banner-left">
                <span className="quota-banner-tag">Q3 2026 Certification Goal</span>
                <h4 className="quota-banner-title">Target: 40 Certifications Across All Partners</h4>
              </div>

              <div className="quota-banner-right">
                <div className="quota-banner-box done-box">
                  <span className="quota-banner-box-lbl">Completed</span>
                  <strong className="quota-banner-box-val">27</strong>
                </div>
                <div className="quota-banner-box prep-box">
                  <span className="quota-banner-box-lbl">Preparing</span>
                  <strong className="quota-banner-box-val">9</strong>
                </div>
                <div className="quota-banner-box sched-box">
                  <span className="quota-banner-box-lbl">Scheduled</span>
                  <strong className="quota-banner-box-val">6</strong>
                </div>
                <div className="quota-banner-box gap-box">
                  <span className="quota-banner-box-lbl">Current Gap</span>
                  <strong className="quota-banner-box-val">13</strong>
                </div>
              </div>
            </div>

            {/* QUOTA TABLE */}
            <div className="bootcamp-table-wrapper mt-4">
              <table className="enterprise-table">
                <thead>
                  <tr>
                    <th>Certification &amp; Provider</th>
                    <th>Quarter</th>
                    <th>Target</th>
                    <th>Completed</th>
                    <th>Preparing</th>
                    <th>Scheduled</th>
                    <th>Remaining Gap</th>
                    <th>Progress</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {quotaItems.map((item) => (
                    <tr key={item.id} className="table-row-hover">
                      <td>
                        <div className="font-extrabold text-sm text-slate-900 dark:text-white">{item.certification}</div>
                        <span className="code-chip lg text-[10px]">{item.provider}</span>
                      </td>
                      <td><span className="font-extrabold text-xs">{item.quarter} {item.year}</span></td>
                      <td className="font-extrabold">{item.target}</td>
                      <td className="text-teal-700 dark:text-teal-300 font-extrabold">{item.completed}</td>
                      <td className="text-amber-700 font-extrabold">{item.preparing}</td>
                      <td className="text-blue-700 font-extrabold">{item.scheduled}</td>
                      <td className="text-rose-700 font-extrabold">{item.gap}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold">{item.progressPercent}%</span>
                          <div className="w-16 bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-teal-600 h-full" style={{ width: `${item.progressPercent}%` }} />
                          </div>
                        </div>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="ui-button-secondary text-xs py-1 px-2.5"
                          onClick={() => setShowAssignVoucherModal(true)}
                        >
                          + Assign Voucher
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 3: CERTIFIED TALENT FINDER TAB (CRITICAL FEATURE)         */}
      {/* ============================================================ */}
      {activeTab === 'talent' && (
        <div className="space-y-6">
          <div className="details-section-card">
            <div className="flex items-center justify-between">
              <h3 className="section-heading flex items-center gap-2">
                <Search size={18} className="text-teal-600" /> Certified Talent Finder (Management Resource Lookup)
              </h3>
              <span className="text-xs font-extrabold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-900/40 px-3 py-1 rounded-xl">
                {filteredCertifiedTalent.length} Matching Certified Resources
              </span>
            </div>

            {/* FILTERS STRIP */}
            <div className="talent-search-row">
              <div className="talent-search-input-wrap">
                <input
                  type="text"
                  className="ui-input text-xs w-full"
                  placeholder="Search by Employee Name, ID or Exam..."
                  value={talentSearchTerm}
                  onChange={(e) => setTalentSearchTerm(e.target.value)}
                />
              </div>

              <div className="talent-select-wrap">
                <select className="ui-input text-xs w-full" value={talentProviderFilter} onChange={(e) => setTalentProviderFilter(e.target.value)}>
                  <option value="All">All Providers</option>
                  <option value="Informatica">Informatica</option>
                  <option value="Databricks">Databricks</option>
                  <option value="Microsoft">Microsoft</option>
                  <option value="Snowflake">Snowflake</option>
                  <option value="AWS">AWS</option>
                </select>
              </div>

              <div className="talent-select-wrap">
                <select className="ui-input text-xs w-full" value={talentTrackFilter} onChange={(e) => setTalentTrackFilter(e.target.value)}>
                  <option value="All">All Tracks</option>
                  <option value="DE">DE (Data Engineering)</option>
                  <option value="BA">BA (Business Analytics)</option>
                  <option value="Shared">Shared</option>
                </select>
              </div>

              <div className="talent-select-wrap">
                <select className="ui-input text-xs w-full" value={talentValidityFilter} onChange={(e) => setTalentValidityFilter(e.target.value)}>
                  <option value="All">All Validity Status</option>
                  <option value="ACTIVE">Active Only</option>
                  <option value="EXPIRING SOON">Expiring Soon (90 Days)</option>
                </select>
              </div>

              <button
                type="button"
                className="ui-button-secondary text-xs flex items-center justify-center gap-1"
                onClick={handleClearKpiFilter}
              >
                <RotateCcw size={13} /> Clear Filters
              </button>
            </div>

            {/* RESOURCE SELECTION HEADER BAR */}
            <div className="talent-action-strip">
              <div className="talent-action-left">
                <button
                  type="button"
                  className="talent-select-all-btn"
                  onClick={handleSelectAllTalent}
                >
                  {selectedTalentIds.length === filteredCertifiedTalent.length && filteredCertifiedTalent.length > 0 ? (
                    <CheckSquare size={16} className="text-teal-600" />
                  ) : (
                    <Square size={16} />
                  )}
                  Select All Matching
                </button>

                <span className="text-xs font-extrabold text-teal-800 dark:text-teal-300 bg-teal-100 dark:bg-teal-900/60 px-2.5 py-0.5 rounded-lg">
                  {selectedTalentIds.length} Selected
                </span>

                {selectedTalentIds.length > 0 && (
                  <button type="button" className="text-xs text-rose-600 hover:underline font-bold" onClick={() => setSelectedTalentIds([])}>
                    Clear Selection
                  </button>
                )}
              </div>

              <div className="talent-action-right">
                <button type="button" className="ui-button-secondary text-xs py-1 px-3 flex items-center gap-1" onClick={handleExportCSV}>
                  <Download size={14} /> Export List (CSV)
                </button>
                <button type="button" className="ui-button-primary text-xs py-1 px-3 flex items-center gap-1" onClick={() => setShowShareModal(true)}>
                  <Share2 size={14} /> Share with Management
                </button>
              </div>
            </div>

            {/* CERTIFIED TALENT TABLE */}
            <div className="bootcamp-table-wrapper">
              <table className="enterprise-table">
                <thead>
                  <tr>
                    <th className="w-10 text-center">Select</th>
                    <th>Employee</th>
                    <th>Track</th>
                    <th>Certification &amp; Provider</th>
                    <th>Certified On</th>
                    <th>Valid Until</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCertifiedTalent.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="empty-table-cell text-center py-8">
                        <div className="empty-state-wrapper">
                          <Award size={36} className="empty-icon text-slate-400 mx-auto mb-2" />
                          <p className="empty-title font-bold text-slate-700 dark:text-slate-300">No matching certified resources found</p>
                          <p className="empty-desc text-xs text-slate-500">Try adjusting your provider or certification filters above.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredCertifiedTalent.map((item) => {
                      const isSelected = selectedTalentIds.includes(item.traineeId);
                      return (
                        <tr key={item.traineeId} className={`table-row-hover ${isSelected ? 'bg-teal-50/50 dark:bg-teal-900/20' : ''}`}>
                          <td className="text-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleSelectTalent(item.traineeId)}
                              className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
                            />
                          </td>
                          <td>
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-teal-600 text-white font-extrabold text-xs flex items-center justify-center">
                                {item.avatarInitials}
                              </div>
                              <div>
                                <div className="font-extrabold text-sm text-slate-900 dark:text-white">{item.name}</div>
                                <span className="text-xs text-slate-500 dark:text-slate-400">{item.employeeId} • {item.bootcampName}</span>
                              </div>
                            </div>
                          </td>
                          <td><span className="code-chip lg text-[10px]">{item.track}</span></td>
                          <td>
                            <div className="font-bold text-xs text-slate-900 dark:text-white">{item.certificationTitle}</div>
                            <span className="text-[11px] font-extrabold text-teal-600">{item.provider} • {item.examCode}</span>
                          </td>
                          <td className="text-xs font-bold">{item.certifiedDate}</td>
                          <td className="text-xs font-bold">{item.validUntil}</td>
                          <td>
                            <span className={`risk-tag ${item.status === 'ACTIVE' ? 'risk-low' : 'risk-high'}`}>
                              {item.status}
                            </span>
                          </td>
                          <td>
                            <button
                              type="button"
                              className="ui-button-secondary text-xs py-1 px-2.5"
                              onClick={() => setSelectedCertDrawerItem(item)}
                            >
                              View Details →
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 4: PARTNERSHIP TAB                                       */}
      {/* ============================================================ */}
      {activeTab === 'partnership' && (
        <div className="space-y-6">
          <div className="details-section-card">
            <div className="flex items-center justify-between">
              <h3 className="section-heading flex items-center gap-2">
                <ShieldCheck size={18} className="text-teal-600" /> Partner Certification Requirements &amp; Audit Compliance
              </h3>
              <span className="text-xs font-bold text-slate-500">Reusable Multi-Provider Model</span>
            </div>

            <div className="cert-target-cards-grid">
              {partnerships.map((p) => (
                <div key={p.id} className="cert-target-card">
                  <div>
                    <div className="cert-card-header">
                      <span className="font-extrabold text-base text-slate-900 dark:text-white">{p.provider}</span>
                      <span className={`risk-tag ${p.status === 'Requirement Met' ? 'risk-low' : p.status === 'On Track' ? 'risk-medium' : 'risk-high'}`}>
                        {p.status}
                      </span>
                    </div>

                    <span className="code-chip lg text-[10px] mb-3 inline-block">{p.tierName}</span>
                    <p className="cert-card-desc">{p.notes}</p>

                    <div className="partner-card-metrics-grid">
                      <div className="partner-metric-cell req-box">
                        <span className="partner-metric-lbl">Required</span>
                        <strong className="partner-metric-val">{p.requiredCount}</strong>
                      </div>
                      <div className="partner-metric-cell cert-box">
                        <span className="partner-metric-lbl">Certified</span>
                        <strong className="partner-metric-val">{p.certifiedCount}</strong>
                      </div>
                      <div className="partner-metric-cell prep-box">
                        <span className="partner-metric-lbl">Preparing</span>
                        <strong className="partner-metric-val">{p.preparingCount}</strong>
                      </div>
                      <div className="partner-metric-cell gap-box">
                        <span className="partner-metric-lbl">Current Gap</span>
                        <strong className="partner-metric-val">{p.gapCount}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="partner-card-actions">
                    <button
                      type="button"
                      className="ui-button-secondary text-xs"
                      onClick={() => {
                        setActiveTab('talent');
                        setTalentProviderFilter(p.provider);
                      }}
                    >
                      View Certified Talent
                    </button>
                    <button
                      type="button"
                      className="ui-button-primary text-xs"
                      onClick={() => setShowAddPlanModal(true)}
                    >
                      Plan Certification
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 5: CERTIFICATION TRACKER TAB                             */}
      {/* ============================================================ */}
      {activeTab === 'tracker' && (
        <div className="space-y-6">
          <div className="details-section-card">
            <div className="tracker-header-strip">
              <h3 className="section-heading flex items-center gap-2">
                <Clock size={18} className="text-teal-600" /> Certification Lifecycle Tracker &amp; Preparation Candidates
              </h3>

              <div className="flex items-center gap-2">
                <select className="ui-input text-xs py-1" value={trackerStageFilter} onChange={(e) => setTrackerStageFilter(e.target.value)}>
                  <option value="All">All Stages</option>
                  <option value="RECOMMENDED">Recommended</option>
                  <option value="PREPARING">Preparing</option>
                  <option value="EXAM SCHEDULED">Exam Scheduled</option>
                  <option value="PASSED">Passed / Certified</option>
                  <option value="RENEWAL DUE">Renewal Due</option>
                </select>
              </div>
            </div>

            {/* STAGE PIPELINE FLOW INDICATOR */}
            <div className="tracker-pipeline-stepper">
              <div className="tracker-step-item">
                <span className="tracker-step-badge badge-recommended">Recommended</span>
              </div>
              <span className="tracker-step-arrow">→</span>

              <div className="tracker-step-item">
                <span className="tracker-step-badge badge-approved">Approved</span>
              </div>
              <span className="tracker-step-arrow">→</span>

              <div className="tracker-step-item">
                <span className="tracker-step-badge badge-preparing">Preparing</span>
              </div>
              <span className="tracker-step-arrow">→</span>

              <div className="tracker-step-item">
                <span className="tracker-step-badge badge-scheduled">Exam Scheduled</span>
              </div>
              <span className="tracker-step-arrow">→</span>

              <div className="tracker-step-item">
                <span className="tracker-step-badge badge-certified">Passed / Certified</span>
              </div>
              <span className="tracker-step-arrow">→</span>

              <div className="tracker-step-item">
                <span className="tracker-step-badge badge-renewal">Renewal Due</span>
              </div>
            </div>

            {/* TRACKER TABLE */}
            <div className="bootcamp-table-wrapper">
              <table className="enterprise-table">
                <thead>
                  <tr>
                    <th>Candidate</th>
                    <th>Certification &amp; Provider</th>
                    <th>Readiness %</th>
                    <th>Stage</th>
                    <th>Exam Date</th>
                    <th>Voucher Code</th>
                    <th>Next Action</th>
                    <th>Detail</th>
                  </tr>
                </thead>
                <tbody>
                  {trackerItems
                    .filter((r) => trackerStageFilter === 'All' || r.status === trackerStageFilter)
                    .map((item) => (
                      <tr key={item.traineeId} className="table-row-hover">
                        <td>
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-teal-600 text-white font-extrabold text-xs flex items-center justify-center">
                              {item.avatarInitials}
                            </div>
                            <div>
                              <div className="font-extrabold text-xs text-slate-900 dark:text-white">{item.name}</div>
                              <span className="text-[10px] text-slate-400">{item.employeeId}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="font-bold text-xs">{item.certificationTitle}</div>
                          <span className="text-[10px] font-extrabold text-teal-600">{item.provider} • {item.examCode}</span>
                        </td>
                        <td>
                          <div className="flex items-center gap-1.5">
                            <span className="font-extrabold text-xs text-teal-700">{item.readinessScore}%</span>
                            <div className="w-12 bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                              <div className="bg-teal-600 h-full" style={{ width: `${item.readinessScore}%` }} />
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className={`risk-tag ${item.status === 'PASSED' || item.status === 'CERTIFIED' ? 'risk-low' : item.status === 'EXAM SCHEDULED' ? 'risk-medium' : 'risk-high'}`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="text-xs font-bold">{item.examDate || '—'}</td>
                        <td><span className="code-chip lg text-[10px]">{item.voucherCode || 'VOUCH-PENDING'}</span></td>
                        <td className="text-xs text-slate-600 dark:text-slate-300 max-w-xs truncate">{item.nextAction}</td>
                        <td>
                          <button
                            type="button"
                            className="ui-button-secondary text-xs py-1 px-2.5"
                            onClick={() => setSelectedCertDrawerItem(item)}
                          >
                            View Details →
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 6: RESOURCES & VOUCHERS TAB                              */}
      {/* ============================================================ */}
      {activeTab === 'resources' && (
        <div className="space-y-6">
          {/* ANNUAL CERTIFICATION BUDGET STRIP */}
          <div className="details-section-card">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h3 className="section-heading flex items-center gap-2">
                  <DollarSign size={18} className="text-teal-600" /> Annual Certification Budget &amp; Voucher Management (2026)
                </h3>
                <p className="text-xs text-slate-500">Track company certification voucher inventory, discounts, and exam sponsorship funds.</p>
              </div>

              <div className="flex items-center gap-4 text-xs">
                <div className="bg-slate-50 dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Allocated Budget</span>
                  <strong className="text-slate-900 dark:text-white text-sm font-black">$25,000 USD</strong>
                </div>
                <div className="bg-teal-50 dark:bg-teal-900/40 p-2.5 rounded-xl border border-teal-200 dark:border-teal-800">
                  <span className="text-teal-600 block text-[10px] uppercase font-bold">Used Funds</span>
                  <strong className="text-teal-700 dark:text-teal-300 text-sm font-black">$16,500 USD</strong>
                </div>
                <div className="bg-emerald-50 dark:bg-emerald-900/40 p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800">
                  <span className="text-emerald-600 block text-[10px] uppercase font-bold">Remaining</span>
                  <strong className="text-emerald-700 dark:text-emerald-300 text-sm font-black">$8,500 USD</strong>
                </div>
              </div>
            </div>
          </div>

          {/* VOUCHER INVENTORY CARDS */}
          <div className="cert-target-cards-grid">
            {resources.map((res) => (
              <div key={res.id} className="cert-target-card">
                <div>
                  <div className="cert-card-header">
                    <span className="code-chip lg">{res.provider}</span>
                    <span className="font-extrabold text-xs text-slate-600 dark:text-slate-300">{res.certificationCode}</span>
                  </div>

                  <h4 className="cert-card-title">{res.title}</h4>
                  <p className="cert-card-desc"><strong>Exam Cost:</strong> {res.examCost} • <strong>Deadline:</strong> {res.deadline}</p>

                  <div className="cert-card-metrics-grid">
                    <div className="cert-metric-box target-box">
                      <span className="cert-metric-lbl">Total</span>
                      <strong className="cert-metric-val">{res.totalVouchers}</strong>
                    </div>
                    <div className="cert-metric-box done-box">
                      <span className="cert-metric-lbl">Avail</span>
                      <strong className="cert-metric-val">{res.availableVouchers}</strong>
                    </div>
                    <div className="cert-metric-box prep-box">
                      <span className="cert-metric-lbl">Assigned</span>
                      <strong className="cert-metric-val">{res.assignedVouchers}</strong>
                    </div>
                    <div className="cert-metric-box gap-box">
                      <span className="cert-metric-lbl">Used</span>
                      <strong className="cert-metric-val">{res.usedVouchers}</strong>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-teal-700 dark:text-teal-300 font-bold">
                    <a href={res.learningPathUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:underline">
                      <ExternalLink size={12} /> Official Learning Path
                    </a>
                    <a href={res.examGuideUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:underline">
                      <ExternalLink size={12} /> Official Exam Study Guide
                    </a>
                    <a href={res.practiceTestUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:underline">
                      <ExternalLink size={12} /> Practice Mock Assessments
                    </a>
                  </div>
                </div>

                <button
                  type="button"
                  className="ui-button-primary text-xs w-full mt-4 py-1.5"
                  onClick={() => setShowAssignVoucherModal(true)}
                >
                  + Assign Voucher Code
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODALS & DRAWERS                                             */}
      {/* ============================================================ */}

      {/* 1. ADD CERTIFICATION PLAN MODAL */}
      {showAddPlanModal && (
        <div className="cert-modal-overlay" onClick={() => setShowAddPlanModal(false)}>
          <div className="cert-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="cert-modal-header">
              <h3 className="cert-modal-title">
                <Plus size={18} className="text-teal-600" /> Add Certification Target Plan
              </h3>
              <button type="button" className="cert-modal-close" onClick={() => setShowAddPlanModal(false)}><X size={16} /></button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              showToast('Certification target plan created successfully');
              setShowAddPlanModal(false);
            }} className="cert-modal-body">
              <div className="cert-form-group">
                <label className="cert-form-label">Provider</label>
                <select className="ui-input w-full text-xs" value={planProvider} onChange={(e) => setPlanProvider(e.target.value)}>
                  <option value="Microsoft">Microsoft</option>
                  <option value="Databricks">Databricks</option>
                  <option value="Informatica">Informatica</option>
                  <option value="Snowflake">Snowflake</option>
                  <option value="AWS">AWS</option>
                </select>
              </div>

              <div className="cert-form-group">
                <label className="cert-form-label">Certification Title &amp; Code</label>
                <input type="text" className="ui-input w-full text-xs" value={planCertTitle} onChange={(e) => setPlanCertTitle(e.target.value)} required />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.65rem' }}>
                <div className="cert-form-group">
                  <label className="cert-form-label">Quarter</label>
                  <select className="ui-input w-full text-xs" value={planQuarter} onChange={(e) => setPlanQuarter(e.target.value)}>
                    <option value="Q1">Q1 2026</option>
                    <option value="Q2">Q2 2026</option>
                    <option value="Q3">Q3 2026</option>
                    <option value="Q4">Q4 2026</option>
                  </select>
                </div>
                <div className="cert-form-group">
                  <label className="cert-form-label">Target Count</label>
                  <input type="number" className="ui-input w-full text-xs" value={planTarget} onChange={(e) => setPlanTarget(Number(e.target.value))} required />
                </div>
                <div className="cert-form-group">
                  <label className="cert-form-label">Track</label>
                  <select className="ui-input w-full text-xs" value={planTrack} onChange={(e) => setPlanTrack(e.target.value)}>
                    <option value="DE">DE</option>
                    <option value="BA">BA</option>
                    <option value="Shared">Shared</option>
                  </select>
                </div>
              </div>

              <div className="cert-modal-footer">
                <button type="button" className="ui-button-secondary text-xs" onClick={() => setShowAddPlanModal(false)}>Cancel</button>
                <button type="submit" className="ui-button-primary text-xs">Create Plan Target</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. SHARE WITH MANAGEMENT MODAL PREVIEW */}
      {showShareModal && (
        <div className="cert-modal-overlay" onClick={() => setShowShareModal(false)}>
          <div className="cert-modal-card" style={{ maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
            <div className="cert-modal-header">
              <h3 className="cert-modal-title">
                <Mail size={18} className="text-teal-600" /> Share Certified Talent Report with Management
              </h3>
              <button type="button" className="cert-modal-close" onClick={() => setShowShareModal(false)}><X size={16} /></button>
            </div>

            <div className="cert-modal-body">
              <div className="p-3 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-xl text-amber-800 dark:text-amber-300 font-bold flex items-center gap-2 text-xs">
                <Mail size={16} /> Demo Email Preview — Simulated Dispatch
              </div>

              <div className="cert-form-group">
                <label className="cert-form-label">Recipient Email</label>
                <input type="email" className="ui-input w-full text-xs" defaultValue="management.delivery@systechusa.com" />
              </div>

              <div className="cert-form-group">
                <label className="cert-form-label">Subject</label>
                <input type="text" className="ui-input w-full text-xs" defaultValue={`Certified Resources Report — ${selectedTalentIds.length || filteredCertifiedTalent.length} Matching Resources`} />
              </div>

              <div className="cert-form-group">
                <label className="cert-form-label">Email Body Preview</label>
                <textarea
                  className="ui-input w-full text-xs font-mono"
                  style={{ height: '110px' }}
                  readOnly
                  value={`Hi Management,\n\nPlease find the requested list of certified resources:\n\n- Requested Category: Informatica / Databricks\n- Selected Certified Resources: ${selectedTalentIds.length || filteredCertifiedTalent.length}\n- Status: All active credentials verified\n\nAttached CSV summary contains Employee Name, Employee ID, Track, Credential ID and Validity Dates.\n\nRegards,\nL&D Operations Team`}
                />
              </div>

              <div className="cert-modal-footer">
                <button type="button" className="ui-button-secondary text-xs" onClick={() => setShowShareModal(false)}>Close Preview</button>
                <button
                  type="button"
                  className="ui-button-primary text-xs flex items-center gap-1"
                  onClick={() => {
                    showToast('Report email sent to Management');
                    setShowShareModal(false);
                  }}
                >
                  <Send size={14} /> Send Email Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. ASSIGN VOUCHER MODAL */}
      {showAssignVoucherModal && (
        <div className="cert-modal-overlay" onClick={() => setShowAssignVoucherModal(false)}>
          <div className="cert-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="cert-modal-header">
              <h3 className="cert-modal-title">
                <Ticket size={18} className="text-teal-600" /> Assign Certification Voucher Code
              </h3>
              <button type="button" className="cert-modal-close" onClick={() => setShowAssignVoucherModal(false)}><X size={16} /></button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              showToast('Voucher code assigned to employee');
              setShowAssignVoucherModal(false);
            }} className="cert-modal-body">
              <div className="cert-form-group">
                <label className="cert-form-label">Select Candidate</label>
                <select className="ui-input w-full text-xs" value={voucherEmployee} onChange={(e) => setVoucherEmployee(e.target.value)}>
                  <option value="Kaviram (EMP001)">Kaviram Sudharajanainar Paramasivan (EMP001)</option>
                  <option value="Saran (EMP002)">Saran Mani (EMP002)</option>
                  <option value="Amuthanilavan (EMP003)">Amuthanilavan (EMP003)</option>
                </select>
              </div>

              <div className="cert-form-group">
                <label className="cert-form-label">Certification Exam</label>
                <select className="ui-input w-full text-xs" value={voucherCert} onChange={(e) => setVoucherCert(e.target.value)}>
                  <option value="Databricks DP-750">Databricks Certified Data Engineer (DP-750)</option>
                  <option value="Microsoft DP-700">Fabric Data Engineer Associate (DP-700)</option>
                  <option value="Informatica INF-CDI">Informatica Cloud Data Integration (INF-CDI)</option>
                </select>
              </div>

              <div className="cert-form-group">
                <label className="cert-form-label">Voucher Reference Code</label>
                <input type="text" className="ui-input w-full text-xs font-mono font-bold" value={voucherCode} onChange={(e) => setVoucherCode(e.target.value)} required />
              </div>

              <div className="cert-modal-footer">
                <button type="button" className="ui-button-secondary text-xs" onClick={() => setShowAssignVoucherModal(false)}>Cancel</button>
                <button type="submit" className="ui-button-primary text-xs">Assign Voucher</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. CERTIFICATION DETAIL DRAWER */}
      {selectedCertDrawerItem && (
        <div className="cert-modal-overlay" onClick={() => setSelectedCertDrawerItem(null)}>
          <motion.div
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            className="cert-modal-card"
            style={{ maxWidth: '520px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="cert-modal-header">
              <h3 className="cert-modal-title">
                <Award size={18} className="text-teal-600" /> Certification Credential Details
              </h3>
              <button type="button" className="cert-modal-close" onClick={() => setSelectedCertDrawerItem(null)}><X size={16} /></button>
            </div>

            <div className="cert-modal-body" style={{ maxHeight: '80vh', overflowY: 'auto' }}>
              <div className="drawer-user-card">
                <div className="drawer-avatar-circle">
                  {selectedCertDrawerItem.avatarInitials}
                </div>
                <div className="drawer-user-details">
                  <h4 className="drawer-user-name">{selectedCertDrawerItem.name}</h4>
                  <span className="drawer-user-subtitle">{selectedCertDrawerItem.employeeId} • {selectedCertDrawerItem.bootcampName}</span>
                </div>
              </div>

              <div className="drawer-info-grid">
                <div className="drawer-info-cell">
                  <span className="info-label">Certification Title</span>
                  <span className="info-val">{selectedCertDrawerItem.certificationTitle}</span>
                </div>

                <div className="drawer-two-col-row">
                  <div className="drawer-info-cell">
                    <span className="info-label">Provider / Exam</span>
                    <span className="info-val">{('provider' in selectedCertDrawerItem ? selectedCertDrawerItem.provider : 'Microsoft')} • {selectedCertDrawerItem.examCode}</span>
                  </div>

                  <div className="drawer-info-cell">
                    <span className="info-label">Credential ID</span>
                    <span className="info-val font-mono">{(selectedCertDrawerItem as any).credentialId || 'MS-CERT-904812'}</span>
                  </div>
                </div>

                <div className="drawer-two-col-row">
                  <div className="drawer-info-cell">
                    <span className="info-label">Certified Date</span>
                    <span className="info-val">{(selectedCertDrawerItem as any).certifiedDate || '12 Aug 2026'}</span>
                  </div>

                  <div className="drawer-info-cell">
                    <span className="info-label">Valid Until</span>
                    <span className="info-val">{(selectedCertDrawerItem as any).validUntil || '12 Aug 2028'}</span>
                  </div>
                </div>

                <div className="drawer-info-cell">
                  <span className="info-label">Official Verification URL</span>
                  <a
                    href={(selectedCertDrawerItem as any).verificationUrl || 'https://learn.microsoft.com/verify'}
                    target="_blank"
                    rel="noreferrer"
                    className="info-val text-teal-600 hover:underline flex items-center gap-1"
                  >
                    <ExternalLink size={12} /> {(selectedCertDrawerItem as any).verificationUrl || 'https://learn.microsoft.com/verify'}
                  </a>
                </div>
              </div>

              {/* CERTIFICATE SEAL BADGE */}
              <div className="drawer-seal-card">
                <Award size={36} className="text-teal-600 mb-1" />
                <span className="block font-black text-xs text-slate-800 dark:text-slate-200 uppercase tracking-widest">OFFICIAL CERTIFICATION EVIDENCE</span>
                <span className="block text-[11px] text-slate-500">Verified by L&amp;D Enterprise Credential Registry</span>
              </div>

              <div className="cert-modal-footer">
                <button
                  type="button"
                  className="ui-button-secondary text-xs"
                  onClick={() => {
                    showToast('Renewal plan started for candidate');
                    setSelectedCertDrawerItem(null);
                  }}
                >
                  Start Renewal Plan
                </button>
                <button
                  type="button"
                  className="ui-button-primary text-xs"
                  onClick={() => {
                    showToast('Official credential verified against provider database');
                  }}
                >
                  Verify Credential ✓
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* 6. FLOATING BOTTOM-RIGHT AI CERTIFICATION CHATBOT WIDGET */}
      <CertificationChatbotWidget
        onSelectTalentFilter={(provider) => {
          setActiveTab('talent');
          setTalentProviderFilter(provider);
        }}
      />
    </div>
  );
};
