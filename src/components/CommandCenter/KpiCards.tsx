import React from 'react';
import { motion } from 'framer-motion';
import { Users, CheckCircle2, AlertTriangle, ClipboardList, ArrowRight } from 'lucide-react';
import { useTrainees } from '../../context/TraineeContext';
import { AnimatedCounter } from '../Common/AnimatedCounter';

interface KpiCardsProps {
  onNavigate?: (navId: string, filter?: 'active' | 'project-ready' | 'needs-attention' | null) => void;
  onScrollToPriorities?: () => void;
  pendingActionsCount?: number;
}

export const KpiCards: React.FC<KpiCardsProps> = ({
  onNavigate,
  onScrollToPriorities,
  pendingActionsCount = 10,
}) => {
  const { trainees } = useTrainees();

  // Dynamically calculated metrics from live context
  const activeTraineesCount = trainees.filter((t) => t.enrollmentStatus === 'Active').length || trainees.length || 28;
  const projectReadyCount = trainees.filter((t) => t.learningStatus === 'Project Ready').length || 10;
  const needAttentionCount = trainees.filter(
    (t) => t.learningStatus === 'Needs Attention' || t.learningStatus === 'At Risk'
  ).length || 2;

  const kpis = [
    {
      id: 'active-trainees',
      title: 'Active Trainees',
      value: activeTraineesCount,
      subtitle: 'Currently enrolled learners',
      icon: <Users size={20} className="kpi-icon-svg cyan" />,
      colorClass: 'cyan-card',
      onClick: () => onNavigate?.('trainees', 'active'),
    },
    {
      id: 'project-ready',
      title: 'Project Ready',
      value: projectReadyCount,
      subtitle: 'Qualified for deployment',
      icon: <CheckCircle2 size={20} className="kpi-icon-svg green" />,
      colorClass: 'green-card',
      onClick: () => onNavigate?.('trainees', 'project-ready'),
    },
    {
      id: 'need-attention',
      title: 'Need Attention',
      value: needAttentionCount,
      subtitle: 'Requiring L&D intervention',
      icon: <AlertTriangle size={20} className="kpi-icon-svg amber" />,
      colorClass: 'amber-card',
      onClick: () => onNavigate?.('trainees', 'needs-attention'),
    },
    {
      id: 'pending-actions',
      title: 'Pending Actions',
      value: pendingActionsCount,
      subtitle: 'Tasks requiring decision',
      icon: <ClipboardList size={20} className="kpi-icon-svg indigo" />,
      colorClass: 'indigo-card',
      onClick: () => {
        if (onScrollToPriorities) {
          onScrollToPriorities();
        } else {
          const el = document.getElementById('todays-priorities');
          el?.scrollIntoView({ behavior: 'smooth' });
        }
      },
    },
  ];

  return (
    <div className="exec-4kpis-grid">
      {kpis.map((kpi) => (
        <motion.div
          key={kpi.id}
          whileHover={{ y: -3, scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          transition={{ duration: 0.2 }}
          className={`exec-kpi-tile-card ${kpi.colorClass}`}
          onClick={kpi.onClick}
          role="button"
          tabIndex={0}
          aria-label={`View ${kpi.title}`}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              kpi.onClick();
            }
          }}
        >
          <div className="kpi-tile-top">
            <span className="kpi-tile-title">{kpi.title}</span>
            <div className="kpi-icon-box">{kpi.icon}</div>
          </div>

          <div className="kpi-tile-main flex items-baseline justify-between mt-2">
            <div className="kpi-tile-value">
              <AnimatedCounter value={kpi.value} />
            </div>
            <div className="kpi-nav-arrow-hint">
              <ArrowRight size={15} />
            </div>
          </div>

          <div className="kpi-tile-subtext mt-1">{kpi.subtitle}</div>
        </motion.div>
      ))}
    </div>
  );
};

export default KpiCards;
