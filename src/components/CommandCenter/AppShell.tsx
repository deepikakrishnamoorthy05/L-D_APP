import React, { useLayoutEffect, useRef, useState } from 'react';
import { Sidebar } from './Sidebar';
import { CommandCenterView } from './CommandCenterView';
import { BootcampManagement } from '../Bootcamps/BootcampManagement';
import { BootcampDetails } from '../Bootcamps/BootcampDetails';
import { TraineeManagement } from '../Trainees/TraineeManagement';
import { TraineeProfile } from '../Trainees/TraineeProfile';
import { TrainingManagement } from '../Training/TrainingManagement';
import { TrainingProvider } from '../../context/TrainingContext';
import { SessionManagement } from '../Sessions/SessionManagement';
import { SessionDetails } from '../Sessions/SessionDetails';
import { AttendanceManagement } from '../Sessions/AttendanceManagement';
import { AssessmentManagement } from '../Assessments/AssessmentManagement';
import { FeedbackManagement } from '../Feedback/FeedbackManagement';
import { SkillIntelligenceView } from '../SkillIntelligence/SkillIntelligenceView';
import { CertificationIntelligenceView } from '../Certifications/CertificationIntelligenceView';
import { AnalyticsView } from '../Analytics/AnalyticsView';
import { useBootcamps } from '../../context/BootcampContext';
import { CheckCircle2, Menu } from 'lucide-react';
import systechLogo from '../../assets/systech-logo.png';

interface AppShellProps {
  onLogout: () => void;
}

export const AppShell: React.FC<AppShellProps> = ({ onLogout }) => {
  const mainViewportRef = useRef<HTMLElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getNavFromPath = () => {
    const rawPath = window.location.pathname.replace(/^\//, '');
    if (rawPath === 'sessions') {
      window.history.replaceState(null, '', '/calendar');
      return 'calendar';
    }
    const validNavs = [
      'command-center',
      'bootcamps',
      'training',
      'trainees',
      'calendar',
      'sessions',
      'assessments',
      'feedback',
      'skill-intelligence',
      'certifications',
      'analytics'
    ];
    return validNavs.includes(rawPath) ? (rawPath === 'sessions' ? 'calendar' : rawPath) : 'command-center';
  };

  const [currentNav, setCurrentNav] = useState<string>(getNavFromPath);

  // Reset viewport scroll position before rendering new page
  useLayoutEffect(() => {
    mainViewportRef.current?.scrollTo({
      top: 0,
      left: 0,
      behavior: 'auto',
    });
  }, [currentNav]);

  // Sync with browser navigation
  React.useEffect(() => {
    const handlePopState = () => {
      setCurrentNav(getNavFromPath());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleNavChange = (navId: string) => {
    const targetNav = navId === 'sessions' ? 'calendar' : navId;
    setCurrentNav(targetNav);
    setMobileMenuOpen(false);
    if (window.location.pathname !== `/${targetNav}`) {
      window.history.pushState(null, '', `/${targetNav}`);
    }
  };

  // Bootcamp routing state
  const [selectedBootcampId, setSelectedBootcampId] = useState<string | null>(null);
  const [bootcampTab, setBootcampTab] = useState<string>('overview');

  // Trainee routing state
  const [selectedTraineeId, setSelectedTraineeId] = useState<string | null>(null);
  const [traineeTab, setTraineeTab] = useState<string>('overview');
  const [traineeKpiFilter, setTraineeKpiFilter] = useState<'active' | 'project-ready' | 'needs-attention' | null>(null);

  // Session & Attendance routing state
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [sessionTab, setSessionTab] = useState<string>('overview');

  const { toastMessage } = useBootcamps();

  const handleNavigateFromCommandCenter = (
    navId: string,
    filter?: 'active' | 'project-ready' | 'needs-attention' | null
  ) => {
    if (filter !== undefined) {
      setTraineeKpiFilter(filter);
    } else {
      setTraineeKpiFilter(null);
    }
    handleNavChange(navId);
  };

  const handleSelectBootcamp = (bootcampId: string, initialTab: string = 'overview') => {
    setSelectedBootcampId(bootcampId);
    setBootcampTab(initialTab);
    setCurrentNav('bootcamp-details');
  };

  const handleSelectTrainee = (traineeId: string, initialTab: string = 'overview') => {
    setSelectedTraineeId(traineeId);
    setTraineeTab(initialTab);
    setCurrentNav('trainee-profile');
  };

  const handleSelectSession = (sessionId: string, initialTab: string = 'overview') => {
    setSelectedSessionId(sessionId);
    setSessionTab(initialTab);
    setCurrentNav('session-details');
  };

  const handleOpenAttendance = (sessionId: string) => {
    setSelectedSessionId(sessionId);
    setCurrentNav('attendance-record');
  };

  // Sidebar navigation highlight resolver
  const activeSidebarItem =
    currentNav === 'bootcamp-details'
      ? 'bootcamps'
      : currentNav === 'trainee-profile'
      ? 'trainees'
      : currentNav === 'session-details' || currentNav === 'attendance-record' || currentNav === 'sessions'
      ? 'calendar'
      : currentNav;

  const pageTitleMap: Record<string, string> = {
    'command-center': 'Command Center',
    'bootcamps': 'Bootcamps',
    'bootcamp-details': 'Cohort Details',
    'training': 'Training Management',
    'trainees': 'Trainees',
    'trainee-profile': 'Trainee Profile',
    'calendar': 'L&D Calendar',
    'sessions': 'L&D Calendar',
    'session-details': 'Session Details',
    'attendance-record': 'Attendance',
    'assessments': 'Assessments',
    'feedback': 'Feedback',
    'skill-intelligence': 'Skill Intelligence',
    'certifications': 'Certifications',
    'analytics': 'Analytics',
  };

  return (
    <TrainingProvider>
      <div className="app-shell-layout">
        {/* Toast Notification Banner */}
        {toastMessage && (
          <div className="global-toast-banner" role="status">
            <CheckCircle2 size={16} className="toast-icon" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Compact Mobile Top Bar Header */}
        <header className="mobile-app-header">
          <button
            type="button"
            className="mobile-hamburger-btn"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open navigation menu"
          >
            <Menu size={22} />
          </button>

          <div className="mobile-brand-title">
            <img src={systechLogo} alt="Systech" className="mobile-brand-logo" />
            <span className="mobile-page-name">{pageTitleMap[currentNav] || 'L&D Platform'}</span>
          </div>
        </header>

        {/* Left Navigation Sidebar / Mobile Drawer */}
        <Sidebar
          currentNav={activeSidebarItem}
          onSelectNav={(navId) => {
            setTraineeKpiFilter(null);
            handleNavChange(navId);
          }}
          onLogout={onLogout}
          mobileOpen={mobileMenuOpen}
          onCloseMobile={() => setMobileMenuOpen(false)}
        />

        {/* Main Viewport Content Area */}
        <main ref={mainViewportRef} className="shell-main-viewport">
          {currentNav === 'command-center' && (
            <CommandCenterView
              onNavigate={handleNavigateFromCommandCenter}
              onSelectTrainee={handleSelectTrainee}
              onSelectBootcamp={handleSelectBootcamp}
            />
          )}

          {currentNav === 'bootcamps' && (
            <BootcampManagement onSelectBootcamp={handleSelectBootcamp} />
          )}

          {currentNav === 'bootcamp-details' && selectedBootcampId && (
            <BootcampDetails
              bootcampId={selectedBootcampId}
              initialTab={bootcampTab}
              onBack={() => setCurrentNav('bootcamps')}
              onOpenRecordAttendance={handleOpenAttendance}
            />
          )}

          {currentNav === 'training' && (
            <TrainingManagement
              onNavigateToSessions={() => setCurrentNav('sessions')}
            />
          )}

          {currentNav === 'trainees' && (
            <TraineeManagement
              onSelectTrainee={handleSelectTrainee}
              initialKpiFilter={traineeKpiFilter}
            />
          )}

          {currentNav === 'trainee-profile' && selectedTraineeId && (
            <TraineeProfile
              traineeId={selectedTraineeId}
              initialTab={traineeTab}
              onBack={() => setCurrentNav('trainees')}
            />
          )}

          {(currentNav === 'calendar' || currentNav === 'sessions') && (
            <SessionManagement
              onSelectSession={handleSelectSession}
              onOpenAttendance={handleOpenAttendance}
            />
          )}

          {currentNav === 'session-details' && selectedSessionId && (
            <SessionDetails
              sessionId={selectedSessionId}
              initialTab={sessionTab}
              onBack={() => setCurrentNav('sessions')}
              onOpenAttendance={handleOpenAttendance}
            />
          )}

          {currentNav === 'attendance-record' && selectedSessionId && (
            <AttendanceManagement
              sessionId={selectedSessionId}
              onBack={() => setCurrentNav('sessions')}
            />
          )}

          {currentNav === 'assessments' && <AssessmentManagement />}

          {currentNav === 'feedback' && <FeedbackManagement />}

          {currentNav === 'skill-intelligence' && <SkillIntelligenceView />}

          {currentNav === 'certifications' && <CertificationIntelligenceView />}

          {currentNav === 'analytics' && (
            <AnalyticsView onNavigateToCommandCenter={() => setCurrentNav('command-center')} />
          )}
        </main>
      </div>
    </TrainingProvider>
  );
};
