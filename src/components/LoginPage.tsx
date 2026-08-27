import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  KeyRound,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { DEMO_CREDENTIALS } from '../services/authService';
import systechLogo from '../assets/systech-logo.png';
import ldClassroomScene from '../assets/ld_classroom_scene.jpg';

interface LoginPageProps {
  onLoginSuccess?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const { login } = useAuth();

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Authentication feedback states
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Desktop subtle cursor parallax offset
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Image error fallback states
  const [logoFailed, setLogoFailed] = useState(false);
  const [artFailed, setArtFailed] = useState(false);

  useEffect(() => {
    // Respect prefers-reduced-motion settings
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) return;

    const handleMouseMove = (e: MouseEvent) => {
      const x = e.clientX / window.innerWidth - 0.5;
      const y = e.clientY / window.innerHeight - 0.5;
      setMousePos({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Form submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    setIsLoading(true);
    await new Promise((res) => setTimeout(res, 300));
    const result = await login({ email, password, rememberMe });
    setIsLoading(false);

    if (result.success) {
      setIsSuccess(true);
      setTimeout(() => {
        if (onLoginSuccess) onLoginSuccess();
      }, 400);
    } else {
      setErrorMessage(result.errorMessage || 'Invalid email or password.');
    }
  };

  // Demo credentials autofill
  const handleUseDemoCredentials = () => {
    setEmail(DEMO_CREDENTIALS.email);
    setPassword(DEMO_CREDENTIALS.password);
    setErrorMessage(null);
  };

  // Forgot password click handler
  const handleForgotPassword = (e: React.MouseEvent) => {
    e.preventDefault();
    setErrorMessage('Systech Password Reset: Please contact your L&D Administrator.');
  };

  return (
    <div className="login-page">
      {/* ========================================================================= */}
      {/* LEFT PANEL — FULL-HEIGHT CLASSROOM ILLUSTRATION AREA (~58% width)         */}
      {/* ========================================================================= */}
      <div className="login-visual-panel">
        {/* ========================================================================= */}
        {/* CENTERED ORBITAL ANIMATION CONTAINER (GROUPED EXACTLY BEHIND IMAGE)       */}
        {/* ========================================================================= */}
        <div
          className="center-orbit-animation"
          style={{
            transform: `translate(calc(-50% + ${mousePos.x * 6}px), calc(-50% + ${mousePos.y * 6}px))`,
          }}
        >
          {/* CENTER SOFT TEAL GLOW */}
          <div className="center-glow" />

          {/* 3 CONCENTRIC BREATHING RINGS */}
          <div className="center-ring ring-1" />
          <div className="center-ring ring-2" />
          <div className="center-ring ring-3" />

          {/* ORBITING DOTS AROUND THE CENTER */}
          <div className="orbit-wrapper orbit-1">
            <div className="orbit-dot dot-size-1" />
          </div>
          <div className="orbit-wrapper orbit-2">
            <div className="orbit-dot dot-size-2" />
          </div>
          <div className="orbit-wrapper orbit-3">
            <div className="orbit-dot dot-size-3" />
          </div>
          <div className="orbit-wrapper orbit-4">
            <div className="orbit-dot dot-size-4" />
          </div>
          <div className="orbit-wrapper orbit-5">
            <div className="orbit-dot dot-size-2" />
          </div>

          {/* OPTIONAL CENTERED DASHBOARD PARTICLES */}
          <div className="floating-particle particle-1" />
          <div className="floating-particle particle-2" />
          <div className="floating-particle particle-3" />
        </div>

        {/* INTEGRATED CLASSROOM ILLUSTRATION (STRAIGHT & CENTERED) */}
        <div className="classroom-artwork-wrapper">
          {!artFailed ? (
            <img
              src={ldClassroomScene}
              alt="L&D Training Classroom Scene"
              className="classroom-art-image"
              onError={() => setArtFailed(true)}
            />
          ) : (
            <div className="classroom-art-fallback" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#0f766e', textAlign: 'center', padding: '2rem' }}>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Systech L&amp;D Learning Platform</div>
              <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>Enterprise Training &amp; Skill Telemetry</div>
            </div>
          )}
        </div>

        {/* SMALL SUBTLE BOTTOM CAPTION */}
        <div className="left-panel-bottom-caption">
          <p className="caption-primary">Transform learning into workforce readiness.</p>
          <p className="caption-secondary">Train. Measure. Develop. Deploy.</p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* RIGHT PANEL — FULL-HEIGHT CLEAN LOGIN FORM AREA (~42% width)              */}
      {/* ========================================================================= */}
      <div className="login-form-panel">
        <div className="login-form-container">
          {/* LEFT-ALIGNED BRAND LOGO */}
          <div className="form-header-logo">
            {!logoFailed ? (
              <img
                src={systechLogo}
                alt="Systech Solutions Logo"
                className="login-systech-logo"
                onError={() => setLogoFailed(true)}
              />
            ) : (
              <div className="logo-fallback-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 12px', background: 'rgba(15, 118, 110, 0.1)', borderRadius: '8px', border: '1px solid rgba(15, 118, 110, 0.2)' }}>
                <span style={{ fontWeight: 800, fontSize: '1.2rem', color: '#005bb5', letterSpacing: '0.05em' }}>SYSTECH</span>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#0f766e', background: 'rgba(15, 118, 110, 0.15)', padding: '2px 6px', borderRadius: '4px' }}>L&amp;D</span>
              </div>
            )}
          </div>

          {/* LEFT-ALIGNED HEADING & SUBTITLE */}
          <div className="form-title-group">
            <h1 className="login-title">Welcome Back</h1>
            <p className="login-subtitle">
              Sign in to access the Learning &amp; Skill Intelligence Platform.
            </p>
          </div>

          {/* INLINE SUCCESS BANNER */}
          {isSuccess && (
            <div className="inline-alert success">
              <CheckCircle2 size={16} />
              <span>✓ Login Successful! Redirecting...</span>
            </div>
          )}

          {/* INLINE ERROR BANNER */}
          {errorMessage && (
            <div className="inline-alert error">
              <AlertCircle size={16} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* LOGIN FORM */}
          <form onSubmit={handleSubmit} className="clean-login-form" noValidate>
            {/* WORK EMAIL FIELD */}
            <div className="field-group">
              <label htmlFor="login-work-email" className="field-label">
                Work Email
              </label>
              <div className="input-wrapper">
                <span className="left-icon">
                  <Mail size={18} />
                </span>
                <input
                  id="login-work-email"
                  type="email"
                  className="clean-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@ldplatform.com"
                  disabled={isLoading || isSuccess}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            {/* PASSWORD FIELD */}
            <div className="field-group">
              <label htmlFor="login-work-password" className="field-label">
                Password
              </label>
              <div className="input-wrapper password">
                <span className="left-icon">
                  <Lock size={18} />
                </span>
                <input
                  id="login-work-password"
                  type={showPassword ? 'text' : 'password'}
                  className="clean-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  disabled={isLoading || isSuccess}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="eye-icon"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex={0}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* REMEMBER ME & FORGOT PASSWORD */}
            <div className="options-row">
              <label className="remember-checkbox font-sans">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={isLoading || isSuccess}
                  className="check-input"
                />
                <span className="check-text">Remember me</span>
              </label>

              <a
                href="#forgot-password"
                className="forgot-link font-sans"
                onClick={handleForgotPassword}
              >
                Forgot password?
              </a>
            </div>

            {/* DEMO CREDENTIALS BUTTON */}
            <div className="demo-credentials-row">
              <button
                type="button"
                onClick={handleUseDemoCredentials}
                className="demo-btn"
                disabled={isLoading || isSuccess}
              >
                <KeyRound size={14} />
                <span>Use Demo Credentials</span>
              </button>
            </div>

            {/* SIGN IN BUTTON */}
            <button
              type="submit"
              className={`signin-btn ${isLoading ? 'loading' : ''} ${isSuccess ? 'success' : ''}`}
              disabled={isLoading || isSuccess}
            >
              {isLoading ? (
                <div className="btn-inner">
                  <span className="btn-spinner" />
                  <span>Signing In...</span>
                </div>
              ) : isSuccess ? (
                <div className="btn-inner">
                  <CheckCircle2 size={18} />
                  <span>✓ Login Successful</span>
                </div>
              ) : (
                <div className="btn-inner">
                  <span>Sign In</span>
                  <ArrowRight size={18} className="btn-arrow" />
                </div>
              )}
            </button>
          </form>

          {/* FOOTER CAPTION */}
          <div className="form-footer-caption">
            <span>Protected by Enterprise Encryption</span>
            <span className="bullet-sep">•</span>
            <span>Systech Solutions L&amp;D Intelligence</span>
          </div>
        </div>
      </div>
    </div>
  );
};
