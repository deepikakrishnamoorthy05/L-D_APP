import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { CommandCenterView } from './CommandCenterView';
import { BootcampManagement } from '../Bootcamps/BootcampManagement';
import { BootcampDetails } from '../Bootcamps/BootcampDetails';
import { TraineeManagement } from '../Trainees/TraineeManagement';
import { TraineeProfile } from '../Trainees/TraineeProfile';
import { SessionManagement } from '../Sessions/SessionManagement';
import { SessionDetails } from '../Sessions/SessionDetails';
import { AttendanceManagement } from '../Sessions/AttendanceManagement';
import { AssessmentManagement } from '../Assessments/AssessmentManagement';
import { FeedbackManagement } from '../Feedback/FeedbackManagement';
import { SkillIntelligenceView } from '../SkillIntelligence/SkillIntelligenceView';
import { CertificationIntelligenceView } from '../Certifications/CertificationIntelligenceView';
import { AnalyticsView } from '../Analytics/AnalyticsView';
import { useBootcamps } from '../../context/BootcampContext';
import { CheckCircle2 } from 'lucide-react';

interface AppShellProps {
  onLogout: () => void;
}

export const AppShell: React.FC<AppShellProps> = ({ onLogout }) => {
  const getNavFromPath = () => {
    const rawPath = window.location.pathname.replace(/^\//, '');
    const validNavs = [
      'command-center',
      'bootcamps',
      'trainees',
      'sessions',
      'assessments',
      'feedback',
      'skill-intelligence',
      'certifications',
      'analytics'
    ];
    return validNavs.includes(rawPath) ? rawPath : 'command-center';
  };

  const [currentNav, setCurrentNav] = useState<string>(getNavFromPath);

  // Sync with browser navigation (back / forward buttons)
  React.useEffect(() => {
    const handlePopState = () => {
      setCurrentNav(getNavFromPath());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleNavChange = (navId: string) => {
    setCurrentNav(navId);
    if (window.location.pathname !== `/${navId}`) {
      window.history.pushState(null, '', `/${navId}`);
    }
  };

  // Bootcamp routing state
  const [selectedBootcampId, setSelectedBootcampId] = useState<string | null>(null);
  const [bootcampTab, setBootcampTab] = useState<string>('overview');

  // Trainee routing state
  const [selectedTraineeId, setSelectedTraineeId] = useState<string | null>(null);
  const [traineeTab, setTraineeTab] = useState<string>('overview');

  // Session & Attendance routing state
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [sessionTab, setSessionTab] = useState<string>('overview');

  const { toastMessage } = useBootcamps();

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
      : currentNav === 'session-details' || currentNav === 'attendance-record'
      ? 'sessions'
      : currentNav;

  return (
    <div className="app-shell-layout">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="global-toast-banner" role="status">
          <CheckCircle2 size={16} className="toast-icon" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Left Navigation Sidebar */}
      <Sidebar
        currentNav={activeSidebarItem}
        onSelectNav={(navId) => {
          handleNavChange(navId);
        }}
        onLogout={onLogout}
      />

      {/* Main Viewport Content Area */}
      <main className="shell-main-viewport">
        {currentNav === 'command-center' && (
          <CommandCenterView />
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

        {currentNav === 'trainees' && (
          <TraineeManagement onSelectTrainee={handleSelectTrainee} />
        )}

        {currentNav === 'trainee-profile' && selectedTraineeId && (
          <TraineeProfile
            traineeId={selectedTraineeId}
            initialTab={traineeTab}
            onBack={() => setCurrentNav('trainees')}
          />
        )}

        {currentNav === 'sessions' && (
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
  );
};
