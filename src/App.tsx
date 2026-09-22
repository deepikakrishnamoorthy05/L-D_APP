import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginPage } from './components/LoginPage';
import { AppShell } from './components/CommandCenter/AppShell';
import { BootcampProvider } from './context/BootcampContext';
import { TraineeProvider } from './context/TraineeContext';
import { SessionProvider } from './context/SessionContext';
import { AssessmentProvider } from './context/AssessmentContext';
import { FeedbackProvider } from './context/FeedbackContext';
import { LiveQuizParticipantView } from './components/Assessments/LiveQuizParticipantView';
import { CandidateQuizAttemptView } from './components/Assessments/CandidateQuizAttemptView';
import { getHealthStatus, apiClient } from './services/api';
import './App.css';

const MainAppContent: React.FC = () => {
  const { isAuthenticated, logout } = useAuth();
  const [, setLocationPath] = useState(window.location.pathname);

  useEffect(() => {
    // Non-blocking application startup health check
    getHealthStatus()
      .then((data) => {
        if (import.meta.env.DEV) {
          console.log(`[Backend API] Successfully connected to NestJS backend at ${apiClient.getBaseUrl()}:`, data);
        }
      })
      .catch((err) => {
        if (import.meta.env.DEV) {
          console.warn(`[Backend API] Backend unreachable at ${apiClient.getBaseUrl()}:`, err);
        }
      });
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      setLocationPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      if (!window.location.pathname.startsWith('/quiz/')) {
        window.history.replaceState(null, '', '/login');
        setLocationPath('/login');
      }
    } else {
      if (window.location.pathname === '/' || window.location.pathname === '/login') {
        window.history.replaceState(null, '', '/command-center');
        setLocationPath('/command-center');
      }
    }
  }, [isAuthenticated]);

  // Support /quiz/attempt/:token URL route for candidate secure invitations
  const isQuizAttemptPath = window.location.pathname.startsWith('/quiz/attempt/');
  const attemptTokenParam = window.location.pathname.split('/quiz/attempt/')[1] || '';

  if (isQuizAttemptPath && attemptTokenParam) {
    return (
      <CandidateQuizAttemptView
        token={attemptTokenParam}
        onExit={() => {
          window.history.pushState(null, '', '/command-center');
          setLocationPath('/command-center');
        }}
      />
    );
  }

  // Support /quiz/join URL route for participants
  const isQuizJoinPath = window.location.pathname.startsWith('/quiz/join');
  const urlParams = new URLSearchParams(window.location.search);
  const joinCodeParam = urlParams.get('code') || window.location.pathname.split('/quiz/join/')[1] || '482913';

  if (isQuizJoinPath) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--surface-0)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
        <LiveQuizParticipantView
          isOpen={true}
          onClose={() => {
            window.history.pushState(null, '', '/command-center');
            setLocationPath('/command-center');
          }}
          initialJoinCode={joinCodeParam}
        />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <LoginPage onLoginSuccess={() => {
        window.history.replaceState(null, '', '/command-center');
        setLocationPath('/command-center');
      }} />
    );
  }

  return (
    <AppShell onLogout={logout} />
  );
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BootcampProvider>
          <TraineeProvider>
            <SessionProvider>
              <AssessmentProvider>
                <FeedbackProvider>
                  <MainAppContent />
                </FeedbackProvider>
              </AssessmentProvider>
            </SessionProvider>
          </TraineeProvider>
        </BootcampProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
