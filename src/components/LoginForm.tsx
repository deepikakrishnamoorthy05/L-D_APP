import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ShieldCheck, AlertCircle, ArrowRight, CheckCircle2, Sparkles, KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { DEMO_CREDENTIALS } from '../services/authService';
import systechLogo from '../assets/systech-logo.png';

interface LoginFormProps {
  onLoginSuccess?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Auth execution states
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Field focus states for floating label glow effect
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [logoFailed, setLogoFailed] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setStatusMessage(null);

    setIsLoading(true);
    setStatusMessage('Signing In...');

    await new Promise((res) => setTimeout(res, 300));

    const result = await login({ email, password, rememberMe });

    setIsLoading(false);

    if (result.success) {
      setIsSuccess(true);
      setStatusMessage('✓ Login Successful');
      setTimeout(() => {
        if (onLoginSuccess) onLoginSuccess();
      }, 400);
    } else {
      setErrorMessage(result.errorMessage || 'Invalid email or password.');
    }
  };

  const handleForgotPassword = (e: React.MouseEvent) => {
    e.preventDefault();
    setErrorMessage('Systech SSO Password Reset: Please contact your L&D Administrator.');
  };

  const handleUseDemoCredentials = () => {
    setEmail(DEMO_CREDENTIALS.email);
    setPassword(DEMO_CREDENTIALS.password);
    setErrorMessage(null);
  };

  return (
    <div className="login-panel-wrapper">
      <div className={`glass-login-card ${isSuccess ? 'card-success-glow' : ''}`}>
        
        {/* Top Logo Section with Clear Space */}
        <div className="logo-container">
          {!logoFailed ? (
            <img
              src={systechLogo}
              alt="Systech Solutions Logo"
              className="systech-brand-logo"
              onError={() => setLogoFailed(true)}
            />
          ) : (
            <span style={{ fontWeight: 800, fontSize: '1.2rem', color: '#005bb5' }}>SYSTECH</span>
          )}
        </div>

        {/* Branding Header Section */}
        <div className="branding-header">
          <h1 className="login-title">Learning &amp; Skill Intelligence</h1>

          <p className="login-subtitle">
            "Intelligent learning insights for continuous employee growth."
          </p>
        </div>

        {/* AI Status Indicator */}
        <div className="ai-status-bar">
          <div className="ai-status-indicator">
            <span className="cyan-pulse-dot" />
            <span className="ai-status-text">Learning Intelligence Online</span>
          </div>
          <div className="sso-encrypted-tag">
            <ShieldCheck size={13} />
            <span>Enterprise SSO 256-bit</span>
          </div>
        </div>

        {/* Success Banner */}
        {isSuccess && (
          <div className="alert-banner alert-success" role="alert">
            <CheckCircle2 size={16} />
            <span>{statusMessage || '✓ Login Successful'}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="login-form" noValidate>
          {/* Work Email Field */}
          <div className={`form-group ${emailFocused ? 'focused' : ''} ${email ? 'has-value' : ''}`}>
            <label htmlFor="work-email" className="input-label">
              Work Email
            </label>
            <div className="email-input-wrapper">
              <Mail className="email-input-icon" size={18} />
              <input
                id="work-email"
                type="email"
                className="form-input email-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
                placeholder="admin@ldplatform.com"
                disabled={isLoading || isSuccess}
                autoComplete="email"
                required
              />
            </div>
          </div>

          {/* Password Field */}
          <div className={`form-group ${passwordFocused ? 'focused' : ''} ${password ? 'has-value' : ''}`}>
            <label htmlFor="work-password" className="input-label">
              Password
            </label>
            <div className="input-wrapper password-wrapper">
              <Lock className="input-left-icon password-lock" size={20} />
              <input
                id="work-password"
                type={showPassword ? 'text' : 'password'}
                className="form-input login-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
                placeholder="Enter password"
                disabled={isLoading || isSuccess}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="password-toggle-btn password-eye"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                tabIndex={0}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Error Feedback Message neatly below password field */}
          {errorMessage && (
            <div className="alert-banner alert-error" role="alert" style={{ marginTop: '0.25rem', marginBottom: '0.25rem' }}>
              <AlertCircle size={16} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Remember Me & Forgot Password Row */}
          <div className="form-options-row">
            <label className="checkbox-label">
              <input
                type="checkbox"
                className="custom-checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={isLoading || isSuccess}
              />
              <span className="checkbox-text">Remember me</span>
            </label>

            <a
              href="#forgot-password"
              className="forgot-password-link"
              onClick={handleForgotPassword}
            >
              Forgot password?
            </a>
          </div>

          {/* Demo Credentials Quick Fill Button */}
          <div className="demo-credentials-quickfill" style={{ margin: '12px 0' }}>
            <button
              type="button"
              className="demo-credentials-fill-btn"
              onClick={handleUseDemoCredentials}
              disabled={isLoading || isSuccess}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid rgba(15, 118, 110, 0.25)',
                background: 'rgba(15, 118, 110, 0.08)',
                color: '#0f766e',
                fontWeight: 600,
                fontSize: '0.78rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              <KeyRound size={14} />
              <span>Use Demo Credentials</span>
            </button>
          </div>

          {/* Sign In Button */}
          <button
            type="submit"
            className={`submit-btn ${isLoading ? 'loading' : ''} ${isSuccess ? 'success' : ''}`}
            disabled={isLoading || isSuccess}
            style={{ height: '50px', width: '100%' }}
          >
            {isLoading ? (
              <div className="btn-loading-state" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <span className="btn-spinner" />
                <span>Signing In...</span>
              </div>
            ) : isSuccess ? (
              <div className="btn-success-state" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <CheckCircle2 size={18} />
                <span>✓ Login Successful</span>
              </div>
            ) : (
              <div className="btn-default-state" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <span>Sign In</span>
                <ArrowRight size={18} className="btn-arrow" />
              </div>
            )}
          </button>
        </form>

        {/* Footer Security Notice */}
        <div className="card-footer-notice">
          <span>Protected by Enterprise Encryption</span>
          <span className="dot-separator">•</span>
          <span>Systech Solutions L&amp;D Intelligence</span>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
