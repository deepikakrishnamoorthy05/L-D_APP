import React, { useState } from 'react';
import { GraduationCap, Brain, BarChart3, Award, Sparkles, TrendingUp, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { ThreeVisualizer } from './ThreeVisualizer';
import systechLogo from '../assets/systech-logo.png';

export const LeftVisualPanel: React.FC = () => {
  const [logoFailed, setLogoFailed] = useState(false);

  return (
    <div className="login-left-visual-container">
      {/* Background Teal Gradient Lighting */}
      <div className="visual-bg-teal-glow" />

      {/* Brand Header */}
      <div className="visual-brand-header">
        <div className="visual-logo-pill">
          {!logoFailed ? (
            <img src={systechLogo} alt="Systech Solutions Logo" className="visual-logo-img" onError={() => setLogoFailed(true)} />
          ) : (
            <span style={{ fontWeight: 800, color: '#005bb5' }}>SYSTECH</span>
          )}
          <span className="visual-divider">•</span>
          <span className="visual-platform-tag">L&amp;D PLATFORM</span>
        </div>
      </div>

      {/* Main Headlines */}
      <div className="visual-text-content">
        <h1 className="visual-main-heading">
          Enterprise Learning <br />
          <span className="gradient-teal-text">&amp; Talent Intelligence</span>
        </h1>
        <p className="visual-subtitle">
          Manage bootcamps, trainees, learning sessions, performance, skills, certifications and workforce readiness from one intelligent platform.
        </p>
      </div>

      {/* Animated Learning Visual Container */}
      <div className="visual-canvas-wrapper">
        <ThreeVisualizer />

        {/* Floating Feature Pills overlay */}
        <div className="floating-feature-pills">
          <div className="feature-pill pill-1">
            <GraduationCap size={15} className="pill-icon text-teal-600" />
            <span>4 Active Bootcamps</span>
          </div>
          <div className="feature-pill pill-2">
            <Brain size={15} className="pill-icon text-cyan-600" />
            <span>28 Trainee Telemetry Records</span>
          </div>
          <div className="feature-pill pill-3">
            <Award size={15} className="pill-icon text-indigo-600" />
            <span>Microsoft Fabric &amp; Databricks Tracks</span>
          </div>
        </div>
      </div>

      {/* Footer Trust Tag */}
      <div className="visual-footer-bar">
        <div className="visual-trust-badge">
          <ShieldCheck size={14} className="text-teal-600" />
          <span>Enterprise Grade Security</span>
        </div>
        <div className="visual-trust-badge">
          <CheckCircle2 size={14} className="text-teal-600" />
          <span>Real-time Skill Telemetry</span>
        </div>
      </div>
    </div>
  );
};
