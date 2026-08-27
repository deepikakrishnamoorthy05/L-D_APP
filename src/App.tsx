import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginPage } from './components/LoginPage';
import { AppShell } from './components/CommandCenter/AppShell';
import { BootcampProvider } from './context/BootcampContext';
import { TraineeProvider } from './context/TraineeContext';
import { SessionProvider } from './context/SessionContext';
import { AssessmentProvider } from './context/AssessmentContext';
import { FeedbackProvider } from './context/FeedbackContext';
import './App.css';

const MainAppContent: React.FC = () => {
  const { isAuthenticated, logout } = useAuth();
  const [, setLocationPath] = useState(window.location.pathname);

  useEffect(() => {
    document.documentElement.removeAttribute('data-theme');
    localStorage.removeItem('systech_theme');
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
      if (window.location.pathname !== '/login') {
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
  );
};

export default App;
