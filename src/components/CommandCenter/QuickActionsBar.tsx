import React from 'react';
import { Plus, Calendar, CheckSquare } from 'lucide-react';

interface QuickActionsBarProps {
  onNavigate?: (navId: string) => void;
}

export const QuickActionsBar: React.FC<QuickActionsBarProps> = ({ onNavigate }) => {
  return (
    <div className="exec-quick-actions-bar">
      <div className="quick-actions-label">
        <span>Quick Actions:</span>
      </div>

      <div className="quick-actions-btns">
        <button
          type="button"
          className="compact-action-btn primary-teal"
          onClick={() => onNavigate?.('trainees')}
        >
          <Plus size={14} /> Add Trainee
        </button>

        <button
          type="button"
          className="compact-action-btn secondary-subtle"
          onClick={() => onNavigate?.('sessions')}
        >
          <Calendar size={14} /> Schedule Session
        </button>

        <button
          type="button"
          className="compact-action-btn secondary-subtle"
          onClick={() => onNavigate?.('assessments')}
        >
          <CheckSquare size={14} /> Create Assessment
        </button>
      </div>
    </div>
  );
};

export default QuickActionsBar;
